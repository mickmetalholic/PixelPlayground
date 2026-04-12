# NestJS apps/backend 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans，按任务逐步执行。步骤使用复选框（`- [ ]`）语法便于跟踪。

**Goal:** 在 `apps/backend` 用官方 `@nestjs/cli` 生成 Nest 应用，包名 `@pixel-playground/backend`，接入 pnpm workspace 与 Turborepo；移除子包 ESLint/Prettier，使根目录 `biome check .` 与 `pnpm turbo run build|test|dev|lint`（子包）全部成功。

**Architecture:** 单一代码应用目录 `apps/backend/`，构建产物 `dist/`；lint 与格式由**仓库根** `biome.json` 统一，子包仅声明 `lint` 脚本调用 Biome CLI；依赖与锁文件仅通过**根** `pnpm install` 维护。

**Tech Stack:** Node 22（与 `engines` 一致）、pnpm 9、Turborepo 2、NestJS（CLI 生成版本以 `@nestjs/cli@11` 为准）、Jest（Nest 默认）、Biome 2.4.11。

**前置条件:** 在专用 worktree（例如 `.worktrees/feature/nestjs-backend`）与分支 `feature/nestjs-backend` 上执行；本机 Node 建议使用 `nvm use` / Corepack 对齐 `.nvmrc`（22.x），避免 `engines` 警告。

---

## 文件映射（创建 / 修改）

| 路径 | 职责 |
|------|------|
| `apps/backend/**` | Nest CLI 生成；后续手改 `package.json`、删 ESLint/Prettier 相关文件 |
| `apps/backend/package.json` | `name`、`engines`、`scripts`（`build`/`dev`/`test`/`lint`）、`devDependencies`（含 `@biomejs/biome`）、移除 eslint/prettier 相关 |
| `apps/backend/nest-cli.json`、`apps/backend/tsconfig*.json`、`apps/backend/src/**` | 保持 CLI 默认结构；仅因 Biome 格式或规则要求做小改 |
| `apps/backend/test/**`、`apps/backend/src/**/*.spec.ts` | 保留 Nest 默认 Jest 测试；不删示例测试 |
| `biome.json` | 增加 `files.ignore`（或等价字段），忽略 `apps/backend/dist`、`apps/backend/coverage` 等产物目录 |
| `pnpm-lock.yaml` | 根安装后更新 |
| `apps/.gitkeep` | 删除（被子项目替代） |

**不修改（除非验收失败且必须）：** 根 `package.json` 的 `lint` 当前为 `biome check .`，与 spec 第 4 节一致；`turbo.json` 若仍含已废弃的 `//#lint:root` 任务名而根无对应脚本，**不在本计划内清理**（避免扩大范围），以 `pnpm turbo run build|test|dev` 及子包 `lint` 为准。

---

### Task 1: 用官方 CLI 脚手架生成 `apps/backend`

**Files:**

- Create: `apps/backend/**`（由 CLI 生成）
- Delete: `apps/.gitkeep`（可在 Task 1 末尾或 Task 2 删除）

- [ ] **Step 1: 在仓库根目录执行 scaffold（不提交嵌套 Git）**

在仓库根目录（`pixel-playground` 根），使用与 [Nest CLI 文档 · nest new](https://docs.nestjs.com/cli/usages) 一致的选项：`--package-manager`、`--strict`、`--skip-git`、`--directory`。

```bash
pnpm dlx @nestjs/cli@11 new backend --directory apps/backend --package-manager pnpm --strict --skip-git --skip-install
```

**预期：** 出现 `apps/backend/package.json`、`apps/backend/src/main.ts` 等；**不应**在 `apps/backend` 内初始化新的 `.git` 目录。

- [ ] **Step 2: 删除占位文件**

```bash
rm apps/.gitkeep
```

（Windows PowerShell：`Remove-Item apps/.gitkeep -ErrorAction SilentlyContinue`）

- [ ] **Step 3: 提交**

```bash
git add apps/backend apps/.gitkeep
git commit -m "feat(backend): scaffold nest app with official cli"
```

---

### Task 2: 将子包元数据对齐 monorepo（包名、engines、脚本名）

**Files:**

- Modify: `apps/backend/package.json`

- [ ] **Step 1: 编辑 `apps/backend/package.json`**

将 `name` 设为 `"@pixel-playground/backend"`。

在顶层增加（与根 `package.json` 一致）：

```json
"engines": {
  "node": ">=22.0.0 <23"
}
```

确保存在以下 `scripts`（若 CLI 用了不同键名，则合并为下表语义；**不要**删除 `build`、`test` 的 Nest 默认实现，仅增改行）：

| script | 值（推荐） |
|--------|------------|
| `build` | `nest build` |
| `dev` | `nest start --watch` |
| `test` | 保持 CLI 生成的 Jest 命令（一般为 `jest` 或带配置的包装） |
| `lint` | 暂占位为 `biome check .`（Task 3 安装 Biome 后再验收） |

若原文件中有 `start:dev` 而无 `dev`，保留 `start:dev` 亦可，但 Turborepo 任务名为 `dev`，**必须**提供 `dev` 脚本，内容等价于 `nest start --watch`。

完整示例（节选，保留 Nest 生成的其余字段如 `dependencies`）：

```json
{
  "name": "@pixel-playground/backend",
  "version": "0.0.1",
  "private": true,
  "engines": {
    "node": ">=22.0.0 <23"
  },
  "scripts": {
    "build": "nest build",
    "dev": "nest start --watch",
    "test": "jest",
    "lint": "biome check ."
  }
}
```

（`version`、依赖版本以你本地生成文件为准，勿手抄版本号；仅保证 `name`、`engines`、`scripts` 键语义正确。）

- [ ] **Step 2: 提交**

```bash
git add apps/backend/package.json
git commit -m "feat(backend): align package name and turbo scripts"
```

---

### Task 3: 移除 ESLint / Prettier，并接入 Biome CLI

**Files:**

- Modify: `apps/backend/package.json`
- Delete: `apps/backend` 下所有 ESLint / Prettier 配置文件（存在则删，无则跳过）

- [ ] **Step 1: 从 `apps/backend/package.json` 移除依赖**

删除（若存在）名称匹配以下模式的 `devDependencies` / `dependencies` 项：

- `eslint`、`prettier`、`@eslint/*`、`eslint-*`、`@typescript-eslint/*`、`eslint-config-prettier`、`eslint-plugin-prettier`

删除 `scripts` 中调用 `eslint` 的条目（若仍有 `lint` 指向 eslint，已由 Task 2 改为 `biome check .`）。

- [ ] **Step 2: 添加 Biome（与子仓库根版本一致）**

在 `apps/backend/package.json` 的 `devDependencies` 中增加：

```json
"@biomejs/biome": "2.4.11"
```

- [ ] **Step 3: 删除配置文件**

删除以下路径（若存在）：

- `apps/backend/.eslintrc.js`
- `apps/backend/.eslintrc.cjs`
- `apps/backend/.eslintrc.json`
- `apps/backend/eslint.config.js`
- `apps/backend/eslint.config.mjs`
- `apps/backend/eslint.config.cjs`
- `apps/backend/.prettierrc`
- `apps/backend/.prettierrc.json`
- `apps/backend/.prettierignore`
- `apps/backend/.eslintignore`

- [ ] **Step 4: 根目录安装**

在**仓库根**执行：

```bash
pnpm install
```

**预期：** `pnpm-lock.yaml` 更新；无未解析依赖。

若 pnpm 提示需对 `@nestjs/core` 等批准构建脚本，按终端提示执行 `pnpm approve-builds`（或当前 pnpm 版本等价命令），直至安装干净。

- [ ] **Step 5: 提交**

```bash
git add apps/backend package.json pnpm-lock.yaml
git commit -m "chore(backend): drop eslint/prettier and use biome"
```

（若根 `package.json` 无变更则不要加入 `git add`。）

---

### Task 4: 根 `biome.json` 忽略构建与覆盖率产物

**Files:**

- Modify: `biome.json`

- [ ] **Step 1: 在 `files` 中增加 `ignore` 数组**

在现有 `biome.json` 的 `"files"` 对象内增加 `"ignore"`（若已有则合并，不重复项），至少包含：

```json
"ignore": [
  "**/node_modules/**",
  "**/dist/**",
  "**/coverage/**"
]
```

若你的 `files` 已包含其他键，保持合并后的 JSON 有效；`**/dist/**` 已覆盖 `apps/backend/dist`。

- [ ] **Step 2: 根目录检查**

```bash
pnpm lint
```

**预期：** 退出码 `0`。若有格式问题仅因换行，执行：

```bash
pnpm lint:fix
pnpm lint
```

- [ ] **Step 3: 提交**

```bash
git add biome.json
git commit -m "chore(biome): ignore dist and coverage for nest backend"
```

---

### Task 5: 验收（构建、测试、Lint、Dev）

**Files:** 无新增；仅运行命令。

- [ ] **Step 1: 构建**

```bash
pnpm turbo run build --filter=@pixel-playground/backend
```

**预期：** 成功；存在 `apps/backend/dist`（或 Nest 配置指定的输出目录）。

- [ ] **Step 2: 测试（TDD：沿用模板内既有用例）**

```bash
pnpm turbo run test --filter=@pixel-playground/backend
```

**预期：** Jest 全部通过；**不得**删除 `src/**/*.spec.ts` 或 `test/**` 中模板测试以「通过」验收。

- [ ] **Step 3: 子包 lint**

```bash
pnpm turbo run lint --filter=@pixel-playground/backend
```

**预期：** 退出码 `0`。

- [ ] **Step 4: 全仓 lint**

```bash
pnpm lint
```

**预期：** 退出码 `0`。

- [ ] **Step 5: Dev（手动 smoke）**

```bash
pnpm turbo run dev --filter=@pixel-playground/backend
```

**预期：** 进程持续运行；控制台无立即崩溃。用 `Ctrl+C` 结束。若默认端口非 3000，以控制台输出为准，**不要求**改端口。

- [ ] **Step 6: 若有未提交格式化结果，再提交一次**

```bash
git status
git add -A
git commit -m "style: apply biome after nest backend setup"
```

---

## Spec 对照自检（计划作者已完成）

| Spec 章节 | 对应任务 |
|-----------|----------|
| §1 决策（pnpm、strict、包名、Biome） | Task 1–3 |
| §2 目标（workspace、Turbo、lint） | Task 2–5 |
| §4 成功标准 1–5 | Task 5 |
| §5 架构（CLI、`--skip-git`、删 `.gitkeep`） | Task 1–2 |
| §6 Biome 收敛 | Task 3–4 |
| §7 脚本表 | Task 2 |
| §8 测试 | Task 5 Step 2 |
| §11 验证清单 | Task 5 |

**占位符扫描：** 本计划不含 TBD/TODO/「适当处理」类步骤；CLI 子命令以官方文档为准处已给出固定包主版本 `@11` 与文档链接。

---

## 执行交接

**计划已保存至 `docs/superpowers/plans/2026-04-12-nestjs-backend.md`。可选执行方式：**

1. **Subagent-Driven（推荐）** — 每个任务派生子代理，任务间人工复核，迭代快。  
2. **Inline Execution** — 本会话内按 `executing-plans` 批量执行并设检查点。

**你希望采用哪一种？**
