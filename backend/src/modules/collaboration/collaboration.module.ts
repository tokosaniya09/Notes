
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CollaborationService } from './collaboration.service';
import { CollaborationGateway } from './collaboration.gateway';
import { RedisModule } from '../../redis/redis.module';
import { AuthModule } from '../auth/auth.module';
import { NotesModule } from '../notes/notes.module';
import { UsersModule } from '../users/users.module';
import { WsJwtGuard } from '../auth/guards/ws-jwt-guard';

@Module({
  imports: [
    RedisModule,
    AuthModule,
    NotesModule,
    UsersModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [CollaborationGateway, CollaborationService, WsJwtGuard],
  exports: [CollaborationService],
})
export class CollaborationModule {}
