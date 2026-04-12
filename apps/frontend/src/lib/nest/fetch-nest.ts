import { getNestUrl } from './nest-url';

export class NestUnreachableError extends Error {
  readonly code = 'NEST_UNREACHABLE' as const;
  constructor(cause: unknown) {
    super('Nest upstream unreachable');
    this.name = 'NestUnreachableError';
    this.cause = cause;
  }
}

const FETCH_TIMEOUT_MS = 10_000;

export async function fetchNest(path: string): Promise<Response> {
  const url = getNestUrl(path);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } catch (e) {
    throw new NestUnreachableError(e);
  } finally {
    clearTimeout(timeout);
  }
}
