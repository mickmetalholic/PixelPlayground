import { resolveTrpcPanelConfig } from '../trpc-panel.config';

describe('resolveTrpcPanelConfig', () => {
  it('disables panel by default in production', () => {
    const config = resolveTrpcPanelConfig({
      NODE_ENV: 'production',
    } as NodeJS.ProcessEnv);

    expect(config.enabled).toBe(false);
  });

  it('enables panel by default outside production', () => {
    const config = resolveTrpcPanelConfig({
      NODE_ENV: 'development',
    } as NodeJS.ProcessEnv);

    expect(config.enabled).toBe(true);
  });

  it('applies explicit boolean override', () => {
    const enabledConfig = resolveTrpcPanelConfig({
      NODE_ENV: 'production',
      TRPC_PANEL_ENABLED: 'true',
    } as NodeJS.ProcessEnv);

    const disabledConfig = resolveTrpcPanelConfig({
      NODE_ENV: 'development',
      TRPC_PANEL_ENABLED: 'false',
    } as NodeJS.ProcessEnv);

    expect(enabledConfig.enabled).toBe(true);
    expect(disabledConfig.enabled).toBe(false);
  });

  it('parses explicit tRPC URL override', () => {
    const config = resolveTrpcPanelConfig({
      TRPC_PANEL_TRPC_URL: 'https://example.com/trpc',
    } as NodeJS.ProcessEnv);

    expect(config.trpcUrl).toBe('https://example.com/trpc');
  });
});
