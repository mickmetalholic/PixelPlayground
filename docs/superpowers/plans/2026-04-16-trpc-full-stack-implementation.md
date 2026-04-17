# Full-stack tRPC Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `apps/frontend` 与 `apps/backend` 的主链路通信迁移为 tRPC，落地单一 `AppRouter` 共享契约，实现浏览器、Next 服务端、Nest 三端端到端类型安全。

**Architecture:** 新增 `packages/api` 承载框架无关的 `appRouter`、`Context` 和 procedure；Next 仅暴露同源 `/api/trpc` 并通过内网 tRPC 客户端调用 Nest；Nest 暴露内网 `/trpc` 并将现有业务服务通过 context 端口注入。旧的用例级 REST BFF 与示例 HTTP 工具删除。

**Tech Stack:** tRPC (`@trpc/server`, `@trpc/client`, `@trpc/react-query`, `@trpc/tanstack-react-query`), TanStack Query, Zod, SuperJSON, Next.js App Router, NestJS + Express adapter, Vitest, Jest, pnpm workspaces, Turborepo.

---

## 文件结构（先锁定边界）

| 路径 | 职责 |
|------|------|
| `packages/api/package.json` | 共享契约包，导出 `AppRouter`、`Context`、procedures |
| `packages/api/src/context.ts` | 定义框架无关 context 端口接口（`services.home.getSummary`） |
| `packages/api/src/routers/home.ts` | `home.summary` procedure（Zod + TRPCError） |
| `packages/api/src/routers/_app.ts` | 组合 `appRouter` |
| `packages/api/src/trpc.ts` | `initTRPC`、`transformer`、公共 `publicProcedure` |
| `packages/api/src/index.ts` | 对外导出 API 类型与构造函数 |
| `apps/backend/src/trpc/trpc.module.ts` | Nest 中注册 tRPC 适配 |
| `apps/backend/src/trpc/trpc.context.ts` | Nest `createContext`，绑定现有 `AppService` 到端口 |
| `apps/backend/src/trpc/trpc.router.ts` | 将共享 `appRouter` 挂载到 `/trpc` |
| `apps/backend/src/app.controller.ts` | 删除 REST demo 控制器（保留 health 时仅留 health） |
| `apps/backend/src/app.module.ts` | 移除 Controller，接入 tRPC module |
| `apps/frontend/src/app/api/trpc/[trpc]/route.ts` | Next 同源 tRPC 入口 |
| `apps/frontend/src/trpc/query-client.ts` | react-query client 单例 |
| `apps/frontend/src/trpc/provider.tsx` | 客户端 Provider（tRPC + Query） |
| `apps/frontend/src/trpc/client.ts` | 浏览器端 tRPC 客户端工厂 |
| `apps/frontend/src/server/trpc/backend-client.ts` | Next 服务端到 Nest 的 tRPC 客户端 |
| `apps/frontend/src/server/trpc/context.ts` | Next `createContext`，把 backend-client 适配为 context 端口 |
| `apps/frontend/src/server/trpc/caller.ts` | `appRouter.createCaller` 服务端调用入口 |
| `apps/frontend/src/app/page.tsx` | 改为 tRPC 查询演示 |
| `apps/frontend/src/app/api/home/summary/route.ts` | 删除旧 REST BFF demo |
| `apps/frontend/src/lib/nest/*` | 删除旧 HTTP 调用工具 |
| `apps/frontend/src/app/api/home/summary/route.test.ts` | 删除旧 REST 路由测试 |
| `apps/frontend/src/server/trpc/context.test.ts` | Next context 端口适配测试 |
| `packages/api/src/routers/home.test.ts` | 共享 procedure 测试 |

---

### Task 1: 安装依赖并创建共享包骨架

**Files:**
- Create: `packages/api/package.json`
- Create: `packages/api/tsconfig.json`
- Create: `packages/api/src/index.ts`
- Create: `packages/api/src/trpc.ts`
- Create: `packages/api/src/context.ts`
- Create: `packages/api/src/routers/_app.ts`
- Create: `packages/api/src/routers/home.ts`

- [ ] **Step 1: 安装依赖**

Run:
```bash
pnpm add @trpc/server @trpc/client @trpc/react-query @trpc/tanstack-react-query @tanstack/react-query zod superjson --filter @pixel-playground/frontend
pnpm add @trpc/server @trpc/client zod superjson --filter @pixel-playground/backend
pnpm add @trpc/server zod superjson -D --filter ./packages/api
```
Expected: 安装成功；若 `--filter ./packages/api` 因包不存在失败，先执行 Step 2 再回到本步第二条命令。

- [ ] **Step 2: 创建 `packages/api/package.json`（失败前置）**

```json
{
  "name": "@pixel-playground/api",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "test": "vitest run"
  },
  "dependencies": {
    "@trpc/server": "^11.0.0",
    "superjson": "^2.2.2",
    "zod": "^3.25.0"
  },
  "devDependencies": {
    "vitest": "^4.1.4"
  }
}
```

- [ ] **Step 3: 创建共享 tRPC 基础设施（最小可编译实现）**

```ts
// packages/api/src/context.ts
export type HomeServicePort = {
  getSummary: () => Promise<string>;
};

export type AppContext = {
  services: {
    home: HomeServicePort;
  };
};
```

```ts
// packages/api/src/trpc.ts
import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import type { AppContext } from './context';

const t = initTRPC.context<AppContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const publicProcedure = t.procedure;
```

```ts
// packages/api/src/routers/home.ts
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createRouter, publicProcedure } from '../trpc';

export const homeRouter = createRouter({
  summary: publicProcedure.input(z.void()).query(async ({ ctx }) => {
    try {
      const summary = await ctx.services.home.getSummary();
      return { summary };
    } catch {
      throw new TRPCError({
        code: 'SERVICE_UNAVAILABLE',
        message: 'Nest upstream unreachable',
      });
    }
  }),
});
```

```ts
// packages/api/src/routers/_app.ts
import { createRouter } from '../trpc';
import { homeRouter } from './home';

export const appRouter = createRouter({
  home: homeRouter,
});

export type AppRouter = typeof appRouter;
```

```ts
// packages/api/src/index.ts
export type { AppContext, HomeServicePort } from './context';
export { appRouter } from './routers/_app';
export type { AppRouter } from './routers/_app';
```

- [ ] **Step 4: 运行类型检查基础验证**

Run:
```bash
pnpm --filter @pixel-playground/frontend exec tsc --noEmit
pnpm --filter @pixel-playground/backend exec tsc --noEmit
```
Expected: 两个命令都通过（若因 Node 版本导致第三方类型异常，记录到执行备注但继续计划）。

- [ ] **Step 5: Commit**

```bash
git add packages/api apps/frontend/package.json apps/backend/package.json pnpm-lock.yaml
git commit -m "feat(api): add shared trpc router package"
```

---

### Task 2: 为共享 router 补测试（TDD）

**Files:**
- Create: `packages/api/src/routers/home.test.ts`
- Modify: `packages/api/package.json`

- [ ] **Step 1: 写失败测试**

```ts
import { describe, expect, it, vi } from 'vitest';
import { appRouter } from '../index';

describe('home.summary procedure', () => {
  it('returns summary from service port', async () => {
    const caller = appRouter.createCaller({
      services: {
        home: {
          getSummary: vi.fn().mockResolvedValue('Hello World!'),
        },
      },
    });

    await expect(caller.home.summary()).resolves.toEqual({
      summary: 'Hello World!',
    });
  });
});
```

- [ ] **Step 2: 运行测试**

Run:
```bash
pnpm --filter @pixel-playground/api test
```
Expected: PASS。

- [ ] **Step 3: Commit**

```bash
git add packages/api/src/routers/home.test.ts packages/api/package.json
git commit -m "test(api): cover home summary procedure"
```

---

### Task 3: Nest 接入 tRPC 并移除 demo REST

**Files:**
- Create: `apps/backend/src/trpc/trpc.context.ts`
- Create: `apps/backend/src/trpc/trpc.router.ts`
- Create: `apps/backend/src/trpc/trpc.module.ts`
- Modify: `apps/backend/src/app.module.ts`
- Modify: `apps/backend/src/main.ts`
- Modify: `apps/backend/src/app.controller.ts`（删除或仅保留 health）
- Modify: `apps/backend/src/app.controller.spec.ts`

- [ ] **Step 1: 写失败测试（控制器不再返回业务字符串）**

```ts
// apps/backend/src/app.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('returns ok on health endpoint', () => {
    expect(appController.health()).toEqual({ ok: true });
  });
});
```

- [ ] **Step 2: 实现 Nest tRPC 适配**

```ts
// apps/backend/src/trpc/trpc.context.ts
import type { AppContext } from '@pixel-playground/api';
import { AppService } from '../app.service';

export const createNestTrpcContext =
  (appService: AppService) =>
  async (): Promise<AppContext> => ({
    services: {
      home: {
        getSummary: async () => appService.getHello(),
      },
    },
  });
```

```ts
// apps/backend/src/trpc/trpc.router.ts
import { appRouter } from '@pixel-playground/api';

export { appRouter };
```

```ts
// apps/backend/src/trpc/trpc.module.ts
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppService } from '../app.service';
import { createHTTPHandler } from '@trpc/server/adapters/standalone';
import { appRouter } from './trpc.router';
import { createNestTrpcContext } from './trpc.context';

@Module({})
export class TrpcModule implements NestModule {
  constructor(private readonly appService: AppService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req, res) =>
        createHTTPHandler({
          router: appRouter,
          createContext: createNestTrpcContext(this.appService),
        })(req, res),
      )
      .forRoutes('/trpc');
  }
}
```

```ts
// apps/backend/src/app.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/health')
  health() {
    return { ok: true };
  }
}
```

```ts
// apps/backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TrpcModule } from './trpc/trpc.module';

@Module({
  imports: [TrpcModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

- [ ] **Step 3: 运行后端测试**

Run:
```bash
pnpm --filter @pixel-playground/backend test
```
Expected: PASS；`app.controller.spec.ts` 和 e2e 无 404（若 e2e 断言仍指向 `/`，同步更新为 `/health`）。

- [ ] **Step 4: Commit**

```bash
git add apps/backend/src
git commit -m "feat(backend): expose internal trpc endpoint"
```

---

### Task 4: Next 构建 tRPC BFF 入口与服务端 caller

**Files:**
- Create: `apps/frontend/src/app/api/trpc/[trpc]/route.ts`
- Create: `apps/frontend/src/server/trpc/backend-client.ts`
- Create: `apps/frontend/src/server/trpc/context.ts`
- Create: `apps/frontend/src/server/trpc/caller.ts`
- Modify: `apps/frontend/next.config.ts`

- [ ] **Step 1: 写失败测试（context 适配）**

```ts
// apps/frontend/src/server/trpc/context.test.ts
import { describe, expect, it, vi } from 'vitest';
import { createFrontendTrpcContext } from './context';

describe('createFrontendTrpcContext', () => {
  it('maps backend client to home service port', async () => {
    const client = {
      home: {
        summary: vi.fn().mockResolvedValue({ summary: 'Hello World!' }),
      },
    };
    const ctx = await createFrontendTrpcContext(client as never);
    await expect(ctx.services.home.getSummary()).resolves.toBe('Hello World!');
  });
});
```

- [ ] **Step 2: 实现服务端 context 与 caller**

```ts
// apps/frontend/src/server/trpc/backend-client.ts
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@pixel-playground/api';

export function createBackendTrpcClient(nestOrigin: string) {
  return createTRPCProxyClient<AppRouter>({
    transformer: superjson,
    links: [
      httpBatchLink({
        url: `${nestOrigin.replace(/\/$/, '')}/trpc`,
      }),
    ],
  });
}
```

```ts
// apps/frontend/src/server/trpc/context.ts
import type { AppContext, AppRouter } from '@pixel-playground/api';
import { createBackendTrpcClient } from './backend-client';
import { getNestOriginFromEnv } from '@/lib/nest/nest-origin';
import type { TRPCClient } from '@trpc/client';

export async function createFrontendTrpcContext(
  client?: TRPCClient<AppRouter>,
): Promise<AppContext> {
  const backendClient = client ?? createBackendTrpcClient(getNestOriginFromEnv());
  return {
    services: {
      home: {
        getSummary: async () => {
          const result = await backendClient.home.summary.query();
          return result.summary;
        },
      },
    },
  };
}
```

```ts
// apps/frontend/src/server/trpc/caller.ts
import { appRouter } from '@pixel-playground/api';
import { createFrontendTrpcContext } from './context';

export async function createServerCaller() {
  return appRouter.createCaller(await createFrontendTrpcContext());
}
```

```ts
// apps/frontend/src/app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@pixel-playground/api';
import { createFrontendTrpcContext } from '@/server/trpc/context';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createFrontendTrpcContext(),
  });

export { handler as GET, handler as POST };
```

- [ ] **Step 3: 配置 workspace 包编译**

```ts
// apps/frontend/next.config.ts
import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, '../..'),
  transpilePackages: ['@pixel-playground/api'],
};

export default nextConfig;
```

- [ ] **Step 4: 运行新增测试**

Run:
```bash
pnpm --filter @pixel-playground/frontend exec vitest run src/server/trpc/context.test.ts
```
Expected: PASS。

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/server/trpc apps/frontend/src/app/api/trpc apps/frontend/next.config.ts
git commit -m "feat(frontend): add trpc route handler and server caller"
```

---

### Task 5: 浏览器端 tRPC Provider + 页面改造

**Files:**
- Create: `apps/frontend/src/trpc/query-client.ts`
- Create: `apps/frontend/src/trpc/client.ts`
- Create: `apps/frontend/src/trpc/provider.tsx`
- Modify: `apps/frontend/src/app/layout.tsx`
- Modify: `apps/frontend/src/app/page.tsx`

- [ ] **Step 1: 写失败测试（页面不再 fetch REST）**

Run:
```bash
pnpm --filter @pixel-playground/frontend exec rg "/api/home/summary|fetch\\(" src/app/page.tsx
```
Expected: 当前能匹配到旧 REST 逻辑（FAIL 基线）。

- [ ] **Step 2: 实现浏览器端客户端与 Provider**

```ts
// apps/frontend/src/trpc/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
      },
    },
  });
```

```ts
// apps/frontend/src/trpc/client.ts
import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@pixel-playground/api';

export const trpc = createTRPCReact<AppRouter>();

export const createBrowserTrpcClient = () =>
  trpc.createClient({
    links: [httpBatchLink({ url: '/api/trpc' })],
    transformer: superjson,
  });
```

```tsx
// apps/frontend/src/trpc/provider.tsx
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { createBrowserTrpcClient, trpc } from './client';
import { createQueryClient } from './query-client';

export function TrpcProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());
  const [trpcClient] = useState(() => createBrowserTrpcClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
```

- [ ] **Step 3: 注入 Provider 并替换首页**

```tsx
// apps/frontend/src/app/layout.tsx (snippet)
import { TrpcProvider } from '@/trpc/provider';

// ...
<body>
  <TrpcProvider>{children}</TrpcProvider>
</body>
```

```tsx
// apps/frontend/src/app/page.tsx
'use client';

import { trpc } from '@/trpc/client';

export default function HomePage() {
  const summaryQuery = trpc.home.summary.useQuery(undefined);

  if (summaryQuery.isLoading) return <main className="p-8">Loading...</main>;
  if (summaryQuery.error) {
    return <main className="p-8 text-red-600">{summaryQuery.error.message}</main>;
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Pixel Playground — tRPC demo</h1>
      <p className="mt-4">{summaryQuery.data.summary}</p>
    </main>
  );
}
```

- [ ] **Step 4: 再次检查 page.tsx 不含旧 REST 调用**

Run:
```bash
pnpm --filter @pixel-playground/frontend exec rg "/api/home/summary|fetch\\(" src/app/page.tsx
```
Expected: 无匹配。

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/app apps/frontend/src/trpc
git commit -m "feat(frontend): migrate homepage to trpc query client"
```

---

### Task 6: 删除旧 REST BFF 与 HTTP 工具

**Files:**
- Delete: `apps/frontend/src/app/api/home/summary/route.ts`
- Delete: `apps/frontend/src/app/api/home/summary/route.test.ts`
- Delete: `apps/frontend/src/lib/nest/fetch-nest.ts`
- Delete: `apps/frontend/src/lib/nest/fetch-nest.test.ts`
- Delete: `apps/frontend/src/lib/nest/nest-url.ts`
- Delete: `apps/frontend/src/lib/nest/nest-url.test.ts`
- Delete: `apps/frontend/src/lib/bff/json-error.ts`

- [ ] **Step 1: 删除被替代文件**

Run:
```bash
git rm apps/frontend/src/app/api/home/summary/route.ts apps/frontend/src/app/api/home/summary/route.test.ts apps/frontend/src/lib/nest/fetch-nest.ts apps/frontend/src/lib/nest/fetch-nest.test.ts apps/frontend/src/lib/nest/nest-url.ts apps/frontend/src/lib/nest/nest-url.test.ts apps/frontend/src/lib/bff/json-error.ts
```
Expected: staged 为 deleted。

- [ ] **Step 2: 确认仓库内不再引用旧路径**

Run:
```bash
rg "api/home/summary|fetchNest|NestUnreachableError|jsonErrorResponse" apps/frontend/src
```
Expected: 无匹配。

- [ ] **Step 3: Commit**

```bash
git commit -m "refactor(frontend): remove legacy rest bff demo path"
```

---

### Task 7: 全量验证与收尾

**Files:**
- Modify: `docs/superpowers/specs/2026-04-16-trpc-full-stack-design.md`（仅当实现偏差需回写）
- Modify: `README.md`（可选，补充 tRPC 启动说明）

- [ ] **Step 1: 运行 lint/test/build**

Run:
```bash
pnpm lint
pnpm test
pnpm build
```
Expected: 三条命令全部通过。若 `pnpm test` 因当前环境 Node 18 失败，需在执行记录中标注“需 Node 24+ 重跑”。

- [ ] **Step 2: 手动联调**

Run:
```bash
pnpm --filter @pixel-playground/backend dev
pnpm --filter @pixel-playground/frontend dev
```
Expected: 打开 `http://localhost:7000` 能看到 `Hello World!`（来自 `home.summary`）。

- [ ] **Step 3: 若实现与 spec 有偏差，回写 spec**

示例（仅偏差时执行）：
```bash
git add docs/superpowers/specs/2026-04-16-trpc-full-stack-design.md README.md
git commit -m "docs(trpc): sync spec and runbook with implementation"
```

---

## Self-review（计划自检）

1. **Spec coverage:** 覆盖了 `packages/api` 单一 router、Next 同源 tRPC 入口、Nest 内网 tRPC、RSC/Server caller、删除旧 REST 路径、测试与构建验证。  
2. **Placeholder scan:** 无 `TBD`/`TODO`/“自行处理”占位语；每个任务给出文件、代码和命令。  
3. **Type consistency:** 全文统一使用 `AppRouter`、`AppContext`、`home.summary`、`createFrontendTrpcContext`、`createServerCaller`。

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-04-16-trpc-full-stack-implementation.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
