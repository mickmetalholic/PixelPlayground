import { Injectable } from '@nestjs/common';
import type { ChatResponseDto } from './dto/chat-response.dto';
import { LanggraphGatewayError } from './errors/langgraph-gateway.error';
import { mapToLanggraphRequest } from './mappers/langgraph-request.mapper';
import { mapFromLanggraphResponse } from './mappers/langgraph-response.mapper';

export type InvokeLanggraphInput = {
  sessionId: string;
  requestId: string;
  message: string;
  threadId?: string;
};

@Injectable()
export class LanggraphClientRepository {
  async invoke(input: InvokeLanggraphInput): Promise<ChatResponseDto> {
    const baseUrl = process.env.LANGGRAPH_BASE_URL ?? 'http://127.0.0.1:2024';
    const chatPath = process.env.LANGGRAPH_CHAT_PATH ?? '/langgraph/chat';
    const timeoutMs = Number(process.env.LANGGRAPH_TIMEOUT_MS ?? 15000);
    const endpoint = new URL(chatPath, baseUrl);
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(mapToLanggraphRequest(input)),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw this.mapHttpError(response.status);
      }

      const payload = (await response.json()) as Record<string, unknown>;
      return mapFromLanggraphResponse(payload, {
        sessionId: input.sessionId,
        requestId: input.requestId,
        threadId: input.threadId,
      });
    } catch (error) {
      if (error instanceof LanggraphGatewayError) {
        throw error;
      }

      const name = (error as { name?: string } | undefined)?.name;
      if (name === 'AbortError') {
        throw new LanggraphGatewayError(
          'UPSTREAM_TIMEOUT',
          'LangGraph upstream request timed out',
          504,
        );
      }

      throw new LanggraphGatewayError(
        'UPSTREAM_UNAVAILABLE',
        'LangGraph upstream is unavailable',
        503,
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  private mapHttpError(status: number): LanggraphGatewayError {
    if (status === 404) {
      return new LanggraphGatewayError(
        'SESSION_NOT_FOUND',
        'Session not found in LangGraph upstream',
        404,
      );
    }

    if (status >= 500) {
      return new LanggraphGatewayError(
        'UPSTREAM_UNAVAILABLE',
        'LangGraph upstream returned server error',
        502,
      );
    }

    return new LanggraphGatewayError(
      'UPSTREAM_BAD_RESPONSE',
      `LangGraph upstream returned unexpected status: ${status}`,
      502,
    );
  }
}
