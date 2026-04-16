import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 与 pnpm monorepo 对齐，避免误选上级目录的 lockfile 作为 tracing 根
  outputFileTracingRoot: path.join(__dirname, '../..'),
  transpilePackages: ['@pixel-playground/api'],
};

export default nextConfig;
