export type LanggraphGatewayErrorCode =
  | 'UPSTREAM_TIMEOUT'
  | 'SESSION_NOT_FOUND'
  | 'UPSTREAM_UNAVAILABLE'
  | 'UPSTREAM_BAD_RESPONSE';

export class LanggraphGatewayError extends Error {
  constructor(
    public readonly code: LanggraphGatewayErrorCode,
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}
