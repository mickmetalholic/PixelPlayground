# apps/backend NestJS 子项目（官方 CLI）— 设计说明

**状态：** 待审阅（设计已定稿，待你确认 spec 文本）  
**日期：** 2026-04-12  
**范围：** 在现有 pnpm + Turborepo monorepo 的 `apps/` 下，使用 **Nest 官方脚手架** 新增 **`apps/backend`**；包管理器 **pnpm**，启用 **`--strict`**；与根目录 **Biome** 单一工具链对齐（移除子包 ESLint/Prettier）。不实现业务功能。

---

## 1. 已定决策摘要

| 项 | 选择 |
|----|------|
| 目录 | `apps/backend/`（CLI 直接生成到此路径，不在其下再套一层同名目录） |
| 包管理器 | `pnpm`（与 monorepo 一致） |
| CLI | `@nestjs/cli` 官方 `nest new`（实现前以官方文档核对**精确参数名**） |
| TypeScript | 使用 CLI 的 **`--strict`** |
| Lint / 格式 | **以 Biome 为准**；实现阶段从子包移除 ESLint、Prettier 及仅服务它们的依赖与脚本 |
| 子包 `package.json` 的 `name` | **`@pixel-playground/backend`**（与根包 `pixel-playground` 对齐） |
| Node | 与根 `package.json` 的 `engines` 及 `.nvmrc` 一致（**Node 22**） |

---

## 2. 目标

- 在 **`apps/backend`** 提供由 **Nest 官方 CLI** 生成的、**可构建、可测试、可本地开发**的默认 HTTP 应用（行为与端口等遵循模板，不在本 spec 自定义）。
- 子项目纳入 **pnpm workspace**；以**仓库根** `pnpm install` 为唯一安装入口，**不**要求提交子目录独立 lockfile。
- **Turborepo**：子包提供与根 `turbo.json` 已存在的任务名 **`build` / `dev` / `lint` / `test`** 兼容的脚本，构建产物目录与现有 **`outputs`（`dist/**`）** 对齐或在本文件中说明例外。
- **Lint**：全仓仍仅根目录 **一份** `biome.json`；`apps/backend` 经收敛后 **`pnpm lint`（含子包与根）退出码为 0**。

---

## 3. 非目标

- 不实现业务域（认证、数据库、领域模块等）。
- 不强制在本 spec 内将子包 `tsconfig` 改为继承根 `tsconfig`（若后续要统一，可另开 spec）。
- 不新增 CI 工作流（除非后续单独要求）。
- 不引入与 Biome 重叠的 ESLint/Prettier 作为长期方案。

---

## 4. 成功标准

实现完成后须满足：

1. **`pnpm install`** 成功，`pnpm-lock.yaml` 合理更新。
2. **`pnpm turbo run build`** 成功，且 **`apps/backend`** 的 `build` 产生预期产物（一般为 `dist/**`，与 `turbo.json` 的 `outputs` 一致）。
3. **`pnpm turbo run test`** 能跑通子包测试（保留 Nest 默认 **Jest**；若与 Node 22 明显不兼容，在实现计划中说明替换方案并仍满足本项）。
4. **`pnpm lint`** **退出码为 0**（含子包 `lint` 与根 `//#lint:root` 的既有约定）。
5. **`pnpm turbo run dev`** 能启动持久 dev（或对 `backend` 使用 `--filter=@pixel-playground/backend`，以实现计划写死的命令为准）。

---

## 5. 架构与目录

```text
apps/
└── backend/                 # Nest CLI 生成内容（src、nest-cli.json、tsconfig* 等）
```

- 生成后删除 **`apps/.gitkeep`**（若仍存在），避免空占位与真实应用并存。
- **CLI 调用**：实现阶段使用 **`npx @nestjs/cli`**（或项目约定的固定主版本），参数须包含：**项目名 `backend`、目标路径 `apps/backend`、`--package-manager pnpm`、`--strict`**，以及**避免在子目录创建独立 Git 仓库**的官方选项（具体名称以实现前查 **Nest CLI 官方文档**为准）。
- **实现前强制核对**：不得以本 spec 替代官方文档；建议使用 Context7 或官网核对 `nest new` 在 monorepo 下的推荐写法。

---

## 6. Biome 与「去 ESLint」收敛

与 `docs/superpowers/specs/2026-04-10-biome-lint-design.md` 一致：全仓仅根 **一份** Biome 配置。

实现阶段应完成（以脚手架实际生成为准调整清单）：

1. **依赖**：从 `apps/backend/package.json` 移除 ESLint、Prettier 及仅服务于它们的插件包。
2. **文件**：删除 `eslint*`、`.prettierrc*` 等模板配置文件（若存在）。
3. **脚本**：子包 **`lint`** 改为通过 **Biome**（`biome check`，路径与标志以官方文档为准），**不再**调用 `eslint`。
4. **忽略**：根 `biome.json` 的忽略列表包含 Nest 常见产物，例如 **`apps/backend/dist`**、**`coverage`** 等。
5. **风格**：与仓库现有 Biome 约定一致（如 tab、双引号）；必要时运行根 `pnpm lint:fix` 或等价命令一次性对齐。

若默认规则与 Nest 模板冲突，在实现计划中逐项解决，不在本 spec 预演每一条规则。

---

## 7. Turborepo 与子包脚本

| 脚本 | 语义 |
|------|------|
| `build` | 编译至约定输出（一般为 `dist/`，与 `turbo.json` 的 `outputs` 一致）。 |
| `dev` | Nest 开发监听，长期运行，与 Turbo 中 `dev` 的 `persistent: true` 一致。 |
| `test` | 运行 Jest（或实现计划批准的等价方案），非零退出码表示失败。 |
| `lint` | 仅 Biome，成功则退出码 0。 |

根目录继续通过 **`pnpm build` / `pnpm dev` / `pnpm test` / `pnpm lint`** 经 **`turbo run`** 聚合；可选用 **`pnpm --filter @pixel-playground/backend`** 仅操作本子项目。

---

## 8. 测试

- 保留 Nest 脚手架默认的 **Jest** 配置与示例测试，除非与 Node 22 或 monorepo 约束冲突；若需调整，在实现计划中说明并仍满足第 4 节成功标准。

---

## 9. 错误处理（应用层）

- 不新增全局异常过滤器或业务错误码；保留 **Nest 模板默认**未捕获异常行为。业务化错误处理由后续 spec 定义。

---

## 10. 与既有文档的关系

- `2026-04-10-turborepo-monorepo-design.md`：定义 monorepo 壳子；本子项目为该壳子下首个真实 `apps/*` 应用。
- `2026-04-10-biome-lint-design.md`：定义全仓 Biome；本子项目必须收敛 ESLint，避免与之冲突。

---

## 11. 验证清单（实现者自检）

- `pnpm install`、`pnpm lint`、`pnpm turbo run build`、`pnpm turbo run test`、`pnpm turbo run dev`（或 filter 等价）。
- `apps/backend` 无 ESLint/Prettier 依赖与冲突脚本；Biome 覆盖该目录源码且无报错。
- 暂存仅 `apps/backend` 下文件时，pre-commit（lint-staged）行为符合既有 Biome 设计。
