import { describe, expect, it } from 'vitest';
import { normalizeAiError } from './playground-ai-client';

describe('normalizeAiError', () => {
  it('returns error message for Error instance', () => {
    expect(normalizeAiError(new Error('boom'))).toBe('boom');
  });

  it('returns fallback text for unknown values', () => {
    expect(normalizeAiError({})).toBe('Unknown AI request error.');
  });
});
