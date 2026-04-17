# Commitlint Configuration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add root commitlint configuration and enforce commit message checks via Husky `commit-msg`, aligned with the project commit convention rule.

**Architecture:** Keep responsibilities isolated: policy in `commitlint.config.cjs`, execution in `.husky/commit-msg`, and dependency wiring in `package.json`. Reuse existing Husky setup and keep `.husky/pre-commit` unchanged.

**Tech Stack:** Node.js, pnpm workspace root, Husky 9, Commitlint CLI + conventional config.

---

### Task 1: Add commitlint tooling and policy file

**Files:**
- Create: `commitlint.config.cjs`
- Modify: `package.json`

- [ ] **Step 1: Install commitlint dependencies**

Run: `pnpm add -D -w @commitlint/cli @commitlint/config-conventional`
Expected: lockfile updated and both packages appear in root `devDependencies`.

- [ ] **Step 2: Verify package metadata before policy wiring**

Run: `pnpm list @commitlint/cli @commitlint/config-conventional --depth 0`
Expected: both packages are listed at workspace root.

- [ ] **Step 3: Create `commitlint.config.cjs` with full rules**

```js
const CJK_REGEX = /[\u4E00-\u9FFF]/u;

const hasCjk = (input = "") => CJK_REGEX.test(input);

const validateNoCjk = (value, partName) => {
  if (!value || !value.trim()) {
    return [true];
  }

  return hasCjk(value)
    ? [false, `${partName} must be English-only (CJK characters are not allowed)`]
    : [true];
};

const noCjkInMessageRule = (parsed) => {
  const checks = [
    validateNoCjk(parsed.subject, "subject"),
    validateNoCjk(parsed.body, "body"),
    validateNoCjk(parsed.footer, "footer"),
  ];

  const failed = checks.find(([valid]) => !valid);
  return failed ?? [true];
};

module.exports = {
  extends: ["@commitlint/config-conventional"],
  ignores: [
    (message = "") => /^Merge branch '.+'$/.test(message),
    (message = "") => /^Merge remote-tracking branch '.+'$/.test(message),
    (message = "") => /^Merge pull request #\d+/.test(message),
    (message = "") => /^Revert ["'].+["']$/.test(message),
  ],
  plugins: [
    {
      rules: {
        "no-cjk-in-message": noCjkInMessageRule,
      },
    },
  ],
  rules: {
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore"],
    ],
    "type-empty": [2, "never"],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "no-cjk-in-message": [2, "always"],
  },
};
```

- [ ] **Step 4: Confirm config is syntactically valid**

Run: `node -e "require('./commitlint.config.cjs'); console.log('commitlint config loaded')"`
Expected: prints `commitlint config loaded`.

- [ ] **Step 5: Commit Task 1**

```bash
git add package.json pnpm-lock.yaml commitlint.config.cjs
git commit -m "build(commitlint): add root commitlint configuration"
```

Expected: one commit created with dependency + config changes.

### Task 2: Wire Husky commit-msg gate and verify behavior

**Files:**
- Create: `.husky/commit-msg`
- Verify unchanged: `.husky/pre-commit`

- [ ] **Step 1: Add Husky `commit-msg` hook**

Create `.husky/commit-msg`:

```sh
pnpm exec commitlint --edit "$1"
```

Also run:
`chmod +x .husky/commit-msg`

Expected: hook exists and executable.

- [ ] **Step 2: Verify valid commit message passes**

Run:
`echo "feat(api): add commit message lint gate" | pnpm exec commitlint`
Expected: exit code `0` and no errors.

- [ ] **Step 3: Verify invalid type is rejected**

Run:
`echo "feature(api): add commit message lint gate" | pnpm exec commitlint`
Expected: non-zero exit and `type-enum` error.

- [ ] **Step 4: Verify CJK message is rejected**

Run:
`echo "feat(api): 增加提交校验" | pnpm exec commitlint`
Expected: non-zero exit and `no-cjk-in-message` error.

- [ ] **Step 5: Verify ignore pattern is accepted**

Run:
`echo "Merge pull request #123 from org/branch" | pnpm exec commitlint`
Expected: exit code `0` because ignore rule applies.

- [ ] **Step 6: Commit Task 2**

```bash
git add .husky/commit-msg
git commit -m "ci(husky): enforce commit message linting on commit-msg"
```

Expected: second commit created with hook wiring only.

### Task 3: End-to-end verification and final tidy check

**Files:**
- Verify: `commitlint.config.cjs`
- Verify: `.husky/commit-msg`
- Verify: `package.json`

- [ ] **Step 1: Run explicit rule checks as a batch**

Run:
`printf "feat: add guard\nfix: handle parser.\nfeat: 增加校验\n" | while IFS= read -r msg; do [ -n "$msg" ] && echo "$msg" | pnpm exec commitlint || true; done`

Expected:
- `feat: add guard` passes
- `fix: handle parser.` fails with `subject-full-stop`
- `feat: 增加校验` fails with `no-cjk-in-message`

- [ ] **Step 2: Inspect repo status**

Run: `git status --short`
Expected: clean working tree after planned commits.

- [ ] **Step 3: Optional squashing policy decision (manual)**

If team prefers one commit, do not change this plan automatically.
Keep both commits unless explicitly requested.

