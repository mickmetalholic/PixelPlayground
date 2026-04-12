# Pixel Playground

pnpm + Turborepo monorepo（`apps/backend` NestJS，`apps/frontend` Next.js）。

## Local: Nest（3000）+ Next（7000）

1. 复制 `apps/frontend/.env.example` 为 `apps/frontend/.env.local`（勿提交机密）。
2. 终端 A：`pnpm --filter @pixel-playground/backend dev`（监听 3000）。
3. 终端 B：`pnpm --filter @pixel-playground/frontend dev`（监听 7000）。
4. 浏览器打开 `http://localhost:7000`，首页通过同源 `/api/home/summary` BFF 拉取 Nest `GET /` 的文本。

也可在仓库根执行 `pnpm dev`，由 Turbo 并行启动各包 `dev`（仍需事先配置 `apps/frontend/.env.local` 中的 `NEST_ORIGIN`）。
