import { z } from 'zod';

export const envSchema = z.object({
  PORT: z
    .string()
    .optional()
    .default('3000')
    .transform((v) => Number(v))
    .pipe(z.number().int().min(1).max(65535)),
  LANGGRAPH_BASE_URL: z
    .string()
    .url()
    .optional()
    .default('http://127.0.0.1:2024'),
  LANGGRAPH_CHAT_PATH: z.string().optional().default('/langgraph/chat'),
  LANGGRAPH_TIMEOUT_MS: z
    .string()
    .optional()
    .default('15000')
    .transform((v) => Number(v))
    .pipe(z.number().int().positive()),
});

export type Env = z.infer<typeof envSchema>;
