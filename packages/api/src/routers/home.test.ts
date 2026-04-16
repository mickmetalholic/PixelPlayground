import { describe, expect, it, vi } from 'vitest';
import { appRouter } from '../index';

describe('home.summary procedure', () => {
  it('returns summary from service port', async () => {
    const caller = appRouter.createCaller({
      services: {
        home: {
          getSummary: vi.fn().mockResolvedValue('Hello World!'),
        },
      },
    });

    await expect(caller.home.summary()).resolves.toEqual({
      summary: 'Hello World!',
    });
  });
});
