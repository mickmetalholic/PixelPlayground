import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { ChatRequestDto } from './dto/chat-request.dto';
import type { ChatResponseDto } from './dto/chat-response.dto';
import type { LanggraphClientRepository } from './langgraph-client.repository';
import type { SessionIndexRepository } from './session-index.repository';

@Injectable()
export class LanggraphGatewayService {
  constructor(
    private readonly repository: LanggraphClientRepository,
    private readonly sessionIndex: SessionIndexRepository,
  ) {}

  async chat(input: ChatRequestDto): Promise<ChatResponseDto> {
    const sessionId = input.sessionId ?? randomUUID();
    const requestId = input.requestId ?? randomUUID();
    const cached = await this.sessionIndex.getResponseByRequestId(requestId);
    if (cached) {
      return cached;
    }
    const threadId = await this.sessionIndex.getThreadId(sessionId);

    const response = await this.repository.invoke({
      sessionId,
      requestId,
      message: input.message,
      threadId: threadId ?? undefined,
    });

    if (response.threadId) {
      await this.sessionIndex.saveThreadId(sessionId, response.threadId);
    }
    await this.sessionIndex.saveResponseByRequestId(requestId, response);

    return response;
  }
}
