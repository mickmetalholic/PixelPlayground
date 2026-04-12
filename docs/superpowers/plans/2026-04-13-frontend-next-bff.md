# Frontend Next.js BFF（Route Handlers）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 monorepo 中新增 `apps/frontend`（Next.js App Router + TypeScript），通过 Route Handlers 显式聚合调用 Nest 现有 `GET /`，端口 **Next 7000 / Nest 3000**，并纳入 pnpm、Turbo、Biome 与可运行的轻量测试。

**Architecture:** 浏览器与客户端请求仅访问 Next；BFF 在 `app/api/.../route.ts` 内用 **单一** `getNestUrl` + 可测试的 `fetchNest` 封装对 `NEST_ORIGIN` 做 `fetch`，禁止 catch-all 代理。Nest 不可达时全仓统一返回 **503** + 稳定 JSON（不泄露堆栈与内网地址）；Nest 返回错误状态码时 **透传**。Turbo 在 **`apps/frontend/turbo.json`** 中用 `extends: ["//"]` 覆盖 `build` 的 `outputs` 为 `.next` 产物，避免与根配置中 `dist/**` 不一致。

**Tech Stack:** pnpm workspaces、Turborepo、Next.js（App Router）、TypeScript、Biome（全仓唯一 lint/format）、Vitest（`node` 环境单测）、Node `fetch`（Route Handler 与测试内可 mock）。

---

## 文件结构（新增与修改）

| 路径 | 职责 |
|------|------|
| `apps/frontend/package.json` | 包名 `@pixel-playground/frontend`；脚本 `dev`（`-p 7000`）、`build`、`start`、`test`（vitest run） |
| `apps/frontend/turbo.json` | 扩展根配置，`build.outputs` = `.next/**` 并排除 `!.next/cache/**` |
| `apps/frontend/next.config.ts` | Next 配置（保持默认扩展即可） |
| `apps/frontend/tsconfig.json` | `paths`: `@/*` → `./*` |
| `apps/frontend/vitest.config.ts` | Vitest，`environment: 'node'`，`@` 别名 |
| `apps/frontend/.env.example` | `NEST_ORIGIN=http://127.0.0.1:3000`（无密钥） |
| `apps/frontend/.gitignore` | `.next/`、`node_modules/`、`.env*.local`（create-next-app 会生成大部分，按需合并） |
| `apps/frontend/app/layout.tsx` | 根布局 |
| `apps/frontend/app/page.tsx` | 示例页：客户端 `fetch('/api/home/summary')` 展示经 BFF 的数据 |
| `apps/frontend/app/globals.css` | 全局样式（create-next-app 生成） |
| `apps/frontend/app/api/home/summary/route.ts` | **用例级 BFF**：聚合当前 Nest 能力（`GET /` 文本），返回 JSON |
| `apps/frontend/lib/nest/nest-origin.ts` | 读取 `NEST_ORIGIN`、去尾斜杠；未设置时抛错供路由捕获 |
| `apps/frontend/lib/nest/nest-url.ts` | `joinOriginAndPath(origin, path)`（纯函数，可测）；`getNestUrl(path)` 内部读 `NEST_ORIGIN` 并拼接，供路由与封装复用 |
| `apps/frontend/lib/nest/fetch-nest.ts` | `fetchNest(path)`：内部读 origin + `joinOriginAndPath`；超时、`AbortController`、网络错误抛 `NestUnreachableError`；成功返回 `Response` |
| `apps/frontend/lib/bff/json-error.ts` | `jsonErrorResponse(status, body)` 稳定 JSON（`message`、`code`） |
| `apps/frontend/lib/nest/fetch-nest.test.ts` | mock `fetch`，覆盖成功、Nest 5xx、网络失败 |
| `apps/frontend/lib/nest/nest-url.test.ts` | `joinOriginAndPath` 拼接 |
| `apps/frontend/app/api/home/summary/route.test.ts` | mock `fetch`，断言 `GET` 返回 200 与 503 |
| `biome.json` | `files.ignore` 增加 `**/.next/**` 等，避免 Biome 扫构建产物 |
| `.gitignore` | 增加 `.next/`（若希望全仓忽略任意位置的 Next 构建目录） |

**不新增：** `packages/api-types`、catch-all `app/api/[...path]/route.ts`、Playwright、ESLint（与仓库 Biome 策略一致，create-next-app 时关闭 ESLint）。

---

### Task 1: 根目录 Biome / Git — 忽略 Next 构建产物

**Files:**
- Modify: `biome.json`
- Modify: `.gitignore`

- [ ] **Step 1: 修改 `biome.json`**

在 `files` 中增加 `ignore`（Biome 2.x；若你本地 schema 校验要求键名不同，以 `biome check` 通过为准），示例：

```json
{
  "files": {
    "ignoreUnknown": false,
    "includes": ["**", "!!**/.cursor"],
    "ignore": ["**/.next/**", "**/node_modules/**", "**/dist/**", "**/coverage/**"]
  }
}
```

若当前仓库 `files` 仅有 `includes`，将上述 `ignore` 数组合并进 `files` 对象即可。

- [ ] **Step 2: 修改 `.gitignore`**

追加（若尚未存在）：

```
.next/
```

- [ ] **Step 3: 验证**

Run: `pnpm exec biome check .`  
Expected: 退出码 0

- [ ] **Step 4: Commit**

```bash
git add biome.json .gitignore
git commit -m "chore(biome): ignore Next.js build output paths"
```

---

### Task 2: 脚手架创建 `apps/frontend`（Next.js，无 ESLint）

**Files:**
- Create: `apps/frontend/**`（由 CLI 生成）

- [ ] **Step 1: 在非交互模式下创建应用**

在仓库根目录执行（PowerShell 可用 `pnpm dlx`；若需完全非交互，可设环境变量 `CI=1`）：

```bash
pnpm dlx create-next-app@15 apps/frontend --typescript --tailwind --eslint false --app --no-src-dir --import-alias "@/*" --use-pnpm --turbopack
```

说明：`--eslint false` 避免与全仓 Biome 重复；`--no-src-dir` 使 `app/` 位于 `apps/frontend/app`，与 spec 一致。

若 CLI 版本不支持某项 flag，以实现时 `create-next-app --help` 为准，**但必须**关闭 ESLint、启用 TypeScript 与 App Router。

- [ ] **Step 2: 修改 `apps/frontend/package.json` 包名与脚本**

将 `name` 设为 `@pixel-playground/frontend`，并确保脚本包含（在 `next` 脚本基础上调整端口与测试）：

```json
{
  "name": "@pixel-playground/frontend",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack -p 7000",
    "build": "next build",
    "start": "next start -p 7000",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

保留 `dependencies` / `devDependencies` 中 CLI 已写入的 `next`、`react`、`react-dom` 等；**下一步**再添加 `vitest`。

- [ ] **Step 3: 安装 Vitest**

在仓库根执行：

```bash
pnpm add -D vitest --filter @pixel-playground/frontend
```

- [ ] **Step 4: 根目录安装**

```bash
pnpm install
```

- [ ] **Step 5: Commit**

```bash
git add apps/frontend pnpm-lock.yaml
git commit -m "feat(frontend): scaffold Next.js app with App Router"
```

---

### Task 3: Vitest 配置与路径别名

**Files:**
- Create: `apps/frontend/vitest.config.ts`

- [ ] **Step 1: 新增 `apps/frontend/vitest.config.ts`**

```typescript
import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'node',
    include: ['**/*.test.ts'],
    passWithNoTests: false,
  },
});
```

- [ ] **Step 2: 运行 Vitest（应通过 0 测试失败或提示无测试 — 下一步会加测试文件）**

Run: `pnpm --filter @pixel-playground/frontend exec vitest run`  
Expected: 若尚无测试文件且 `passWithNoTests: false`，会失败；**Task 4 加入测试文件后再跑通**。临时可将 `passWithNoTests` 改为 `true` 仅用于本步验证配置，**Task 4 起必须为 `false`**。

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/vitest.config.ts apps/frontend/package.json
git commit -m "feat(frontend): add vitest config for unit tests"
```

---

### Task 4: Nest URL 与 `fetchNest` 纯逻辑 + 单测（TDD）

**Files:**
- Create: `apps/frontend/lib/nest/nest-origin.ts`
- Create: `apps/frontend/lib/nest/nest-url.ts`
- Create: `apps/frontend/lib/nest/fetch-nest.ts`
- Create: `apps/frontend/lib/bff/json-error.ts`
- Create: `apps/frontend/lib/nest/nest-url.test.ts`
- Create: `apps/frontend/lib/nest/fetch-nest.test.ts`

约定：**Nest 不可达**（`TypeError`、中止、`ECONNREFUSED` 等）在路由层映射为 **503** + JSON；本任务内 `fetchNest` 对网络错误抛出**带 `code: 'NEST_UNREACHABLE'` 的自定义错误类**，便于路由捕获。规格中的「`getNestUrl(path)` 基于 `NEST_ORIGIN`」在本计划落地为：对外导出 **`getNestUrl(path: string)`**（读环境变量并拼接），纯拼接逻辑在 **`joinOriginAndPath`** 中单测。

- [ ] **Step 1: 写失败测试 `apps/frontend/lib/nest/nest-url.test.ts`**

```typescript
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
```

- [ ] **Step 2: 运行测试确认失败（模块不存在）**

Run: `pnpm --filter @pixel-playground/frontend exec vitest run lib/nest/nest-url.test.ts`  
Expected: FAIL（cannot find module）

- [ ] **Step 3: 实现 `apps/frontend/lib/nest/nest-url.ts`**

```typescript
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
 * 基于 NEST_ORIGIN 与 path 构造 Nest 请求 URL（规格建议的单一入口）。
 */
export function getNestUrl(path: string): string {
  return joinOriginAndPath(getNestOriginFromEnv(), path);
}
```

- [ ] **Step 4: 再运行 `nest-url` 测试**

Run: `pnpm --filter @pixel-playground/frontend exec vitest run lib/nest/nest-url.test.ts`  
Expected: PASS

- [ ] **Step 5: 写 `apps/frontend/lib/nest/fetch-nest.test.ts`**

```typescript
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchNest } from './fetch-nest';

describe('fetchNest', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete process.env.NEST_ORIGIN;
  });

  it('returns response on success', async () => {
    process.env.NEST_ORIGIN = 'http://127.0.0.1:3000';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('ok', { status: 200 })),
    );
    const res = await fetchNest('/');
    expect(res.status).toBe(200);
  });

  it('throws NestUnreachableError on network failure', async () => {
    process.env.NEST_ORIGIN = 'http://127.0.0.1:3000';
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));
    await expect(fetchNest('/')).rejects.toMatchObject({
      code: 'NEST_UNREACHABLE',
    });
  });
});
```

- [ ] **Step 6: 运行测试确认失败**

Run: `pnpm --filter @pixel-playground/frontend exec vitest run lib/nest/fetch-nest.test.ts`  
Expected: FAIL

- [ ] **Step 7: 实现 `apps/frontend/lib/nest/nest-origin.ts`**

```typescript
export function getNestOriginFromEnv(): string {
  const raw = process.env.NEST_ORIGIN;
  if (!raw || raw.trim() === '') {
    throw new Error('NEST_ORIGIN is not set');
  }
  return raw.trim().replace(/\/$/, '');
}
```

- [ ] **Step 8: 实现 `apps/frontend/lib/nest/fetch-nest.ts`**

```typescript
import { getNestUrl } from './nest-url';

export class NestUnreachableError extends Error {
  readonly code = 'NEST_UNREACHABLE' as const;
  constructor(cause: unknown) {
    super('Nest upstream unreachable');
    this.name = 'NestUnreachableError';
    this.cause = cause;
  }
}

const FETCH_TIMEOUT_MS = 10_000;

export async function fetchNest(path: string): Promise<Response> {
  const url = getNestUrl(path);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } catch (e) {
    throw new NestUnreachableError(e);
  } finally {
    clearTimeout(timeout);
  }
}
```

- [ ] **Step 9: 实现 `apps/frontend/lib/bff/json-error.ts`**

```typescript
import { NextResponse } from 'next/server';

export type BffErrorBody = {
  message: string;
  code: string;
};

export function jsonErrorResponse(
  status: 503 | 500 | 502 | 504,
  body: BffErrorBody,
): NextResponse<BffErrorBody> {
  return NextResponse.json(body, { status });
}
```

- [ ] **Step 10: 运行全部 nest 单测**

Run: `pnpm --filter @pixel-playground/frontend exec vitest run lib/nest/`  
Expected: PASS

- [ ] **Step 11: Commit**

```bash
git add apps/frontend/lib/nest apps/frontend/lib/bff/json-error.ts
git commit -m "feat(frontend): add nest URL helper and fetchNest with tests"
```

---

### Task 5: BFF Route Handler `GET /api/home/summary` + 单测

**Files:**
- Create: `apps/frontend/app/api/home/summary/route.ts`
- Create: `apps/frontend/app/api/home/summary/route.test.ts`

行为：
- 服务端 `fetchNest('/')`（内部读取 `NEST_ORIGIN` 并拼接 URL）。
- Nest 返回 **2xx**：BFF 返回 `200` + JSON：`{ "summary": string }`（summary 为 Nest 响应 **文本** body）。
- Nest 返回 **4xx/5xx**：**透传**状态码 + body 若为 JSON 则尽量转文本；为简化可先 `return new Response(upstream.body, { status: upstream.status, headers: { 'content-type': upstream.headers.get('content-type') ?? 'text/plain' } })`，但 Route Handler 更宜统一 JSON。本计划采用：**非 2xx 时**返回 JSON `{ message, code: 'NEST_HTTP_ERROR', upstreamStatus }` 且 **HTTP 状态码与 Nest 一致**。
- `NestUnreachableError`：**503** + `{ message, code: 'NEST_UNREACHABLE' }`。
- `NEST_ORIGIN` 未设置：**500** + `{ message, code: 'NEST_ORIGIN_MISSING' }`。

- [ ] **Step 1: 写失败测试 `route.test.ts`**

```typescript
import { describe, expect, it, vi, afterEach } from 'vitest';
import { GET } from './route';

describe('GET /api/home/summary', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete process.env.NEST_ORIGIN;
  });

  it('returns 200 and summary text from Nest', async () => {
    process.env.NEST_ORIGIN = 'http://127.0.0.1:3000';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('Hello World!', { status: 200 })),
    );
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ summary: 'Hello World!' });
  });

  it('returns 503 when Nest is unreachable', async () => {
    process.env.NEST_ORIGIN = 'http://127.0.0.1:3000';
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));
    const res = await GET();
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.code).toBe('NEST_UNREACHABLE');
  });
});
```

- [ ] **Step 2: 运行测试 — 应失败**

Run: `pnpm --filter @pixel-playground/frontend exec vitest run app/api/home/summary/route.test.ts`  
Expected: FAIL

- [ ] **Step 3: 实现 `apps/frontend/app/api/home/summary/route.ts`**

```typescript
import { NextResponse } from 'next/server';
import { jsonErrorResponse } from '@/lib/bff/json-error';
import { fetchNest, NestUnreachableError } from '@/lib/nest/fetch-nest';
import { getNestOriginFromEnv } from '@/lib/nest/nest-origin';

export async function GET() {
  try {
    getNestOriginFromEnv();
  } catch {
    return jsonErrorResponse(500, {
      code: 'NEST_ORIGIN_MISSING',
      message: 'Server misconfiguration: NEST_ORIGIN is not set',
    });
  }

  try {
    const upstream = await fetchNest('/');
    if (!upstream.ok) {
      return NextResponse.json(
        {
          code: 'NEST_HTTP_ERROR',
          message: 'Nest returned an error',
          upstreamStatus: upstream.status,
        },
        { status: upstream.status },
      );
    }
    const summary = await upstream.text();
    return NextResponse.json({ summary });
  } catch (e) {
    if (e instanceof NestUnreachableError) {
      return jsonErrorResponse(503, {
        code: 'NEST_UNREACHABLE',
        message: 'Nest upstream unreachable',
      });
    }
    return jsonErrorResponse(500, {
      code: 'BFF_INTERNAL_ERROR',
      message: 'Unexpected BFF error',
    });
  }
}
```

- [ ] **Step 4: 运行测试 — 应通过**

Run: `pnpm --filter @pixel-playground/frontend exec vitest run app/api/home/summary/route.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/app/api/home/summary/route.ts apps/frontend/app/api/home/summary/route.test.ts
git commit -m "feat(frontend): add home summary BFF route handler"
```

---

### Task 6: 示例页面与 `.env.example`

**Files:**
- Modify: `apps/frontend/app/page.tsx`
- Create: `apps/frontend/.env.example`

- [ ] **Step 1: 创建 `apps/frontend/.env.example`**

```env
# 服务端 BFF 访问 Nest 的起点（勿用 NEXT_PUBLIC_* 作为默认直连 Nest 的故事）
NEST_ORIGIN=http://127.0.0.1:3000
```

- [ ] **Step 2: 替换 `apps/frontend/app/page.tsx` 为客户端演示**

```typescript
'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/home/summary')
      .then(async (r) => {
        const data = (await r.json()) as { summary?: string; message?: string };
        if (!r.ok) {
          setError(data.message ?? `HTTP ${r.status}`);
          return;
        }
        setSummary(data.summary ?? '');
      })
      .catch(() => setError('Request failed'));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-semibold">Pixel Playground — Frontend (BFF demo)</h1>
      <p className="mt-4 max-w-lg text-center text-sm text-zinc-600">
        下方数据来自同源 <code className="rounded bg-zinc-100 px-1">/api/home/summary</code>，由 Route Handler 服务端请求{' '}
        <code className="rounded bg-zinc-100 px-1">NEST_ORIGIN</code> 上的 Nest。
      </p>
      <p className="mt-6 font-mono text-lg">
        {error && <span className="text-red-600">{error}</span>}
        {!error && summary === null && 'Loading…'}
        {!error && summary !== null && summary}
      </p>
    </main>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/.env.example apps/frontend/app/page.tsx
git commit -m "feat(frontend): demo page consuming BFF and add env example"
```

---

### Task 7: Turbo 包级 `build` 输出（`.next`）

**Files:**
- Create: `apps/frontend/turbo.json`

- [ ] **Step 1: 创建 `apps/frontend/turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "extends": ["//"],
  "tasks": {
    "build": {
      "outputs": [".next/**", "!.next/cache/**"]
    }
  }
}
```

- [ ] **Step 2: 验证构建**

Run: `pnpm build`  
Expected: `@pixel-playground/frontend` 与 `@pixel-playground/backend` 均成功；无 Turbo 缓存警告指向前端 `outputs` 缺失。

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/turbo.json
git commit -m "build(frontend): configure turbo outputs for Next.js"
```

---

### Task 8: 本地联调说明（根 README 或注释脚本，二选一）

**Files:**
- Modify: `README.md`（若仓库根已有）**或** 仅依赖下方文档化命令而不改文件

为满足 spec「文档或根脚本层面可复现」，**至少**在根 `README.md` 增加一小节（若项目禁止改 README，则在团队文档中记录相同内容）。示例段落：

```markdown
## Local: Nest (3000) + Next (7000)

1. 复制 `apps/frontend/.env.example` 为 `apps/frontend/.env.local`（勿提交）。
2. 终端 A：`pnpm --filter @pixel-playground/backend dev`（监听 3000）。
3. 终端 B：`pnpm --filter @pixel-playground/frontend dev`（监听 7000）。
4. 浏览器打开 `http://localhost:7000`，应看到经 BFF 的 `Hello World!` 摘要。

或一键：`pnpm dev`（Turbo 并行跑各包 `dev`；仍须事先配置 `apps/frontend/.env.local`）。
```

- [ ] **Step 1: 将上述内容写入根 `README.md`（若文件不存在则创建仅含该节）**

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: document local Nest and Next ports for BFF demo"
```

---

### Task 9: 全仓验证（验收清单）

- [ ] **Step 1: Biome**

Run: `pnpm lint`  
Expected: 退出码 0

- [ ] **Step 2: 测试**

Run: `pnpm test`  
Expected: backend + frontend 测试全部通过

- [ ] **Step 3: 构建**

Run: `pnpm build`  
Expected: 成功

- [ ] **Step 4: 可选手动验收**

Run 后端：`pnpm --filter @pixel-playground/backend dev`  
Run 前端（另开终端，已配置 `.env.local`）：`pnpm --filter @pixel-playground/frontend dev`  
打开 `http://localhost:7000` — 应显示从 Nest 经 BFF 获取的文本。

- [ ] **Step 5: Commit（仅当有修复）**

若有 lint/test 修复，单独提交，例如：

```bash
git commit -m "fix(frontend): align Biome formatting for BFF files"
```

---

## Self-review（计划自检）

1. **Spec coverage：** §4 成功标准 — (1) `apps/frontend` + 包名 ✓；(2) 端口 7000/3000 ✓；(3) `.env.example` + `NEST_ORIGIN` ✓；(4) 显式 Route Handler ✓；(5) 页面演示 ✓；(6) Turbo `.next` ✓；(7) 根 lint/test ✓；(8) 非空测试 ✓。§6 禁止 catch-all ✓；URL 单一拼接 ✓。§7 503 统一、稳定 JSON ✓；Nest 错误透传 ✓。
2. **Placeholder scan：** 无 TBD；测试与实现代码已写全。
3. **类型/命名一致：** `NEST_ORIGIN`、`joinOriginAndPath`、`getNestUrl(path)`、`fetchNest(path)`、`NestUnreachableError.code`、`/api/home/summary` 全文一致。

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-04-13-frontend-next-bff.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — 每个任务派生子代理执行，任务间人工复核；请配合 **superpowers:subagent-driven-development**。

**2. Inline Execution** — 本会话内按任务顺序执行；请配合 **superpowers:executing-plans**，在检查点批量复核。

**Which approach?**
