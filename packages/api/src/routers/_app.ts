import { createRouter } from '../trpc';
import { homeRouter } from './home';
import { playgroundRouter } from './playground';
import { steamRouter } from './steam';

export const appRouter = createRouter({
  home: homeRouter,
  playground: playgroundRouter,
  steam: steamRouter,
});

export type AppRouter = typeof appRouter;
