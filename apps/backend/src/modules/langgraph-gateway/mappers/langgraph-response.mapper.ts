import type { ChatResponseDto } from '../dto/chat-response.dto';

type UnknownPayload = Partial<ChatResponseDto> & Record<string, unknown>;

export const mapFromLanggraphResponse = (
  payload: UnknownPayload,
  fallback: { sessionId: string; requestId: string; threadId?: string },
): ChatResponseDto => ({
  sessionId: payload.sessionId ?? fallback.sessionId,
  requestId: payload.requestId ?? fallback.requestId,
  message:
    typeof payload.message === 'string'
      ? payload.message
      : 'Upstream response missing message',
  threadId:
    typeof payload.threadId === 'string' ? payload.threadId : fallback.threadId,
});
