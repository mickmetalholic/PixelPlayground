import type { LanggraphGatewayError } from '../errors/langgraph-gateway.error';
import { LanggraphClientRepository } from '../langgraph-client.repository';

describe('LanggraphClientRepository', () => {
  const originalFetch = globalThis.fetch;
  const originalBaseUrl = process.env.LANGGRAPH_BASE_URL;

  beforeEach(() => {
    process.env.LANGGRAPH_BASE_URL = 'http://127.0.0.1:2024';
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    process.env.LANGGRAPH_BASE_URL = originalBaseUrl;
    delete process.env.LANGGRAPH_CHAT_PATH;
    delete process.env.LANGGRAPH_TIMEOUT_MS;
    jest.restoreAllMocks();
  });

  it('throws UPSTREAM_TIMEOUT when fetch aborts', async () => {
    globalThis.fetch = jest
      .fn()
      .mockRejectedValue(
        Object.assign(new Error('aborted'), { name: 'AbortError' }),
      ) as typeof fetch;

    const repository = new LanggraphClientRepository();

    await expect(
      repository.invoke({
        sessionId: 'session-1',
        requestId: 'request-1',
        message: 'hello',
      }),
    ).rejects.toMatchObject<Partial<LanggraphGatewayError>>({
      code: 'UPSTREAM_TIMEOUT',
      status: 504,
    });
  });

  it('maps 404 to SESSION_NOT_FOUND', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: 'thread not found' }),
    }) as typeof fetch;

    const repository = new LanggraphClientRepository();

    await expect(
      repository.invoke({
        sessionId: 'session-1',
        requestId: 'request-1',
        message: 'hello',
      }),
    ).rejects.toMatchObject<Partial<LanggraphGatewayError>>({
      code: 'SESSION_NOT_FOUND',
      status: 404,
    });
  });

  it('returns mapped response when upstream succeeds', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        sessionId: 'session-1',
        requestId: 'request-1',
        message: 'hello from upstream',
      }),
    }) as typeof fetch;

    const repository = new LanggraphClientRepository();

    await expect(
      repository.invoke({
        sessionId: 'session-1',
        requestId: 'request-1',
        message: 'hello',
      }),
    ).resolves.toEqual({
      sessionId: 'session-1',
      requestId: 'request-1',
      message: 'hello from upstream',
    });
  });
});
