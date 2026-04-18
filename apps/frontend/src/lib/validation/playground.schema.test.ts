import { describe, expect, it } from 'vitest';
import { playgroundFormSchema } from './playground.schema';

describe('playgroundFormSchema', () => {
  it('rejects invalid payload', () => {
    const result = playgroundFormSchema.safeParse({
      name: 'a',
      message: 'short',
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid payload', () => {
    const result = playgroundFormSchema.safeParse({
      name: 'Pixel',
      message: 'This message is long enough.',
    });
    expect(result.success).toBe(true);
  });
});
