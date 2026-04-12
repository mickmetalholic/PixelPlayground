export function getNestOriginFromEnv(): string {
  const raw = process.env.NEST_ORIGIN;
  if (!raw || raw.trim() === '') {
    throw new Error('NEST_ORIGIN is not set');
  }
  return raw.trim().replace(/\/$/, '');
}
