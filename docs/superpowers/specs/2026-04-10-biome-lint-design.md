# Biome 全仓 Lint + Pre-commit 门禁 — 设计说明

**状态：** 待审阅（设计已定稿，待你确认 spec 文本）  
**日期：** 2026-04-10  
**范围：** 在现有 pnpm + Turborepo 骨架上，引入 **Biome** 作为唯一前端/JSON 静态检查与格式化工具；根目录单一配置；增加 **husky + lint-staged** 的 pre-commit 门禁。不引入 ESLint / Prettier。

---

## 1. 目标

- 使用 **`@biomejs/biome`**（根 `devDependencies`），在仓库根维护 **唯一** `biome.json` 或 `biome.jsonc`，供未来 `apps/*`、`packages/*` 共用。
- 第一版即对 **TypeScript、JavaScript、JSON**（及 Biome 默认可解析、且与本仓库相关的同类文件，如实现阶段官方支持且需纳入的扩展名）启用 **formatter + linter**。
- 根 `package.json` 提供稳定脚本：至少 **`lint`**（`biome check`，具体标志以官方文档为准）、**`lint:fix`**（带写回，具体子命令以官方文档为准）；与现有 **`pnpm turbo run lint`** 对齐，在尚无子包时由 **根包** 执行，保证不因 Turbo 空图或缺脚本失败。
- 使用 **husky** + **lint-staged** 配置 **pre-commit**：仅对 **暂存** 且匹配 glob 的文件运行 Biome；**默认策略为检查不写回**（与第 2 节一致），失败则 **非零退出**、阻止提交。
- 对 `node_modules`、构建产物、锁文件及生成物等做明确 **ignore**，避免误扫（具体路径在实现计划中列清单并与 `biome.json` 一致）。

---

## 2. 非目标

- 不引入 **`packages/biome-config`** 或配置包拆分（与已选「根单一配置」一致）。
- 不引入 **ESLint、Prettier、Stylelint** 等与 Biome 职责重叠的工具链。
- **本 spec 不新增 CI 工作流**；若后续仓库加入 CI，应复用同一条根 **`pnpm lint`**（或 `pnpm turbo run lint`），避免规则漂移。
- 不在此阶段编写根目录「业务 README」；本文件为设计依据。编辑器插件（如 VS Code Biome 扩展）为可选，不作为成功标准。

---

## 3. 成功标准

实现完成后须满足：

1. **`pnpm install`** 成功；`@biomejs/biome`、`husky`、`lint-staged` 写入根 `devDependencies` 并由 `pnpm-lock.yaml` 锁定；**`prepare`（或 husky 官方当前推荐等价方式）** 使克隆者在安装依赖后能获得可用的 **pre-commit**（若官方流程要求额外一次性命令，须在实现计划中写明）。
2. 根执行 **`pnpm lint`** **退出码为 0**；**`pnpm turbo run lint`** 与之一致且 **退出码为 0**（无子包时由根包执行，不得因配置错误失败）。
3. **`pnpm lint:fix`** 执行后，再次 **`pnpm lint`** 仍为 0（在仅有当前仓库规模与样例文件的前提下验证即可）。
4. **pre-commit**：暂存含 **故意违规** 的受检文件时提交 **失败**；暂存 **无** 匹配文件时 **不** 无故阻断提交（lint-staged 常规 no-op）。
5. 全仓仅根 **一份** Biome 配置文件生效；hook 与 `pnpm lint` **共用**该配置。

---

## 4. 架构与数据流

- **配置层**：根 `biome.json` / `biome.jsonc` 定义 formatter、linter、`files.ignore` 等；实现前用 **Biome 官方文档** 核对字段名与推荐结构（尤其 monorepo 下的 ignore 与 `vcs` 相关选项，若适用）。
- **命令层**：开发者与 CI（未来）通过 **`pnpm lint` / `pnpm lint:fix`** 全量检查与修复；Turborepo 通过 **`turbo run lint`** 调用根或各包脚本（当前阶段以根脚本为准）。
- **门禁层**：`git commit` 触发 **husky** → **lint-staged** → 对暂存文件调用 **`biome check`（不写回）**；具体 CLI 参数（例如是否需要对「无匹配暂存文件」使用官方提供的 **no-errors-on-unmatched** 或当前版本等价项）在实现计划中写死并与官方文档一致。

```text
开发者 / CI                Turbo                 Biome
    |                        |                     |
    pnpm lint / lint:fix ----+--------------------> biome (根配置)
    pnpm turbo run lint -----+---> 根 lint 脚本 --> biome (同上)
    git commit --------------+---> husky -----------> lint-staged --> biome check (暂存子集)
```

---

## 5. 文件与脚本约定（实现阶段落地）

以下文件名可在实现计划中微调，但语义须一致：

| 产物 / 配置 | 职责 |
|-------------|------|
| `biome.json` 或 `biome.jsonc` | 全仓 Biome 唯一配置 |
| 根 `package.json` | `lint`、`lint:fix`、`prepare`（或 husky 要求项）；`lint-staged` 配置字段或指向独立配置文件 |
| `.husky/pre-commit` | 调用 `lint-staged`（或官方推荐封装） |
| `pnpm-lock.yaml` | 锁定工具版本 |

**lint-staged 匹配范围**须与「TS / JS / JSON」目标一致；实现计划中列出确切 glob（例如 `*.{ts,tsx,js,jsx,mjs,cjs,json}` 等，以仓库实际使用的扩展名为准）。

---

## 6. Pre-commit 行为（已定稿）

- **默认**：仅 **`biome check`，不写回**；开发者本地使用 **`pnpm lint:fix`** 修复后再提交。
- **不写回的理由**：避免提交过程中静默修改工作区却未再次 `git add`，造成「以为已提交的内容与实际不一致」。

---

## 7. 错误处理

- Biome 以 **CLI 默认退出码** 表示失败；本 spec 不自定义映射。
- Hook 失败即 **阻止提交**；修复路径为 `pnpm lint` / `pnpm lint:fix`。

---

## 8. 与既有文档的关系

- `docs/superpowers/specs/2026-04-10-turborepo-monorepo-design.md` 曾将 ESLint 列为该阶段的非目标；**本 spec 专门引入 Biome**，与之不冲突。
- 若未来子包增多，可在 **不拆分配置包** 的前提下，仅在根 `biome.json` 中使用 **overrides** 等为目录分层（属后续增强，非本 spec 必做项）。

---

## 9. 实现前强制核对（文档）

实现者须在写代码前查阅 **Biome 官方文档**（若可用，辅以 Context7 等）确认：

- `biome check` 与写回命令的**准确子命令与标志**；
- 与 **lint-staged** 联用时，对「无匹配暂存文件」或未知扩展名的推荐参数；
- **ignore** 与 `.gitignore` / monorepo 目录的最佳实践。

本对话过程中 Context7 曾不可用；**不得以本 spec 替代官方文档**。

---

## 10. 验证清单（实现者自检）

- `pnpm lint`、`pnpm lint:fix`、`pnpm turbo run lint`。
- 暂存违规文件 → `git commit` 失败；修复并暂存后 → 成功。
- 无匹配暂存文件时 → 提交不被 lint-staged 无故拦截。
