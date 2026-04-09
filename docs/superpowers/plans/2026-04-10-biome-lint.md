# Biome Lint + Husky Pre-commit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `@biomejs/biome` at the repository root with a single `biome.json`, wire `pnpm lint` / `pnpm lint:fix` and Turborepo, and enforce pre-commit checks on staged TS/JS/JSON via `husky` + `lint-staged` (check-only, no `--write`).

**Architecture:** Keep one Biome config file at the repo root and rely on `vcs.useIgnoreFile: true` so `.gitignore` drives bulk ignores (including `.worktrees/`, `node_modules/`, `.turbo/`, `dist/`). Use a Turborepo **root task** `//#lint:root` (script key `lint:root`) so `pnpm turbo run //#lint:root` actually executes Biome even when zero workspace packages define a `lint` script. Combine with `turbo run lint` in the root `pnpm lint` script so future `apps/*` and `packages/*` tasks run together. Pre-commit stays a thin `lint-staged` call matching the official Biome recipe ([Git Hooks | Biome](https://biomejs.dev/recipes/git-hooks/)).

**Tech Stack:** pnpm 9.x workspace root, Turborepo 2.x, `@biomejs/biome` 2.4.x, `husky` 9.x, `lint-staged` 15.x.

**Working copy:** Prefer the isolated worktree at `.worktrees/feature/biome-lint` (branch `feature/biome-lint`). All paths below are relative to the repository root.

---

## Planned File Structure

- Create: `biome.json`
- Modify: `package.json` (scripts, `devDependencies`, `lint-staged`)
- Modify: `turbo.json` (register `//#lint:root`)
- Create: `.husky/pre-commit` (tracked; runs `pnpm exec lint-staged`)
- Create or allow Husky bootstrap to create: `.husky/_/` (tracked per Husky 9 defaults after `husky init`)
- Modify: `pnpm-lock.yaml` (generated)
- Modify: `docs/superpowers/specs/2026-04-10-biome-lint-design.md` (clarify success criterion #2 vs Turborepo empty package graph)
- Optionally modify: `types/workspace-stub.ts` (only if `pnpm lint` reports formatting drift against the generated Biome defaults)

---

### Task 1: Baseline checks (before changes)

**Files:**

- Read-only: `package.json`, `turbo.json`, `docs/superpowers/specs/2026-04-10-biome-lint-design.md`

- [ ] **Step 1: Prove Biome is not installed yet**

Run (repository root):

```bash
pnpm exec biome --version
```

Expected: FAIL (`ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL` or “Command \"biome\" not found”).

- [ ] **Step 2: Prove plain `turbo run lint` does not execute any package tasks today**

Run:

```bash
pnpm install
pnpm exec turbo run lint --dry-run
```

Expected: output contains `Running lint in 0 packages` and exit code `0`.

This documents why the plan uses `//#lint:root` instead of relying on `turbo run lint` alone while the workspace graph has no child `lint` scripts.

---

### Task 2: Install Biome, Husky, and lint-staged

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Add devDependencies at the workspace root**

Run:

```bash
pnpm add -D -w @biomejs/biome@2.4.11 husky@9.1.7 lint-staged@15.4.3
```

Expected: `pnpm install` completes; `package.json` lists the three packages under `devDependencies`; `pnpm-lock.yaml` updates.

- [ ] **Step 2: Verify binaries resolve**

Run:

```bash
pnpm exec biome --version
```

Expected: prints `Version: 2.4.11` (or a 2.4.11-prefixed line).

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "build(lint): add biome, husky, and lint-staged"
```

---

### Task 3: Add `biome.json` (Biome 2.4.11 defaults)

**Files:**

- Create: `biome.json`

- [ ] **Step 1: Create the config file**

Create `biome.json` with exactly:

```json
{
	"$schema": "https://biomejs.dev/schemas/2.4.11/schema.json",
	"vcs": {
		"enabled": true,
		"clientKind": "git",
		"useIgnoreFile": true
	},
	"files": {
		"ignoreUnknown": false
	},
	"formatter": {
		"enabled": true,
		"indentStyle": "tab"
	},
	"linter": {
		"enabled": true,
		"rules": {
			"recommended": true
		}
	},
	"javascript": {
		"formatter": {
			"quoteStyle": "double"
		}
	},
	"assist": {
		"enabled": true,
		"actions": {
			"source": {
				"organizeImports": "on"
			}
		}
	}
}
```

Rationale: this matches `pnpm exec biome init` output for Biome **2.4.11**, including `vcs.useIgnoreFile: true` so `.gitignore` exclusions apply without duplicating ignore lists.

- [ ] **Step 2: Run check (expect either clean or a small formatting delta on existing stub)**

Run:

```bash
pnpm exec biome check .
```

Expected: exit code `0`, **or** Biome reports only formatter/import-assist diffs on `types/workspace-stub.ts`.

- [ ] **Step 3: If (and only if) Step 2 reported issues, apply safe fixes**

Run:

```bash
pnpm exec biome check --write .
pnpm exec biome check .
```

Expected: exit code `0` with `Checked N files` and no diagnostics.

- [ ] **Step 4: Commit**

```bash
git add biome.json types/workspace-stub.ts
git commit -m "chore(lint): add biome project config"
```

(If `types/workspace-stub.ts` did not change, omit it from `git add`.)

---

### Task 4: Wire Turborepo root lint task + npm scripts

**Files:**

- Modify: `package.json`
- Modify: `turbo.json`

- [ ] **Step 1: Extend `turbo.json` with a root task**

Ensure `turbo.json` contains this additional task key alongside the existing `build`, `dev`, `lint`, and `test` entries:

```json
{
	"$schema": "https://turbo.build/schema.json",
	"tasks": {
		"build": {
			"dependsOn": ["^build"],
			"outputs": ["dist/**"]
		},
		"dev": {
			"cache": false,
			"persistent": true
		},
		"lint": {
			"outputs": []
		},
		"//#lint:root": {
			"outputs": []
		},
		"test": {
			"outputs": []
		}
	}
}
```

- [ ] **Step 2: Update root `package.json` scripts**

Replace the `scripts` block so it contains at least:

```json
{
	"scripts": {
		"build": "turbo run build",
		"dev": "turbo run dev",
		"lint": "turbo run lint //#lint:root",
		"lint:root": "biome check .",
		"lint:fix": "biome check --write .",
		"test": "turbo run test"
	}
}
```

Notes:

- Do **not** add `"prepare": "husky"` yet — `pnpm exec husky init` in Task 5 will insert it. Adding `prepare` before `.husky/` exists can make `pnpm install` noisy or fail on a clean clone.
- `lint:root` is the script Turborepo maps to `//#lint:root`.
- `pnpm lint` always runs workspace `lint` tasks **and** the root Biome task, matching the design intent once child packages appear.

- [ ] **Step 3: Dry-run Turbo to show the root task is scheduled**

Run:

```bash
pnpm exec turbo run //#lint:root --dry-run
```

Expected: output lists `//#lint:root` in “Tasks to Run” (not `0 packages` for that task).

Run:

```bash
pnpm lint
```

Expected: exit code `0`; Biome runs as part of the aggregate command.

- [ ] **Step 4: Commit**

```bash
git add turbo.json package.json
git commit -m "chore(lint): wire turbo root lint task and npm scripts"
```

---

### Task 5: Initialize Husky and configure lint-staged (check-only)

**Files:**

- Modify: `package.json` (`lint-staged`; `prepare` is added by `husky init` in Step 1)
- Create: `.husky/pre-commit`
- Create: `.husky/_/*` (via `husky init`)

- [ ] **Step 1: Initialize Husky**

Run:

```bash
pnpm exec husky init
```

Expected:

- `.husky/pre-commit` exists.
- `package.json` contains `"prepare": "husky"` (Husky inserts this automatically; merge carefully if you already had a `prepare` script for another tool).

- [ ] **Step 2: Replace the default hook body**

Make `.husky/pre-commit` contain **only**:

```sh
pnpm exec lint-staged
```

Remove any default `pnpm test` line Husky inserted.

- [ ] **Step 3: Add `lint-staged` configuration to `package.json`**

Add a top-level `lint-staged` field (sibling of `scripts`, not inside it):

```json
{
	"lint-staged": {
		"*.{js,ts,cjs,mjs,d.cts,d.mts,jsx,tsx,json,jsonc}": "biome check --no-errors-on-unmatched --files-ignore-unknown=true"
	}
}
```

Rationale: mirrors the official Biome + lint-staged example for **check-only** ([Git Hooks | Biome](https://biomejs.dev/recipes/git-hooks/)); `--no-errors-on-unmatched` avoids failures when no staged paths match; `--files-ignore-unknown=true` skips unsupported paths if a glob is too broad.

- [ ] **Step 4: Reinstall to ensure `prepare` ran**

Run:

```bash
pnpm install
```

Expected: finishes without errors; Husky hook path remains valid.

- [ ] **Step 5: Commit hook wiring**

```bash
git add .husky package.json
git commit -m "chore(git): add husky pre-commit with lint-staged"
```

---

### Task 6: Manual verification matrix (functional “tests”)

**Files:**

- None required if everything already passes

- [ ] **Step 1: Full-repo checks**

Run:

```bash
pnpm lint
pnpm exec turbo run //#lint:root
pnpm lint:fix
pnpm lint
```

Expected: all commands exit `0`.

- [ ] **Step 2: Pre-commit rejects bad staged TS**

Run:

```bash
git checkout -b tmp/biome-hook-smoke
printf "const badlyFormatted='x'\n" > types/smoke-biome.ts
git add types/smoke-biome.ts
git commit -m "should fail"
```

Expected: **commit aborts** with non-zero exit; Biome prints diagnostics (quote style / formatting).

Then clean up:

```bash
git reset HEAD~1
git restore --staged types/smoke-biome.ts
rm types/smoke-biome.ts
git checkout -
git branch -D tmp/biome-hook-smoke
```

- [ ] **Step 3: Pre-commit allows commits with no staged Biome files**

Run:

```bash
git checkout -b tmp/biome-hook-smoke-2
echo "docs only" > docs/smoke-md.md
git add docs/smoke-md.md
git commit -m "chore: smoke test markdown-only commit"
```

Expected: commit succeeds (lint-staged does not run Biome on `.md` with the configured globs).

Cleanup:

```bash
git reset --hard HEAD~1
git checkout -
git branch -D tmp/biome-hook-smoke-2
```

---

### Task 7: Align the design spec with Turborepo’s empty `lint` graph

**Files:**

- Modify: `docs/superpowers/specs/2026-04-10-biome-lint-design.md`

- [ ] **Step 1: Patch success criterion #2**

In section `## 3. 成功标准`, replace list item **2** with:

```markdown
2. 根执行 **`pnpm lint`** **退出码为 0**。`pnpm lint` 必须通过 Turborepo 同时调度 **子包 `lint` 任务**（若存在）与根 **`//#lint:root`** 任务（脚本名 `lint:root`，即 `biome check .`）。在「尚无子包定义 `lint`」阶段，单独的 **`pnpm turbo run lint`** 可能仍显示 0 个包任务；此时以 **`pnpm turbo run //#lint:root`**（或与 `pnpm lint` 等价）作为 Turbo 路径下的验收命令。子包补齐 `lint` 后，`pnpm turbo run lint` 将自然包含包级任务，而 `pnpm lint` 仍应通过 `//#lint:root` 覆盖仓库根目录文件。
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/specs/2026-04-10-biome-lint-design.md
git commit -m "docs(specs): clarify turbo lint success criteria for biome"
```

---

## Plan self-review (maintainer checklist)

1. **Spec coverage mapping**

| Spec section | Plan location |
| --- | --- |
| Single root Biome config + TS/JS/JSON | Task 3 (`biome.json` defaults cover JS/TS/JSON; globs add `jsonc` etc.) |
| `pnpm lint` / `pnpm lint:fix` | Task 4 |
| Turbo alignment + root coverage | Task 4 (`//#lint:root`) + Task 7 (spec clarification) |
| Husky + lint-staged, check-only | Task 5 |
| `pnpm install` installs hooks (`prepare`) | Task 5 (`husky init` adds `prepare`) |
| Ignore build artifacts / deps | Task 3 (`vcs.useIgnoreFile`) |
| No CI | Not part of this plan (explicitly out of scope) |

2. **Placeholder scan:** none intentionally left; versions are pinned or explicitly stated.

3. **Consistency:** `lint:root` script pairs with `//#lint:root` Turbo task name; `pnpm lint` always includes `//#lint:root` plus `lint` for future packages.

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-10-biome-lint.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
