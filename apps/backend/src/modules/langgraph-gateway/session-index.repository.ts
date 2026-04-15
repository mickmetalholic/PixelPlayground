import { Injectable } from '@nestjs/common';
import type { ChatResponseDto } from './dto/chat-response.dto';

@Injectable()
export class SessionIndexRepository {
  private readonly sessionToThread = new Map<string, string>();
  private readonly requestToResponse = new Map<string, ChatResponseDto>();

  async getThreadId(sessionId: string): Promise<string | null> {
    return this.sessionToThread.get(sessionId) ?? null;
  }

  async saveThreadId(sessionId: string, threadId: string): Promise<void> {
    this.sessionToThread.set(sessionId, threadId);
  }

  async getResponseByRequestId(
    requestId: string,
  ): Promise<ChatResponseDto | null> {
    return this.requestToResponse.get(requestId) ?? null;
  }

  async saveResponseByRequestId(
    requestId: string,
    response: ChatResponseDto,
  ): Promise<void> {
    this.requestToResponse.set(requestId, response);
  }
}
