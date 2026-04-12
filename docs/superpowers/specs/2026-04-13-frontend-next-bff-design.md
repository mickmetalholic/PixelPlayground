# apps/frontend Next.js 子项目（BFF Route Handlers）— 设计说明

**状态：** 待审阅  
**日期：** 2026-04-13  
**范围：** 在现有 pnpm + Turborepo monorepo 中新增 **`apps/frontend`**（Next.js，App Router）。浏览器只访问 Next；通过 **Route Handlers** 在服务端聚合调用 Nest **现有**原子 HTTP 接口。第一阶段 **不做登录/会话**；**不**实现 catch-all 万能转发。Nest **不强制**全局 `/api` 前缀，BFF 按后端当时真实路径调用。

---

## 1. 已定决策摘要

| 项 | 选择 |
|----|------|
| 目录 | `apps/frontend/` |
| 包名 | `@pixel-playground/frontend` |
| 框架 | Next.js，**App Router**，TypeScript |
| BFF 形态 | **Route Handlers**（`app/api/.../route.ts`），服务端 `fetch` 访问 Nest |
| 转发策略 | **以前端页面/用例为粒度** 显式聚合；**禁止** catch-all 将任意子路径原样转 Nest |
| 鉴权（第一阶段） | **不做**（无 Cookie/Bearer 约定） |
| Nest 路径演进 | **不强制**此时加 `globalPrefix('api')`；BFF 调用当时存在的原子端点 |
| 本地端口 | **Nest `3000`**（默认 `PORT`），**Next `7000`**（通过 Next 支持的端口配置实现） |
| 服务端指向 Nest | 环境变量（如 **`NEST_ORIGIN`**，名以实现为准），示例值 **`http://127.0.0.1:3000`**；**不得**使用 `NEXT_PUBLIC_*` 暴露给浏览器作为「直连 Nest」的默认故事 |
| Lint | 与仓库根 **Biome** 对齐；默认不另起 ESLint，若与 Next 冲突再单独评审 |
| Node | 与根 `package.json` 的 **`engines`** 一致 |

---

## 2. 目标

- 新增可独立开发、构建、测试的 **`apps/frontend`**，纳入 **pnpm workspace** 与 **Turbo** 任务图。
- **BFF 服务于前端展示**：按用例新增/调整 Route Handlers，**聚合** Nest 领域原子接口，避免「为转发而转发」的通用网关。
- **开发体验**：文档或根脚本层面可复现「Nest 在 3000、Next 在 7000」的本地组合；BFF 通过 **`NEST_ORIGIN`**（或最终名）访问 Nest。
- **诚实对齐现状**：当前 Nest 仅有 `GET /`；第一阶段 BFF「聚合」可等价于 **单次** 调用，但路由与模块结构需为 **未来多原子接口组合** 预留清晰边界（命名与文件组织）。

---

## 3. 非目标

- 不在此阶段实现 **用户登录、会话、Cookie 转发、RBAC**。
- 不引入 **catch-all** 动态段将请求整体代理到 Nest。
- 不强制引入 **`packages/api-types`**、OpenAPI 生成客户端等（待后端接口稳定后再评估）。
- 不要求第一阶段 **Playwright / E2E**（除非后续单独开 spec）。

---

## 4. 成功标准（验收清单）

1. 存在 **`apps/frontend`**，包名为 **`@pixel-playground/frontend`**，使用 **App Router** 与 **TypeScript**。
2. 本地可同时运行：**Nest 监听 `3000`**，**Next 监听 `7000`**（实现方式以实现计划为准，例如 Next 的 `-p` / `PORT`）。
3. **`apps/frontend/.env.example`**（或等价模板）包含 **`NEST_ORIGIN`**（或最终实现名），示例为 **`http://127.0.0.1:3000`**；**不提交**含机密的 `.env`。
4. 至少 **一个** 用例级 **Route Handler**，调用当前 Nest 能力（现阶段可与 **`GET /`** 等价），且实现方式符合 **§6**（禁止万能转发）。
5. 在 **`http://localhost:7000`** 可访问示例页面，并证明数据经 BFF 从 Nest 取得（或等价演示）。
6. **Turbo**：为 frontend 的 **`build`** 声明 **Next 构建输出**（通常为 **`.next/**`**，并排除缓存目录的常见写法若采用）；根 **`pnpm build`** 成功。
7. 根 **`pnpm lint`**、**`pnpm test`** 通过。
8. **`apps/frontend`** 提供 **轻量测试**（例如对 BFF 封装或 Route Handler 行为的单元/集成级测试），**非**空 `exit 0` 占位（除非实现计划以书面理由豁免并获接受——默认不满足）。

---

## 5. 仓库与任务集成

- **Workspace**：根 `pnpm-workspace.yaml` 已含 `apps/*`，**无需**为 `apps/frontend` 修改 workspace 根配置。
- **脚本**：`apps/frontend/package.json` 提供 **`dev` / `build` / `start` / `test`**（与 monorepo 习惯一致），供 Turbo 编排。
- **Turbo**：根 `turbo.json` 当前 `build` 的 **`outputs` 默认为 `dist/**`**（服务 Nest）。Next 子项目须在 **Turbo 层**为 frontend 的 `build` 配置 **`.next` 类输出**（实现计划写清具体 `outputs` 与是否使用 `package.json` 级 `turbo` 覆盖），避免缓存行为与真实产物不一致。
- **并发启动**：根 **`pnpm dev`** 应能同时拉起持久任务；须避免 Nest 与 Next **端口冲突**（本 spec 固定 **3000 / 7000**）。

---

## 6. BFF 规则与数据流

**允许**

- 按 **页面/用例** 增加 **显式** `route.ts`，在实现内 **列出** 对 Nest 的一次或多次 `fetch`。
- 同一 Nest 原子端点被多个 BFF 路由重复调用；后续可抽取 **私有** server 模块减少重复。

**禁止**

- **动态 catch-all** 将「任意剩余路径」代理到 Nest（除非未来有非常窄的例外并单独评审）。

**数据流（本地）**

```text
浏览器 → http://localhost:7000（页面或同源 /api/...）
       → Next Route Handler（聚合逻辑）
       → fetch → NEST_ORIGIN（默认 http://127.0.0.1:3000）上的 Nest 原子接口
       → 组装 JSON → 浏览器
```

**URL 构造**：BFF 内避免散落硬编码；建议 **单一辅助函数**（如 `getNestUrl(path)`）基于 **`NEST_ORIGIN`** 拼接路径。

**Server Component vs Route Handler**

- 若仅在服务端渲染拉数：可直接在 server 侧调用封装好的 `fetch` 逻辑，**不必**强制再经一层 HTTP 打本地 `/api`，除非要与客户端共享同一响应契约。
- 浏览器侧 `fetch`：应走 **同源 `/api/...`**，由 Route Handler 聚合。

---

## 7. 错误处理

- **Nest 不可达**（网络错误、超时等）：BFF 返回 **5xx**；在 **`502 Bad Gateway`** 与 **`503 Service Unavailable`** 中 **实现时选定一种** 并在本仓库 **统一**（规格不强行二选一，但必须一致）。
- 响应 body 使用 **稳定 JSON**（至少含可读 `message` 与/或 `code`），**不**向客户端返回堆栈或内网地址。
- **Nest 返回 4xx/5xx**：BFF **优先透传 HTTP 状态码**；若同一 handler 内 **多次** 调用 Nest，默认 **fail-fast**（首次失败即整体失败），细节可在具体 route 内说明。

---

## 8. 测试与质量

- **前端包**：至少覆盖 BFF 关键路径（mock `fetch` 或提取纯函数便于测试）。
- **Lint**：纳入根 **`pnpm lint`** 与 **lint-staged**；与现有 Biome 配置一致。

---

## 9. 与相关规格的关系

- 与 **`apps/backend`**（`@pixel-playground/backend`）共存；本 spec **不**要求修改 Nest 全局前缀。
- 全仓 Biome 策略见 **`docs/superpowers/specs/2026-04-10-biome-lint-design.md`**；若 Next 模板与 Biome 冲突，在实现计划中逐项解决。

---

## 10. 实现计划入口

审阅通过后，使用 **`writing-plans`** 技能生成实现计划；**不**在本文件展开具体文件级 diff。
