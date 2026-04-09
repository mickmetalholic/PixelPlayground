# Turborepo + pnpm 最小 Monorepo 骨架 — 设计说明

**状态：** 已批准（对话确认）  
**日期：** 2026-04-10  
**范围：** 将空仓库初始化为 pnpm workspace + Turborepo 壳子；无示例应用、无业务代码。

---

## 1. 目标

- 使用 **pnpm** 作为工作区包管理器。
- 使用 **Turborepo** 编排任务（缓存与依赖图预留）。
- 目录约定：`apps/*`（应用）、`packages/*`（库）；初始化阶段**仅占位**，不创建子包 `package.json`。
- **TypeScript 就绪**：根目录提供可被子包 `extends` 的基础 `tsconfig.json`。
- **Node 22**：通过 `.nvmrc` 与根 `package.json` 的 `engines` 对齐声明。

## 2. 非目标

- 不添加示例应用（如 Next.js、Vite 模板）。
- 不添加共享配置包（如 `packages/tsconfig`），除非后续单独开 spec。
- 不引入 commitlint、CI、测试框架或 ESLint（除非后续 spec 要求）。
- 不在此阶段编写根目录「业务 README」；本文件即为设计依据。

## 3. 成功标准

实现完成后须满足：

1. `pnpm install` 成功结束（生成并提交 `pnpm-lock.yaml`）。
2. `pnpm turbo run build`（或根脚本等价调用）**退出码为 0**；在尚无子包、根未定义对应脚本时，允许 Turbo 实质上无任务或仅解析空图，但**不得**因配置错误失败。
3. 根 `tsconfig.json` 可被 `pnpm exec tsc --showConfig`（或文档规定的等价命令）正常解析。
4. `.nvmrc` 与 `engines.node` 一致指向 **Node 22**（具体 patch 版本由 lock/tooling 决定时，至少主版本为 22）。

## 4. 目录结构

```text
.
├── apps/
│   └── .gitkeep
├── packages/
│   └── .gitkeep
├── package.json          # 根包，private: true
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── turbo.json
├── tsconfig.json
├── .nvmrc
├── .gitignore
└── docs/superpowers/specs/2026-04-10-turborepo-monorepo-design.md
```

说明：`apps/`、`packages/` 内**不**放置子包 `package.json`；仅用 `.gitkeep` 保证空目录纳入 Git。

## 5. 文件职责与约定

### 5.1 `pnpm-workspace.yaml`

- 声明工作区 glob：`apps/*`、`packages/*`。
- 与「当前无子包」兼容：glob 无匹配时 pnpm 仍应正常安装根包。

### 5.2 根 `package.json`

- `private: true`。
- `scripts`：通过 `turbo run` 暴露标准任务名（至少包含 `build`；`dev`、`lint` 作为预留任务名，与 `turbo.json` 一致）。
- `devDependencies`：包含 `turbo`、`typescript`；版本在实现时按当前稳定版锁定并写入 lockfile。
- `packageManager`：固定 pnpm 主版本（例如 `pnpm@9.x.y`），便于 Corepack 复现。
- `engines.node`：约束为 `>=22.0.0 <23`（或等价范围，须与 `.nvmrc` 一致）。

### 5.3 `turbo.json`

- 使用 **Turborepo 2.x** 推荐的 `tasks` 形态（实现前用官方文档或 Context7 核对字段名）。
- 预置任务建议：
  - `build`：`dependsOn: ["^build"]`，`outputs` 含常见产物目录（如 `dist/**`），便于后续子包接入。
  - `dev`：`cache: false`，`persistent: true`（若官方对空仓库有注意项，实现时按文档调整）。
  - `lint`：占位；无执行器时不得导致「未配置即失败」的冲突（若 Turbo 要求每个包有脚本，则实现阶段以官方行为为准，可在根包增加 no-op 或文档说明）。

若「零子包 + 根无对应 npm script」导致 `pnpm turbo run <task>` 非零退出，实现者须在实现计划中采用**官方推荐或文档化**的最低修正（例如在根 `package.json` 增加与任务名匹配的 no-op script，或收窄 `turbo.json` 任务范围），并保证第 3 节成功标准成立；若有结构性变更须回写修订本 spec。

### 5.4 `tsconfig.json`（根）

- 作为基础配置供未来子包继承；根目录当前可无 `.ts` 源码。
- 建议包含：`strict: true`、`skipLibCheck: true`、`noEmit: true`（根基线常见做法，避免根目录误产出）；`module`、`moduleResolution`、`target` 取值与 Node 22 + 现代 ESM 惯例一致（具体键值在实现计划中给出并一次到位）。

### 5.5 `.nvmrc`

- 单行：`22`（或与 `engines` 对齐的 `22.x` 具体版本；须与 `engines` 不冲突）。

### 5.6 `.gitignore`

至少包含：`node_modules/`、`.turbo/`、`dist/`、常见日志与本地环境文件（如 `.env*.local`）。不与 `.cursor/` 等已纳入版本的内容冲突。

### 5.7 可选 `.npmrc`

默认**不**添加；仅在 pnpm 与 Turborepo 官方要求或 Windows/CI 实测需要时再引入（YAGNI）。

## 6. 架构与边界

- **编排层：** Turborepo 仅负责任务图与缓存；不包含业务逻辑。
- **包边界：** 根包持有工具链依赖；业务包出现后独立置于 `apps/*` 或 `packages/*`。
- **数据流：** 无；本阶段无运行时服务。

## 7. 错误处理与运维

- **依赖复现：** 提交 `pnpm-lock.yaml`；`packageManager` 字段与 lock 同步。
- **Node 版本：** `.nvmrc` + `engines` 为声明式约束；不在本 spec 强制 `engine-strict`（若后续需要，另开变更）。

## 8. 验证清单（手工）

1. `pnpm install`
2. `pnpm turbo run build`（或根脚本包装后的等价命令）
3. `pnpm exec tsc --showConfig`（确认根 tsconfig 可加载）
4. 可选：`node -v` 在 22.x 下执行上述命令

## 9. 方案记录（头脑风暴结论）

| 方案 | 摘要 | 结论 |
|------|------|------|
| A | 纯根配置 + `apps/`、`packages/` 占位 | **采用** |
| B | 额外 `packages/tsconfig` 共享包 | 否（超出最小骨架） |
| C | `create-turbo` 后删示例 | 否 |

## 10. 后续流程

1. 用户审阅本文件并确认无歧义后，使用 **writing-plans** 生成 `docs/superpowers/plans/YYYY-MM-DD-turborepo-monorepo.md` 实现计划。
2. 实现计划执行时优先查阅 Turborepo 官方文档或 Context7，核对 `turbo.json` 与 CLI 行为。

## 11. 实现备注（2026-04-10）

- **Turbo 空图：** 在仅有根包、无 `apps/*` / `packages/*` 子包 `package.json`、且根脚本为 `turbo run build` 时，`pnpm turbo run build` 以 **0 个 package、退出码 0** 结束（日志含 `Running build in 0 packages`）。**未**采用根级 `echo` no-op 作为补丁。
- **`tsc --showConfig`：** 当仓库内无任何 `.ts` 输入时，TypeScript 会报 `TS18003`。为满足第 3 节成功标准，增加 `types/workspace-stub.ts`（内容为 `export {}`），并在根 `tsconfig.json` 中设置 `"include": ["types/**/*.ts"]`。该文件仅用于工具链自检，**不是**业务示例应用。
