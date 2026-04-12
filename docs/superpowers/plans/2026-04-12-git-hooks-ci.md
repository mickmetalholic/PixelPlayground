# Git Hooks + GitHub CI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 pre-commit 改为 **Biome 写回 + 重新暂存**；新增 **GitHub Actions** 在 PR/push 上执行 **lint → build → 单元测试（Jest 覆盖率门禁）→ E2E**；在 `apps/backend` 落地 **coverageThreshold**（80/80/80/70）并通过补充测试与 `collectCoverageFrom` 收窄满足门禁。

**Architecture:** 根目录继续 **husky → lint-staged**；`lint-staged` 对匹配文件执行 **`biome check --write`** 与 **`git add`**（与 [Biome Git Hooks](https://biomejs.dev/recipes/git-hooks/) 一致）。CI 使用 **pnpm 9 + Node 22**，单 workflow 顺序执行。覆盖率在 **后端包** 用 **`jest --coverage`** + `coverageThreshold`；**不**将 `main.ts` 计入 `collectCoverageFrom`（入口文件，由 E2E 覆盖应用行为；在 Jest 配置内注释说明），其余 `src` 业务文件用单元测试拉满阈值。

**Tech Stack:** pnpm 9.x、Turborepo 2.x、Biome 2.4.x、Husky 9、lint-staged 15、GitHub Actions、`actions/setup-node` + `pnpm/action-setup`、Jest 30、NestJS 11。

**Working copy:** 在隔离 worktree **`.worktrees/feature/git-hooks-ci`**（分支 **`feature/git-hooks-ci`**）上执行本计划；下文路径均相对仓库根目录。

---

## Planned File Structure

| 路径 | 操作 | 职责 |
|------|------|------|
| `package.json`（根） | 修改 | `lint-staged` 改为写回 + `git add`；新增 `test:cov` 脚本 |
| `turbo.json` | 修改 | 注册 `test:cov` 任务（含 `outputs` 便于缓存） |
| `.husky/pre-commit` | 保持 | 仍为 `pnpm exec lint-staged`（无需改，除非验证失败） |
| `apps/backend/package.json` | 修改 | `jest`：`coverageThreshold`、`collectCoverageFrom` 收窄；新增 `test:cov`；保留 `test` 为无覆盖率快速跑 |
| `apps/backend/src/app.service.spec.ts` | 创建 | 覆盖 `AppService` |
| `apps/backend/src/app.module.spec.ts` | 创建 | 覆盖 `AppModule` 可编译 |
| `.github/workflows/ci.yml` | 创建 | PR + push(`main`,`master`)，顺序执行门禁步骤 |

---

### Task 1: 确认基线与分支

**Files:**

- Read-only: `docs/superpowers/specs/2026-04-12-git-hooks-ci-design.md`

- [ ] **Step 1: 在 worktree 中且分支正确**

Run（仓库根；若在主克隆则 `cd` 到 worktree 路径）:

```bash
cd .worktrees/feature/git-hooks-ci
git status -sb
```

Expected: 当前分支为 `feature/git-hooks-ci`，工作区干净或可预期。

- [ ] **Step 2: 证明当前覆盖率未达门禁（可选但推荐）**

Run:

```bash
pnpm install
pnpm --filter @pixel-playground/backend exec jest --coverage --coverageReporters=text-summary
```

Expected: `Statements` / `Lines` 等 **低于** 80%（与 spec 第 6 节一致），用于对照 Task 3 之后应 ≥ 阈值。

---

### Task 2: 根目录 `lint-staged` — 写回 + 重新暂存

**Files:**

- Modify: `package.json`（`lint-staged` 字段）

- [ ] **Step 1: 将 `lint-staged` 从单字符串改为两阶段命令数组**

把根 `package.json` 中的：

```json
"lint-staged": {
  "*.{js,ts,cjs,mjs,d.cts,d.mts,jsx,tsx,json,jsonc}": "biome check --no-errors-on-unmatched --files-ignore-unknown=true"
}
```

替换为：

```json
"lint-staged": {
  "*.{js,ts,cjs,mjs,d.cts,d.mts,jsx,tsx,json,jsonc}": [
    "biome check --write --no-errors-on-unmatched --files-ignore-unknown=true",
    "git add"
  ]
}
```

说明：`lint-staged` 会把匹配到的暂存文件路径传给每条命令；第二条 `git add` 会把 Biome 修改后的文件再次加入索引，符合 spec「选项 A」。

- [ ] **Step 2: 本地验证 hook（手动）**

1. 故意在某个已跟踪的 `.ts` 文件中制造格式问题（例如多余空格），`git add` 该文件。
2. Run: `git commit -m "chore: test pre-commit"`（或临时 message）。

Expected: 提交成功，且 **提交中包含** Biome 格式化后的内容（`git show` 可见）。

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore(git): run biome write and re-stage in lint-staged"
```

---

### Task 3: Jest — collectCoverageFrom、阈值与后端脚本

**Files:**

- Modify: `apps/backend/package.json`（`jest` 配置块与 `scripts`）

- [ ] **Step 1: 在 `apps/backend/package.json` 的 `jest` 对象中更新 `collectCoverageFrom` 并新增 `coverageThreshold`**

在现有 `"jest": { ... }` 内：

1. 将 `"collectCoverageFrom": ["**/*.(t|j)s"]` 替换为（顺序可微调，语义一致即可）：

```json
"collectCoverageFrom": [
  "**/*.(t|j)s",
  "!**/*.spec.ts",
  "!**/main.ts"
]
```

2. 在 `jest` 对象中 **`coverageThreshold` 与 `collectCoverageFrom` 同级** 增加：

```json
"coverageThreshold": {
  "global": {
    "branches": 70,
    "functions": 80,
    "lines": 80,
    "statements": 80
  }
}
```

说明：`*.spec.ts` 不参与覆盖统计；`main.ts` 为进程入口，集成/E2E 验证应用整体行为，避免对 `NestFactory` 做脆弱 mock（与 spec 第 6 节「有理由收窄」一致）。

- [ ] **Step 2: 增加 `test:cov` 脚本，保留 `test` 为纯 `jest`**

在 `apps/backend/package.json` 的 `scripts` 中增加一行（与 `test` 并列）：

```json
"test:cov": "jest --coverage"
```

不修改现有 `"test": "jest"`，以便本地快速跑测试；**门禁**由 `test:cov` 承担（与根脚本 Task 4 衔接）。

- [ ] **Step 3: Commit（仅配置，测试可能仍失败至 Task 4 前）**

```bash
git add apps/backend/package.json
git commit -m "test(backend): add jest coverage thresholds and test:cov script"
```

---

### Task 4: 补充单元测试 — AppService 与 AppModule

**Files:**

- Create: `apps/backend/src/app.service.spec.ts`
- Create: `apps/backend/src/app.module.spec.ts`

- [ ] **Step 1: 创建 `apps/backend/src/app.service.spec.ts`**

完整文件内容：

```typescript
import { Test, type TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getHello returns greeting', () => {
    expect(service.getHello()).toBe('Hello World!');
  });
});
```

- [ ] **Step 2: 创建 `apps/backend/src/app.module.spec.ts`**

完整文件内容：

```typescript
import { Test, type TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';

describe('AppModule', () => {
  it('compiles', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(module).toBeDefined();
  });
});
```

- [ ] **Step 3: 运行覆盖率并确认通过阈值**

Run（仓库根）:

```bash
pnpm --filter @pixel-playground/backend run test:cov
```

Expected: 退出码 `0`；终端或 `apps/backend/coverage` 报告中 **global** 满足 `coverageThreshold`（若失败，检查是否仍有未覆盖的 `src` 下非 `main`、非 spec 文件）。

- [ ] **Step 4: Commit**

```bash
git add apps/backend/src/app.service.spec.ts apps/backend/src/app.module.spec.ts
git commit -m "test(backend): add specs for AppService and AppModule"
```

---

### Task 5: Turborepo 与根 `test:cov`

**Files:**

- Modify: `turbo.json`
- Modify: `package.json`（根）

- [ ] **Step 1: 在 `turbo.json` 的 `tasks` 中增加 `test:cov`**

在 `"test": { ... }` 旁增加（`outputs` 指向后端生成目录，便于缓存键）：

```json
"test:cov": {
  "outputs": ["coverage/**"]
}
```

若 Turborepo 版本要求显式 `cache` 字段，保持与 `test` 任务一致即可。

- [ ] **Step 2: 在根 `package.json` 的 `scripts` 中增加**

```json
"test:cov": "turbo run test:cov"
```

- [ ] **Step 3: 从仓库根运行**

Run:

```bash
pnpm test:cov
```

Expected: `@pixel-playground/backend` 执行 `test:cov`，退出码 `0`。

- [ ] **Step 4: Commit**

```bash
git add turbo.json package.json
git commit -m "build(turbo): wire root test:cov task"
```

---

### Task 6: GitHub Actions — `.github/workflows/ci.yml`

**Files:**

- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: 创建工作流文件**

创建 `.github/workflows/ci.yml`，完整内容：

```yaml
name: CI

on:
  pull_request:
  push:
    branches:
      - main
      - master

concurrency:
  group: ci-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Build
        run: pnpm build

      - name: Unit tests with coverage
        run: pnpm test:cov

      - name: E2E tests
        run: pnpm --filter @pixel-playground/backend run test:e2e
```

说明：`pnpm/action-setup` 的 `version: 9` 与根 `packageManager` 大版本一致；Node **22** 与 `engines` 对齐。`concurrency` 减少重复 PR 推送时的排队（可按团队喜好删除）。

- [ ] **Step 2: 本地用 `act` 或推送到 fork 验证（可选）**

若无 `act`，至少保证 YAML 缩进无误；合并后首次在 GitHub 上观察运行结果。

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add lint, build, test coverage, and e2e workflow"
```

---

### Task 7: 全量验收与文档提醒

**Files:**

- Read-only: `docs/superpowers/specs/2026-04-12-git-hooks-ci-design.md`（验收对照）

- [ ] **Step 1: 根目录脚本顺序与 spec 4.2 一致**

在仓库根依次执行：

```bash
pnpm install
pnpm lint
pnpm build
pnpm test:cov
pnpm --filter @pixel-playground/backend run test:e2e
```

Expected: 全部退出码 `0`。

- [ ] **Step 2: 快速单元测试（无覆盖率）仍可用**

```bash
pnpm test
```

Expected: 退出码 `0`（`turbo run test` 仍跑后端 `jest` 不带 `--coverage`）。

- [ ] **Step 3: 记录运维提醒（无需改 spec 文件，可在 PR 描述中写）**

在 PR 描述或团队 wiki 提醒：**在 GitHub 仓库 Settings → Branches → Branch protection** 中为 `main` 勾选 **Require status checks to pass**，并选中 **`CI`**（或工作流显示的名称），以便「合并前门禁」在平台上生效（spec 第 2、7 节）。

---

## Plan self-review（对照 spec）

| Spec 要求 | 对应任务 |
|-----------|----------|
| pre-commit Biome 写回 + 重新暂存 | Task 2 |
| CI：lint → build → 单元测试（覆盖率）→ E2E | Task 3–6（`pnpm test:cov` + `test:e2e`） |
| Jest 全局阈值 80/80/80/70 | Task 3 `coverageThreshold` |
| Node 22、pnpm 9 | Task 6 |
| 覆盖率风险：补齐或收窄 `collectCoverageFrom` | Task 3（排除 `main`、spec）+ Task 4（测试） |
| 与 `2026-04-10` pre-commit 仅 check 的冲突 | Task 2 取代行为；无需改旧 spec 文件（设计 spec 9 节已说明） |

**占位符扫描：** 本计划不含 TBD/TODO 式步骤；YAML 与 JSON 片段可直接粘贴使用。

**一致性：** `test:cov` 在根、`apps/backend`、`turbo.json` 三处命名一致；`@pixel-playground/backend` 与现有 `package.json` name 一致。

---

**Plan complete and saved to** `docs/superpowers/plans/2026-04-12-git-hooks-ci.md`。

**执行方式二选一：**

1. **Subagent-Driven（推荐）** — 按任务逐个派生子代理，任务间人工/代理复核，迭代快。需配合 **superpowers:subagent-driven-development**。
2. **Inline Execution** — 本会话或单会话内按步骤执行，配合 **superpowers:executing-plans**，适合你自己逐步点执行。

你更倾向哪一种？
