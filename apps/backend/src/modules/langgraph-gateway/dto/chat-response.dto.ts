export class ChatResponseDto {
  sessionId!: string;
  requestId!: string;
  message!: string;
  threadId?: string;
}
