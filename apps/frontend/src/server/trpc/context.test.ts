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
});
