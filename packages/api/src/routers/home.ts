import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createRouter, publicProcedure } from '../trpc';

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isUpstreamUnreachableError = (error: unknown): boolean => {
  if (!isObject(error)) {
    return false;
  }

  const code = error.code;
  const message = error.message;

  if (
    typeof code === 'string' &&
    ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT'].includes(code)
  ) {
    return true;
  }

  return (
    typeof message === 'string' &&
    /fetch failed|network|timed out|unreachable/i.test(message)
  );
};

export const homeRouter = createRouter({
  summary: publicProcedure.input(z.void()).query(async ({ ctx }) => {
    try {
      const summary = await ctx.services.home.getSummary();
      return { summary };
    } catch (error) {
      if (!isUpstreamUnreachableError(error)) {
        throw error;
      }

      throw new TRPCError({
        code: 'SERVICE_UNAVAILABLE',
        message: 'Nest upstream unreachable',
      });
    }
  }),
});
