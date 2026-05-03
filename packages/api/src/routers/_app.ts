import { createRouter } from '../trpc.ts';
import { homeRouter } from './home.ts';
import { playgroundRouter } from './playground.ts';

export const appRouter = createRouter({
  home: homeRouter,
  playground: playgroundRouter,
});

export type AppRouter = typeof appRouter;
