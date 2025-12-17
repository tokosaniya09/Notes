
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
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CollaborationService } from './collaboration.service';
import { COLLAB_EVENTS } from './events/collaboration.events';
import { JoinNoteDto } from './dto/join-note.dto';
import { CursorUpdateDto } from './dto/cursor-update.dto';
import { PresenceDto } from './dto/presence.dto';
import { NotesService } from '../notes/notes.service';
import { UsersService } from '../users/users.service';
import { RemoteCursorPayload } from './dto/remote-cursor-payload.dto';
import { WsJwtGuard } from '../auth/guards/ws-jwt-guard';

// Extend Socket to include authenticated user using intersection type
type AuthenticatedSocket = Socket & {
  user: {
    id: string;
    email: string;
    firstName: string;
  };
};

@UseGuards(WsJwtGuard)
@WebSocketGateway({
  cors: {
    origin: '*', 
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
  private socketRoomMap = new Map<string, string>();

  constructor(
    private readonly collaborationService: CollaborationService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly notesService: NotesService,
    private readonly usersService: UsersService,
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
          this.server.to(msg.noteId).emit(COLLAB_EVENTS.REMOTE_CURSOR, msg.payload);
          break;
      }
    });
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
         this.logger.warn(`Client ${client.id} has no token, disconnecting.`);
         client.disconnect();
         return;
      }

      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = this.jwtService.verify(token, { secret });
      
      // CRITICAL FIX: Fetch full user details from DB to ensure firstName is present
      // The payload might only contain partial info depending on the JWT strategy
      const dbUser = await this.usersService.findById(payload.sub);

      client.user = {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName || 'User',
      };
      
      this.logger.log(`Client connected: ${client.user.firstName} (${client.id})`);
    } catch (e) {
      this.logger.warn(`Connection rejected for ${client.id}: ${e.message}`);
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
    if (!client.user) {
      client.emit('error', { message: 'Authentication required' });
      return;
    }

    const { noteId } = dto;
    
    // VERIFY ACCESS
    try {
        await this.notesService.findOne(client.user.id, noteId);
    } catch (e) {
        client.emit('error', { message: 'Access denied to this note' });
        return;
    }

    await client.join(noteId);
    this.socketRoomMap.set(client.id, noteId);

    const color = '#' + Math.floor(Math.random()*16777215).toString(16); 
    const presence: PresenceDto = {
      userId: client.user.id,
      userName: client.user.firstName,
      color: color,
      connectedAt: new Date().toISOString(),
    };

    const currentUsers = await this.collaborationService.addClientToNote(noteId, presence);
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

    // Use server-validated name
    const safePayload: RemoteCursorPayload = {
      noteId: dto.noteId,
      cursorPosition: dto.cursorPosition,
      userId: client.user.id,           
      userName: client.user.firstName,  
      color: dto.color ?? '#3b82f6',
    };

    await this.collaborationService.broadcastCursor(safePayload);
  }

  @SubscribeMessage(COLLAB_EVENTS.CLIENT_TEXT_UPDATE)
  async handleTextUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { noteId: string; content: string },
  ) {
    if (!client.user) return;

    client.to(payload.noteId).emit(COLLAB_EVENTS.REMOTE_TEXT_UPDATE, {
      userId: client.user.id,
      content: payload.content,
      timestamp: Date.now(),
    });
  }

  private extractToken(client: Socket): string | undefined {
    if (client.handshake.auth && client.handshake.auth.token) {
        return client.handshake.auth.token.replace('Bearer ', '');
    }
    const queryToken = client.handshake.query.token;
    if (typeof queryToken === 'string') {
        return queryToken.replace('Bearer ', '');
    }
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
      return authHeader.split(' ')[1];
    }
    return undefined;
  }
}
