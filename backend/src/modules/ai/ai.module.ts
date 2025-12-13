import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { GeminiProvider } from './providers/gemini.provider';
import { FallbackProvider } from './providers/fallback.provider';
import { AIStreamService } from './streaming/ai-stream.service';

@Module({
  imports: [ConfigModule],
  controllers: [AIController],
  providers: [
    AIService,
    AIStreamService,
    {
      provide: 'AI_PROVIDER',
      useClass: GeminiProvider, // Swappable: Change to FallbackProvider for offline dev
    },
  ],
  exports: [AIService],
})
export class AIModule {}