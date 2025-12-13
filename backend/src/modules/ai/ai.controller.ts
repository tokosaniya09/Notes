import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Sse, 
  MessageEvent 
} from '@nestjs/common';
import { AIService } from './ai.service';
import { SummarizeDto } from './dto/summarize.dto';
import { RewriteDto } from './dto/rewrite.dto';
import { AskDto } from './dto/ask.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { AIStreamService } from './streaming/ai-stream.service';
import { Observable } from 'rxjs';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(
    private readonly aiService: AIService,
    private readonly aiStreamService: AIStreamService,
  ) {}

  @Post('summarize')
  async summarize(@Body() dto: SummarizeDto) {
    return this.aiService.summarize(dto);
  }

  @Post('rewrite')
  async rewrite(@Body() dto: RewriteDto) {
    return this.aiService.rewrite(dto);
  }

  @Post('ask')
  async ask(@Body() dto: AskDto) {
    return this.aiService.ask(dto);
  }

  /**
   * Streaming Endpoint for Q&A.
   * Usage: POST /ai/stream/ask
   * Client should use EventSource (GET) or fetch with reader for POST.
   * NestJS @Sse usually maps to GET, but we can accept POST if strictly needed by standard,
   * however, EventSource natively supports GET. 
   * Since we need to pass a body (context), we use POST but returning an SSE stream.
   * 
   * Note: Native EventSource doesn't support POST bodies. 
   * Frontend will need to use `fetch-event-source` or similar library.
   */
  @Post('stream/ask')
  @Sse()
  streamAsk(@Body() dto: AskDto): Observable<MessageEvent> {
    const stream$ = this.aiService.askStream(dto);
    return this.aiStreamService.transformToSSE(stream$);
  }
}