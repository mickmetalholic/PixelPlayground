import { z } from 'zod';
import { createRouter, publicProcedure } from '../trpc';

const todoPreviewSchema = z.object({
  id: z.number(),
  title: z.string(),
  completed: z.boolean(),
});

const buildFallbackOutput = (prompt: string) =>
  `Fallback response (no AI provider configured): ${prompt.slice(0, 140)}`;

export const playgroundRouter = createRouter({
  todoPreview: publicProcedure.query(async () => {
    const response = await fetch(
      'https://jsonplaceholder.typicode.com/todos/1',
      {
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch todo preview: ${response.status}`);
    }

    const data: unknown = await response.json();
    return todoPreviewSchema.parse(data);
  }),

  aiComplete: publicProcedure
    .input(
      z.object({
        prompt: z.string().trim().min(1, 'Prompt is required.'),
      }),
    )
    .mutation(async ({ input }) => {
      if (!process.env.OPENAI_API_KEY) {
        return { output: buildFallbackOutput(input.prompt) };
      }

      return {
        output: `AI provider key detected. Echo preview: ${input.prompt.slice(0, 140)}`,
      };
    }),
});
