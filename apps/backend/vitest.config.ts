import path from 'node:path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    swc.vite({
      jsc: {
        transform: {
          legacyDecorator: true,
          decoratorMetadata: true,
        },
      },
      module: {
        type: 'es6',
      },
    }),
  ],
  resolve: {
    alias: {
      superjson: path.resolve(__dirname, 'mocks/superjson.ts'),
      '@pixel-playground/api': path.resolve(
        __dirname,
        '../../packages/api/src/index.ts',
      ),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts', 'test/**/*.e2e-spec.ts'],
  },
});
