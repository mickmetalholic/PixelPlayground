import { z } from 'zod';

export const envSchema = z.object({
  NEST_ORIGIN: z.string().url().optional().default('http://127.0.0.1:3000'),
});

export type Env = z.infer<typeof envSchema>;
