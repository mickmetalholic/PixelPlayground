export type TrpcPanelConfig = Readonly<{
  enabled: boolean;
  trpcUrl: string | null;
}>;

const parseBooleanFlag = (value: string | undefined): boolean | null => {
  if (value == null) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') {
    return true;
  }

  if (normalized === 'false') {
    return false;
  }

  return null;
};

const normalizeUrlOverride = (value: string | undefined): string | null => {
  if (value == null) {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

export const resolveTrpcPanelConfig = (
  env: NodeJS.ProcessEnv,
): TrpcPanelConfig => {
  const enabledOverride = parseBooleanFlag(env.TRPC_PANEL_ENABLED);
  const enabledByDefault = env.NODE_ENV !== 'production';

  return {
    enabled: enabledOverride ?? enabledByDefault,
    trpcUrl: normalizeUrlOverride(env.TRPC_PANEL_TRPC_URL),
  };
};
