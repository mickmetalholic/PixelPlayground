# Git 预提交钩子与 GitHub CI（Lint / Build / Test / 覆盖率）— 设计说明

**状态：** 已写入仓库，待你审阅 spec 文本  
**日期：** 2026-04-12  
**范围：** 在现有 **pnpm + Turborepo + Biome + Husky + lint-staged** 基础上，将 **pre-commit** 改为对暂存文件 **Biome 检查并写回**，并对被修改文件 **再次 `git add`**；新增 **GitHub Actions**，在 **PR 合并前**（及主干推送时）执行 **lint → build → 单元测试（含 Jest 覆盖率门禁）→ E2E**。不引入 ESLint / Prettier。

---

## 1. 已定决策摘要

| 项 | 选择 |
|----|------|
| Pre-commit 写回策略 | 对匹配 glob 的暂存文件执行 **`biome check --write`**，随后将改动 **重新暂存**（`git add` 或与 lint-staged 等价的官方推荐写法），使 **本次 `git commit` 包含修复结果** |
| 覆盖率门禁 | Jest 全局 **`coverageThreshold`**：`lines` / `statements` / `functions` **≥ 80%**，`branches` **≥ 70%** |
| CI 中「test」范围 | **单元测试（含覆盖率）** + **`test:e2e`**，同一 workflow 内顺序执行；任一失败则 job 失败 |
| CI 工作流形态 | **单体 workflow**（单 job 顺序执行步骤）；若后续需「lint 更快失败」可再拆 job（非本 spec 必须） |
| Node / pnpm | CI 使用 **Node 22.x**、**pnpm 9.x**，与根 `package.json` 的 `engines` 与 `packageManager` 对齐 |

---

## 2. 目标

- **本地：** `git commit` 前，对 **暂存且匹配 lint-staged glob** 的源码运行 **Biome 检查并自动修复**；修复后的文件通过 **重新暂存** 纳入当前提交，避免「工作区已改但未进提交」的静默不一致。
- **GitHub：** 通过 **`.github/workflows`** 在 **pull_request** 与 **push**（至少 `main`；若存在 `master` 则一并包含）上执行 **lint、build、带阈值的单元测试覆盖率、E2E**，作为 **PR 合并前的质量门禁**（仓库需在 Branch protection 中要求该检查通过，属平台配置）。
- **单一事实来源：** 与 `docs/superpowers/specs/2026-04-10-biome-lint-design.md` 相比，**修订**其关于 **pre-commit 仅 check、不写回** 的约定；全仓仍仅 **一份** `biome.json`，不新增 ESLint/Prettier。

---

## 3. 非目标

- 不在本 spec 中规定 **Codecov / Coveralls** 等第三方上报（可后续追加）。
- 不将 **Branch protection** 的具体勾选步骤列为代码验收项（仅在实现计划或运维说明中提醒）。
- 不引入 **lefthook** 等替代 Husky 的钩子框架（除非实现阶段发现与 lint-staged 冲突，再另开变更）。

---

## 4. 架构与数据流

### 4.1 本地

```text
git commit → husky → lint-staged → biome check --write（暂存子集）→ git add（被改动文件）→ 继续提交
```

- **lint-staged** 的 glob 与根 `package.json` 现有约定一致或在其上微调；CLI 参数须与 **Biome 官方 Git Hooks 食谱**一致（含 `--no-errors-on-unmatched`、`--files-ignore-unknown` 等，以实现计划写死为准）。
- **禁止**在 pre-commit 中默认运行全仓 `pnpm lint:fix` 作为主要手段（避免大面积改动未暂存文件）。

### 4.2 CI

```text
checkout → 安装 pnpm + Node → pnpm install --frozen-lockfile → pnpm lint → pnpm build → 单元测试（--coverage， enforced by coverageThreshold）→ apps/backend test:e2e
```

- **lint / build / test** 均通过仓库根脚本（`pnpm lint`、`pnpm build`、`pnpm test` 及 E2E 的调用方式以实现计划为准），保证与本地 `package.json` 一致。
- **E2E** 在单元测试与覆盖率通过之后执行，失败则整 job 失败。

---

## 5. 文件与脚本约定（实现阶段落地）

| 产物 / 配置 | 职责 |
|-------------|------|
| `.husky/pre-commit` | 继续调用 `lint-staged`（或官方推荐等价） |
| 根 `package.json` | 更新 **`lint-staged`**：写回 + 重新暂存；不删除 `prepare` / `husky` |
| `.github/workflows/ci.yml`（名称可微调） | 定义触发器、Node/pnpm、步骤顺序 |
| `apps/backend` 内 Jest 配置 | 增加 **`coverageThreshold`**（80% / 80% / 80% / 70% 对应 statements/lines/functions/branches，字段名以 Jest 文档为准） |

---

## 6. 覆盖率与当前仓库风险

- 启用 **80% / 70%** 全局阈值后，**当前** `apps/backend` 实测覆盖率 **低于** 该门槛（实现前基线约为语句 **50%+** 量级，以当时 `jest --coverage` 为准）。
- **本 spec 仍采用用户选定之严格阈值。** 实现交付须 **同时** 包含：将覆盖率提升至阈值以上，或 **显式、有理由地** 收窄 `collectCoverageFrom` 并仍满足阈值语义（须在实现计划中写清，避免「为过关而关覆盖」无记录）。
- CI 与本地使用 **同一套** Jest `coverageThreshold`，避免双轨。

---

## 7. 错误处理

- **Biome：** CLI 非零退出码 → lint-staged 失败 → **提交中止**。
- **CI：** 任一步骤失败 → workflow 失败 → **不得合并**（在 Branch protection 配置正确的前提下）。

---

## 8. 测试与验收（实现阶段）

- **本地：** 故意引入 Biome 可报告问题于暂存文件 → pre-commit **失败**；修复并暂存后 → **可提交**；提交内容 **包含** 格式化/修复结果。
- **CI：** 打开 PR → 工作流 **全部通过**（在覆盖率已达标的前提下）；故意破坏 lint/build/test/e2e 之一 → **失败**。

---

## 9. 与既有 spec 的关系

- **`2026-04-10-biome-lint-design.md`：** 其中 **第 6、7 节及门禁层「仅 biome check、不写回」** 的表述，由 **本文件** 在 **pre-commit 行为**上予以 **取代**；其余（单一 Biome 配置、根脚本、`pnpm lint` 语义等）仍适用 unless 与本文件冲突。
- **`2026-04-12-nestjs-backend-design.md`** 中「不新增 CI」的表述，在 **本 spec 生效后** 以 **本文件为准** 覆盖该非目标条款。

---

## 10. 后续步骤

- 用户确认本 spec 文本无异议后，使用 **writing-plans** 技能编写实现计划（含：workflow 逐步、Jest 阈值落地、覆盖率补齐策略、pre-commit 命令级清单）。
