# 全栈 tRPC 重构（浏览器 → Next BFF → Nest）— 设计说明

**状态：** 待审阅  
**日期：** 2026-04-16  
**范围：** 在现有 pnpm + Turborepo monorepo 中，将 **前端 → BFF → Nest** 的用例级通信从手写 HTTP 迁移为 **tRPC**，实现端到端类型安全（End-to-End Type Safety）。新增 **`packages/*` 共享契约子项目**（包名以实现为准，下文暂称 **`@pixel-playground/api`**）。浏览器 **仅** 访问同源 Next；Nest **仅** 作为 Next 服务端的内网上游，**不**对浏览器暴露 tRPC。

**与既有文档的关系：** `2026-04-13-frontend-next-bff-design.md` 描述的「Route Handlers + `fetch` 调 Nest」在本里程碑内视为 **被替代**；本 spec 生效后，对外业务能力以 **tRPC** 为主路径，不再新增用例级 REST `route.ts` 作为业务聚合方式（运维/健康检查等极窄例外可在实现计划中单独列出）。

---

## 1. 已定决策摘要

| 项 | 选择 |
|----|------|
| 浏览器入口 | **仅** 同源 Next（tRPC 客户端 → Next `/api/trpc` 或项目选定路径） |
| Next 服务端 | RSC、Server Actions、Route Handler 等使用 **同一 `AppRouter`**，通过 **`createCaller`**（或官方推荐的等价服务端用法）获得强类型 |
| Nest 暴露 | **内网** tRPC HTTP 端点（如 `/trpc`；最终前缀以实现计划为准） |
| Nest 上游 | 环境变量 **`NEST_ORIGIN`**（与现有约定对齐），**不得** 使用 `NEXT_PUBLIC_*` 引导浏览器直连 Nest |
| 共享包 | 新建 **`packages/api`**（或 `@pixel-playground/api`），承载 **单一 `appRouter`** + Zod 输入；**禁止** 依赖 `react`、`next`、`@nestjs/*` |
| 契约形态 | **单一** `appRouter`：过程函数 **只依赖** `Context` 中的端口（如 `ctx.services.*`），由 Nest 与 Next **分别** 实现 `createContext` |
| 迁移节奏 | **尽快切干净**（里程碑内主路径 **仅** tRPC；REST 仅保留极少数例外时在实现计划中列明） |
| 其他调用方 | **无** 长期 REST/OpenAPI 第三方/移动端需求；Nest 仅服务 Next BFF |
| 序列化 | **默认** 采用 **SuperJSON**（`superjson`）作为 transformer，以支持 `Date`、`Map` 等常见类型跨边界；若实现阶段发现与某约束冲突，在实现计划中记录替代方案并更新本段 |
| 鉴权（本阶段） | 与既有前端 BFF spec 一致：**不做** 登录/会话/RBAC；`Context` 预留扩展点即可 |

---

## 2. 目标

- **端到端类型安全**：浏览器与 Next 服务端对远程调用获得 **与本地 `AppRouter` 类型一致** 的体验。
- **单一事实来源**：`AppRouter` 类型由 **共享包中的 `appRouter` 实例** 推断，避免双份手写契约。
- **清晰分层**：共享包 **仅** 声明路由与 procedure；业务实现通过 **Context 端口** 注入；Nest 保留 Nest 模块化业务；Next 负责同源入口、对内转发、观测与限流等横切关注点（后续迭代）。
- **可替换实现**：Nest 侧 `createContext` 绑定 **真实 Service**；Next 侧 `createContext` 绑定 **指向 `NEST_ORIGIN` 的 tRPC 受控客户端**，使同一 procedure 在两处语义一致。

---

## 3. 非目标

- 不在本 spec 定义具体业务域模型（仅要求以 **home/summary** 级 demo 验证链路）。
- 不引入 **OpenAPI 生成** 或 **REST 与 tRPC 长期双轨** 作为默认策略。
- 不要求本阶段引入 **Playwright E2E**（除非后续单独开 spec）。

---

## 4. 架构与数据流

### 4.1 共享包（`packages/api`）

- 使用 **`initTRPC`** 定义 **`Context` 类型**（含 `services` 或等价端口对象）。
- 导出 **单一** **`appRouter`** 与 **`AppRouter`** 类型（`export type AppRouter = typeof appRouter`）。
- **输入校验**：使用 **Zod**（与 tRPC 常规实践一致）。
- **依赖边界**：仅依赖 `@trpc/server`、`zod`、`superjson` 等；**不** 依赖应用框架。

### 4.2 Nest（`apps/backend`）

- 使用 **`@trpc/server` 的 HTTP 适配**（与现有 `@nestjs/platform-express` 一致），挂载 **内网** tRPC 端点。
- **`createContext`**：将 `AppService`（及后续模块）映射为 **与共享包约定一致** 的 `Context`。
- **业务路由**：逐步淘汰与 tRPC 重叠的 **REST Controller**（里程碑内与 demo 等价路径删除或迁移）。

### 4.3 Next（`apps/frontend`）

- 使用 **App Router** 的 **Route Handler**（如 `app/api/trpc/[trpc]/route.ts`）与 **`fetchRequestHandler`**。
- **`createContext`**：提供 **同一 `Context` 形状** 的实现，其中 `services` **委托** 给内部 **tRPC 客户端**（`httpBatchLink` 等）请求 **`NEST_ORIGIN`** 上的 tRPC。
- **浏览器**：使用 **tRPC React**（或项目选定的官方客户端封装）与 **`httpBatchLink`**，**base URL** 为同源。
- **React Server Components / Server Actions / 其它服务端代码**：使用 **`appRouter.createCaller`**（在合法异步上下文中传入 **Next 侧** `createContext` 的结果），与浏览器 **共用同一 `AppRouter` 类型**。

### 4.4 数据流（逻辑）

```text
Browser  --tRPC HTTP-->  Next /api/trpc  --tRPC HTTP-->  Nest /trpc  -->  Services
        (同源)              (createContext: 内部 client)  (createContext: 真实服务)

Next server (RSC / actions / route handlers)
        --createCaller(appRouter)-->  同一 appRouter，Context 为 Next 实现
```

---

## 5. 错误处理与观测

- **Nest 不可达**、超时、非 2xx 等：在 Next 的 `createContext` 委托链或 link 层映射为 **`TRPCError`**，使用 **`code`**（如 `INTERNAL_SERVER_ERROR`、`SERVICE_UNAVAILABLE`）与 **稳定** 的 `message`（不向前端泄露堆栈与内网地址）。
- 与现有 **`json-error`** 形态的 REST 响应对齐 **不作为** 长期目标；迁移完成后删除或缩小仅用于非 tRPC 例外路径。
- **requestId**（若当前未实现）：在实现计划中决定是否引入，并在 Next/Nest 两侧记录。

---

## 6. Monorepo 与构建

- 根 **`pnpm-workspace.yaml`** 已含 `packages/*`；新增 **`packages/api`** 后需在各消费者 **`package.json`** 中声明 workspace 依赖。
- **Next**：配置 **`transpilePackages`**（或等价）以编译 workspace 包；**Turbo** 为 `build` 声明正确依赖顺序与缓存输出（frontend 的 `.next` 等沿用现有约定）。
- **Nest**：确保编译期可解析 workspace 包（`tsconfig` paths 或 `pnpm` 链接 + 构建产物策略以 **实现计划** 为准）。

---

## 7. 测试策略

- **`packages/api`**：对 **procedure** 使用 **mock `Context`** 做 **Vitest** 单元测试（与 `apps/frontend` 现有测试栈对齐或抽到根，由实现计划定）。
- **`apps/backend`**：保留 Jest；可对 tRPC `createCaller` 或 HTTP 层做集成测。
- **`apps/frontend`**：对 Route Handler 与 tRPC 客户端封装补充测试；**非** 空 `exit 0` 占位（除非实现计划以书面理由豁免并获接受）。

---

## 8. 迁移与验收

**迁移**

- 删除 **用例级** REST BFF：`/api/home/summary` 及手写 `fetchNest` 演示路径（保留 `NEST_ORIGIN`、**Nest URL 拼装**、**超时** 等思想在 **tRPC 内网客户端** 中的等价实现）。
- 示例页面改为 **`useQuery` / 等价** 消费 tRPC 或 RSC 经 `createCaller` 取数。
- Nest 上与 demo 重叠的 **REST** 删除或改为仅保留健康检查（若需要）。

**验收清单**

1. 存在 **`packages/api`**，导出 **`appRouter`** 与 **`AppRouter`**，且 **仅** 含框架无关依赖。
2. **Nest** 暴露内网 tRPC；**Next** 暴露同源 tRPC；浏览器 **仅** 访问 Next。
3. **Next 服务端** 至少一处演示 **`createCaller`** 与 **浏览器** 共用类型。
4. 根 **`pnpm lint`**、**`pnpm test`**、**`pnpm build`** 通过。
5. 无 **TBD** 占位阻塞实现；若实现计划与本文冲突，以 **本文** 为准并回写修订。

---

## 9. 后续工作

- 用户审阅本文件并确认后，使用 **`writing-plans`** 技能撰写 **实现计划**（不在本 spec 内展开具体文件列表与命令）。
