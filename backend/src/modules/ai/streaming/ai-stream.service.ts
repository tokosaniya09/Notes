import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class AIStreamService {
  /**
   * Transforms a raw string stream into a Server-Sent Events (SSE) stream.
   * NestJS @Sse expects an Observable<MessageEvent>.
   */
  transformToSSE(stream$: Observable<string>): Observable<MessageEvent> {
    return stream$.pipe(
      map((textChunk) => ({
        data: { text: textChunk },
      } as MessageEvent)),
    );
  }
}