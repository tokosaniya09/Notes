import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { envValidationSchema } from './common/config/env.validation';
import { winstonConfig } from './common/logger/winston.config';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { NotesModule } from './modules/notes/notes.module';
import { CollaborationModule } from './modules/collaboration/collaboration.module';
import { AIModule } from './modules/ai/ai.module';
import { BillingModule } from './modules/billing/billing.module';

@Module({
  imports: [
    // 1. Configuration Layer
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      cache: true,
    }),

    // 2. Logging Layer
    WinstonModule.forRoot(winstonConfig),

    // 3. Infrastructure Layer
    DatabaseModule,
    RedisModule,

    // 4. Feature Modules
    HealthModule,
    UsersModule,
    AuthModule,
    NotesModule,
    CollaborationModule,
    AIModule,
    BillingModule,
  ],
})
export class AppModule {}