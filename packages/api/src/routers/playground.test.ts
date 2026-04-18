import { describe, expect, it, vi } from 'vitest';
import { appRouter } from '../index.js';

describe('playground procedures', () => {
  const baseCtx = {
    services: {
      home: {
        getSummary: vi.fn(),
      },
    },
  };

  it('todoPreview returns parsed todo', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 1,
          title: 'delectus aut autem',
          completed: false,
        }),
      }),
    );

    const caller = appRouter.createCaller(baseCtx);
    await expect(caller.playground.todoPreview()).resolves.toEqual({
      id: 1,
      title: 'delectus aut autem',
      completed: false,
    });

    vi.unstubAllGlobals();
  });

  it('aiComplete returns fallback when OPENAI_API_KEY is unset', async () => {
    const prev = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    const caller = appRouter.createCaller(baseCtx);
    await expect(
      caller.playground.aiComplete({ prompt: 'hello world' }),
    ).resolves.toMatchObject({
      output: expect.stringContaining('Fallback response'),
    });

    process.env.OPENAI_API_KEY = prev;
  });
});
