import { createRouter } from '../trpc.ts';
import { homeRouter } from './home.ts';
import { playgroundRouter } from './playground.ts';
import { steamRouter } from './steam.ts';

export const appRouter = createRouter({
  home: homeRouter,
  playground: playgroundRouter,
  steam: steamRouter,
});

export type AppRouter = typeof appRouter;
