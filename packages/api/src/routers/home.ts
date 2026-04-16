import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createRouter, publicProcedure } from '../trpc';

export const homeRouter = createRouter({
  summary: publicProcedure.input(z.void()).query(async ({ ctx }) => {
    try {
      const summary = await ctx.services.home.getSummary();
      return { summary };
    } catch {
      throw new TRPCError({
        code: 'SERVICE_UNAVAILABLE',
        message: 'Nest upstream unreachable',
      });
    }
  }),
});
