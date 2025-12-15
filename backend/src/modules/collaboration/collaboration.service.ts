
import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { COLLAB_EVENTS } from './events/collaboration.events';
import { PresenceDto } from './dto/presence.dto';
import { Subject } from 'rxjs';
import Redis from 'ioredis';
import { RemoteCursorPayload } from './dto/remote-cursor-payload.dto';

export interface CollaborationMessage {
  type: 'USER_JOINED' | 'USER_LEFT' | 'CURSOR_UPDATE';
  noteId: string;
  payload: any;
  sourceInstanceId: string; // To prevent echoing back to self if needed
}

@Injectable()
export class CollaborationService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CollaborationService.name);
  private subscriberClient: Redis;
  private publisherClient: Redis;
  
  // Instance ID to track source of messages (simple random string)
  private readonly instanceId = Math.random().toString(36).substring(7);

  // Observable stream to pass Redis messages to the Gateway
  public readonly messages$ = new Subject<CollaborationMessage>();

  constructor(private readonly redisService: RedisService) {}

  onModuleInit() {
    this.logger.log(`Initializing Collaboration Service (Instance: ${this.instanceId})`);
    
    // We need dedicated clients for Pub/Sub logic
    // Reuse connection config from RedisService but create new instances because
    // a client in subscriber mode cannot issue commands.
    const mainClient = this.redisService.getClient();
    // Duplicate the connection options for a new connection
    this.subscriberClient = mainClient.duplicate();
    this.publisherClient = mainClient.duplicate();

    this.subscriberClient.subscribe(COLLAB_EVENTS.REDIS_CHANNEL, (err, count) => {
      if (err) this.logger.error('Failed to subscribe to collaboration channel', err);
      else this.logger.log(`Subscribed to ${COLLAB_EVENTS.REDIS_CHANNEL}`);
    });

    this.subscriberClient.on('message', (channel, message) => {
      if (channel === COLLAB_EVENTS.REDIS_CHANNEL) {
        this.handleRedisMessage(message);
      }
    });
  }

  onModuleDestroy() {
    this.subscriberClient.disconnect();
    this.publisherClient.disconnect();
  }

  private handleRedisMessage(rawMessage: string) {
    try {
      const message: CollaborationMessage = JSON.parse(rawMessage);
      // Pass to Gateway
      this.messages$.next(message);
    } catch (e) {
      this.logger.error('Failed to parse Redis message', e);
    }
  }

  private async publishEvent(type: CollaborationMessage['type'], noteId: string, payload: any) {
    const message: CollaborationMessage = {
      type,
      noteId,
      payload,
      sourceInstanceId: this.instanceId,
    };
    await this.publisherClient.publish(COLLAB_EVENTS.REDIS_CHANNEL, JSON.stringify(message));
  }

  /**
   * PRESENCE MANAGEMENT
   * Stored in Redis Set: note:{noteId}:users
   * User Metadata stored in Redis Key: presence:{noteId}:{userId} (with TTL)
   */

  async addClientToNote(noteId: string, user: PresenceDto) {
    const presenceKey = `presence:${noteId}:${user.userId}`;
    const setKey = `note:${noteId}:users`;

    // 1. Store user metadata (Expires in 24h to clean up stale data eventually)
    await this.publisherClient.setex(presenceKey, 86400, JSON.stringify(user));
    
    // 2. Add to Set
    await this.publisherClient.sadd(setKey, user.userId);

    // 3. Broadcast globally
    await this.publishEvent('USER_JOINED', noteId, user);

    return this.getNotePresence(noteId);
  }

  async removeClientFromNote(noteId: string, userId: string) {
    const presenceKey = `presence:${noteId}:${userId}`;
    const setKey = `note:${noteId}:users`;

    // 1. Remove from Set
    await this.publisherClient.srem(setKey, userId);
    
    // 2. Remove Metadata
    await this.publisherClient.del(presenceKey);

    // 3. Broadcast globally
    await this.publishEvent('USER_LEFT', noteId, { userId });
  }

  async getNotePresence(noteId: string): Promise<PresenceDto[]> {
    const setKey = `note:${noteId}:users`;
    
    // Get all user IDs
    const userIds = await this.publisherClient.smembers(setKey);
    if (userIds.length === 0) return [];

    // Fetch all metadata in parallel
    // Note: If a user disconnected ungracefully, the key might still exist until TTL or cleanup logic.
    // For production, we'd implement a heartbeat.
    const pipeline = this.publisherClient.pipeline();
    userIds.forEach(uid => pipeline.get(`presence:${noteId}:${uid}`));
    
    const results = await pipeline.exec();
    
    const users: PresenceDto[] = [];
    results?.forEach((result) => {
      const [err, data] = result;
      if (!err && data && typeof data === 'string') {
        users.push(JSON.parse(data));
      }
    });

    return users;
  }

  async broadcastCursor(payload: RemoteCursorPayload) {
    await this.publishEvent(
      'CURSOR_UPDATE',
      payload.noteId,
      payload
    );
  }

}
