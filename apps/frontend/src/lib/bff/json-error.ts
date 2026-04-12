import { NextResponse } from 'next/server';

export type BffErrorBody = {
  message: string;
  code: string;
};

export function jsonErrorResponse(
  status: 500 | 502 | 503 | 504,
  body: BffErrorBody,
): NextResponse<BffErrorBody> {
  return NextResponse.json(body, { status });
}
