import { createRouter } from '../trpc';
import { homeRouter } from './home';

export const appRouter = createRouter({
  home: homeRouter,
});

export type AppRouter = typeof appRouter;
