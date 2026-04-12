import { getNestOriginFromEnv } from './nest-origin';

/**
 * 纯函数：拼接 origin 与 path，单测不依赖环境变量。
 */
export function joinOriginAndPath(origin: string, path: string): string {
  const base = origin.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

/**
 * 基于 NEST_ORIGIN 与 path 构造 Nest 请求 URL。
 */
export function getNestUrl(path: string): string {
  return joinOriginAndPath(getNestOriginFromEnv(), path);
}
