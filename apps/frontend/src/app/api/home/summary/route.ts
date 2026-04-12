import { NextResponse } from 'next/server';
import { jsonErrorResponse } from '@/lib/bff/json-error';
import { fetchNest, NestUnreachableError } from '@/lib/nest/fetch-nest';
import { getNestOriginFromEnv } from '@/lib/nest/nest-origin';

export async function GET() {
  try {
    getNestOriginFromEnv();
  } catch {
    return jsonErrorResponse(500, {
      code: 'NEST_ORIGIN_MISSING',
      message: 'Server misconfiguration: NEST_ORIGIN is not set',
    });
  }

  try {
    const upstream = await fetchNest('/');
    if (!upstream.ok) {
      return NextResponse.json(
        {
          code: 'NEST_HTTP_ERROR',
          message: 'Nest returned an error',
          upstreamStatus: upstream.status,
        },
        { status: upstream.status },
      );
    }
    const summary = await upstream.text();
    return NextResponse.json({ summary });
  } catch (e) {
    if (e instanceof NestUnreachableError) {
      return jsonErrorResponse(503, {
        code: 'NEST_UNREACHABLE',
        message: 'Nest upstream unreachable',
      });
    }
    return jsonErrorResponse(500, {
      code: 'BFF_INTERNAL_ERROR',
      message: 'Unexpected BFF error',
    });
  }
}
