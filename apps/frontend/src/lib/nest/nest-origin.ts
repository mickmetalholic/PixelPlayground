const DEFAULT_NEST_ORIGIN = 'http://127.0.0.1:3000';

export function getNestOriginFromEnv(): string {
  const raw = process.env.NEST_ORIGIN ?? DEFAULT_NEST_ORIGIN;
  return raw.trim().replace(/\/$/, '');
}
