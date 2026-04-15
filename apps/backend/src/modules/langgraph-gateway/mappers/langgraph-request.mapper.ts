import type { InvokeLanggraphInput } from '../langgraph-client.repository';

export type LanggraphRequestBody = {
  sessionId: string;
  requestId: string;
  message: string;
  threadId?: string;
};

export const mapToLanggraphRequest = (
  input: InvokeLanggraphInput,
): LanggraphRequestBody => ({
  sessionId: input.sessionId,
  requestId: input.requestId,
  message: input.message,
  threadId: input.threadId,
});
