import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import type { AppContext } from './context';

const t = initTRPC.context<AppContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const publicProcedure = t.procedure;
