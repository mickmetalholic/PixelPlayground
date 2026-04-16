import { TRPCError } from '@trpc/server';
import { describe, expect, it, vi } from 'vitest';
import { appRouter } from '../index.js';

describe('home.summary procedure', () => {
  it('returns summary from service port', async () => {
    const getSummary = vi.fn().mockResolvedValue('Hello World!');
    const caller = appRouter.createCaller({
      services: {
        home: {
          getSummary,
        },
      },
    });

    await expect(caller.home.summary()).resolves.toEqual({
      summary: 'Hello World!',
    });
    expect(getSummary).toHaveBeenCalledTimes(1);
  });

  it('maps network-like errors to SERVICE_UNAVAILABLE', async () => {
    const caller = appRouter.createCaller({
      services: {
        home: {
          getSummary: vi
            .fn()
            .mockRejectedValue(new Error('network unreachable from upstream')),
        },
      },
    });

    await expect(caller.home.summary()).rejects.toBeInstanceOf(TRPCError);
    await expect(caller.home.summary()).rejects.toMatchObject({
      code: 'SERVICE_UNAVAILABLE',
      message: 'Nest upstream unreachable',
    });
  });

  it('rethrows unknown errors unchanged', async () => {
    const unknownError = new Error('boom');
    const caller = appRouter.createCaller({
      services: {
        home: {
          getSummary: vi.fn().mockRejectedValue(unknownError),
        },
      },
    });

    await expect(caller.home.summary()).rejects.toBe(unknownError);
  });
});
