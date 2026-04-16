import type { AppRouter } from '@pixel-playground/api';

export const loadAppRouter = async (): Promise<AppRouter> => {
  const { appRouter } = await import('@pixel-playground/api');
  return appRouter;
};
