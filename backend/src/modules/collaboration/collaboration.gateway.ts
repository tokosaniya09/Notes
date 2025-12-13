import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CollaborationService } from './collaboration.service';
import { COLLAB_EVENTS } from './events/collaboration.events';
import { JoinNoteDto } from './dto/join-note.dto';
import { CursorUpdateDto } from './dto/cursor-update.dto';
import { PresenceDto } from './dto/presence.dto';

// Extend Socket to include authenticated user using intersection type
type AuthenticatedSocket = Socket & {
  user: {
    id: string;
    email: string;
    firstName: string;
  };
};

@WebSocketGateway({
  cors: {
    origin: '*', // Restrict in production
  },
  namespace: 'collaboration',
})
export class CollaborationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CollaborationGateway.name);

  // Track which room a socket is in to handle disconnects efficiently
  // Map<SocketID, NoteID>
  private socketRoomMap = new Map<string, string>();

  constructor(
    private readonly collaborationService: CollaborationService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    // Subscribe to Redis events from the service and broadcast to local clients
    this.collaborationService.messages$.subscribe((msg) => {
      switch (msg.type) {
        case 'USER_JOINED':
          this.server.to(msg.noteId).emit(COLLAB_EVENTS.USER_JOINED, msg.payload);
          break;
        case 'USER_LEFT':
          this.server.to(msg.noteId).emit(COLLAB_EVENTS.USER_LEFT, msg.payload);
          break;
        case 'CURSOR_UPDATE':
          // Exclude the sender if possible, but broadcast is simpler. 
          // Frontend should filter out its own updates based on User ID.
          this.server.to(msg.noteId).emit(COLLAB_EVENTS.REMOTE_CURSOR, msg.payload);
          break;
      }
    });
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = this.extractToken(client);
      if (!token) throw new UnauthorizedException('No token provided');

      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = this.jwtService.verify(token, { secret });
      
      // Attach user to socket
      client.user = {
        id: payload.sub,
        email: payload.email,
        firstName: payload.firstName || 'User', // Fallback
      };
      
      this.logger.log(`Client connected: ${client.user.id}`);
    } catch (e) {
      this.logger.warn(`Connection rejected: ${e.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    const noteId = this.socketRoomMap.get(client.id);
    if (noteId && client.user) {
      await this.collaborationService.removeClientFromNote(noteId, client.user.id);
      this.socketRoomMap.delete(client.id);
    }
  }

  @SubscribeMessage(COLLAB_EVENTS.JOIN_ROOM)
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() dto: JoinNoteDto,
  ) {
    if (!client.user) return; // Should be handled by connection guard logic

    const { noteId } = dto;
    
    // 1. Join Socket.IO Room (Local instance awareness)
    await client.join(noteId);
    this.socketRoomMap.set(client.id, noteId);

    // 2. Create Presence Object
    // Generate a consistent color based on user ID or random
    const color = '#' + Math.floor(Math.random()*16777215).toString(16); 
    const presence: PresenceDto = {
      userId: client.user.id,
      userName: client.user.firstName,
      color: color,
      connectedAt: new Date().toISOString(),
    };

    // 3. Register with Redis (Global awareness)
    const currentUsers = await this.collaborationService.addClientToNote(noteId, presence);

    // 4. Send initial state to the joining client
    client.emit(COLLAB_EVENTS.PRESENCE_SYNC, currentUsers);
  }

  @SubscribeMessage(COLLAB_EVENTS.LEAVE_ROOM)
  async handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() dto: JoinNoteDto,
  ) {
    if (!client.user) return;
    
    await client.leave(dto.noteId);
    this.socketRoomMap.delete(client.id);
    await this.collaborationService.removeClientFromNote(dto.noteId, client.user.id);
  }

  @SubscribeMessage(COLLAB_EVENTS.CLIENT_CURSOR)
  async handleCursorUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() dto: CursorUpdateDto,
  ) {
    if (!client.user) return;

    // Sanitize/Enforce User ID on the payload
    const safePayload: CursorUpdateDto = {
        ...dto,
        userName: client.user.firstName, // Trust token over payload
    };

    // Send to Redis so other instances get it
    await this.collaborationService.broadcastCursor(safePayload);
  }

  private extractToken(client: Socket): string | undefined {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
      return authHeader.split(' ')[1];
    }
    const queryToken = client.handshake.query.token;
    if (typeof queryToken === 'string') {
        return queryToken;
    }
    return undefined;
  }
}