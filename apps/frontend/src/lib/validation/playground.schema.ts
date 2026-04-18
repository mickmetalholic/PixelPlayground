import { z } from 'zod';

export const playgroundFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters.'),
});

export type PlaygroundFormInput = z.infer<typeof playgroundFormSchema>;
