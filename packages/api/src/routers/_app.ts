import { createRouter } from '../trpc';
import { homeRouter } from './home';
import { playgroundRouter } from './playground';

export const appRouter = createRouter({
  home: homeRouter,
  playground: playgroundRouter,
});

export type AppRouter = typeof appRouter;
