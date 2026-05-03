import { appRouter } from '@pixel-playground/api';
import { describe, expect, it, vi } from 'vitest';
import { createFrontendTrpcContext } from './context';

describe('createFrontendTrpcContext', () => {
  it('maps backend client to home service port', async () => {
    const client = {
      home: {
        summary: {
          query: vi.fn().mockResolvedValue({ summary: 'Hello World!' }),
        },
      },
    };

    const ctx = await createFrontendTrpcContext(client as never);

    await expect(ctx.services.home.getSummary()).resolves.toBe('Hello World!');
  });

  it('falls back to mock data when NEST_ORIGIN is not available', async () => {
    const createBackendClient = vi.fn(() => {
      throw new Error('Steam metadata should not create a backend tRPC client');
    });
    const getNestOrigin = vi.fn(() => {
      throw new Error('NEST_ORIGIN is not set');
    });

    const ctx = await createFrontendTrpcContext(undefined, {
      createBackendClient: createBackendClient as never,
      getNestOrigin,
    });
    const caller = appRouter.createCaller(ctx);

    const list = await caller.steam.games({ q: '1091500' });
    const detail = await caller.steam.detail({ steamId: '1091500' });

    expect(list.items[0]?.steamId).toBe('1091500');
    expect(detail.steamId).toBe('1091500');
    expect(createBackendClient).not.toHaveBeenCalled();
  });
});
