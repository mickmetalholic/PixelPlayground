import { NotFoundException } from '@nestjs/common';
import { renderTrpcPanel } from 'trpc-panel';
import { TrpcPanelService } from '../trpc-panel.service';

vi.mock('trpc-panel', () => ({
  renderTrpcPanel: vi.fn(() => '<html>panel</html>'),
}));

describe('TrpcPanelService', () => {
  const service = new TrpcPanelService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws NotFoundException when panel is disabled', () => {
    expect(() =>
      service.render({
        origin: 'http://localhost:3000',
        env: { TRPC_PANEL_ENABLED: 'false' } as NodeJS.ProcessEnv,
      }),
    ).toThrow(NotFoundException);
  });

  it('uses explicit TRPC_PANEL_TRPC_URL when configured', () => {
    service.render({
      origin: 'http://localhost:3000',
      env: {
        TRPC_PANEL_ENABLED: 'true',
        TRPC_PANEL_TRPC_URL: 'https://example.com/trpc',
      } as NodeJS.ProcessEnv,
    });

    expect(renderTrpcPanel).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        url: 'https://example.com/trpc',
        transformer: 'superjson',
      }),
    );
  });

  it('falls back to request origin when override is missing', () => {
    service.render({
      origin: 'http://localhost:3000',
      env: { TRPC_PANEL_ENABLED: 'true' } as NodeJS.ProcessEnv,
    });

    expect(renderTrpcPanel).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        url: 'http://localhost:3000/trpc',
        transformer: 'superjson',
      }),
    );
  });
});
