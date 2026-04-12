import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

describe('GET /api/home/summary', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete process.env.NEST_ORIGIN;
  });

  it('returns 200 and summary text from Nest', async () => {
    process.env.NEST_ORIGIN = 'http://127.0.0.1:3000';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('Hello World!', { status: 200 })),
    );
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ summary: 'Hello World!' });
  });

  it('returns 503 when Nest is unreachable', async () => {
    process.env.NEST_ORIGIN = 'http://127.0.0.1:3000';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('fetch failed')),
    );
    const res = await GET();
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.code).toBe('NEST_UNREACHABLE');
  });
});
