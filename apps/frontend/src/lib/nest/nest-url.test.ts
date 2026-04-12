import { describe, expect, it } from 'vitest';
import { joinOriginAndPath } from './nest-url';

describe('joinOriginAndPath', () => {
  it('joins origin and path without duplicate slashes', () => {
    expect(joinOriginAndPath('http://127.0.0.1:3000', '/')).toBe(
      'http://127.0.0.1:3000/',
    );
    expect(joinOriginAndPath('http://127.0.0.1:3000/', '/')).toBe(
      'http://127.0.0.1:3000/',
    );
    expect(joinOriginAndPath('http://127.0.0.1:3000', 'v1/x')).toBe(
      'http://127.0.0.1:3000/v1/x',
    );
  });
});
