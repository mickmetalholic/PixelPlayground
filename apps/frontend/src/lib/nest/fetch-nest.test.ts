import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchNest } from './fetch-nest';

describe('fetchNest', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete process.env.NEST_ORIGIN;
  });

  it('returns response on success', async () => {
    process.env.NEST_ORIGIN = 'http://127.0.0.1:3000';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('ok', { status: 200 })),
    );
    const res = await fetchNest('/');
    expect(res.status).toBe(200);
  });

  it('throws NestUnreachableError on network failure', async () => {
    process.env.NEST_ORIGIN = 'http://127.0.0.1:3000';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('fetch failed')),
    );
    await expect(fetchNest('/')).rejects.toMatchObject({
      code: 'NEST_UNREACHABLE',
    });
  });
});
