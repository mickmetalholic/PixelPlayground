---
description: Fetches origin, rebases onto main, drafts structured PR content, and creates the PR via gh.
globs: *
alwaysApply: false
---

I have completed the tasks on this branch. Please perform the following steps sequentially:

1. **Rebase**: Execute `git fetch origin` and `git rebase origin/main` in the terminal. (If there are merge conflicts, please pause the terminal execution and wait for me to manually resolve them and run `git rebase --continue`).
2. **Analyze Changes**: Once the rebase is successfully completed, run `git log origin/main..HEAD` in the terminal to retrieve the latest commits of the current branch relative to the main branch.
3. **Generate PR Content**: Based on the code differences and commit history, draft a Pull Request title and description in **English**.
4. **Format Requirements**: The PR description must be formatted in Markdown and strictly include the following sections:
   - **Context & Objective**: Why this change is being made and what problem it solves.
   - **Core Changes**: What was implemented and which core logic/files were modified.
   - **Testing & Notes**: Suggestions for the Code Reviewer, testing steps, or any edge cases to keep in mind.
5. **Create PR via GitHub CLI**:
   - If the current branch is not pushed yet, run `git push -u origin HEAD`.
   - Then create the PR directly with `gh pr create` using the drafted title and body.
   - Pass the PR body via a HEREDOC to preserve Markdown formatting, for example:
     `gh pr create --title "<title>" --body "$(cat <<'EOF'`
     `<markdown body>`
     `EOF`
     `)"`
   - If `gh pr create` fails (for example, auth or permission issues), provide the exact error and then print the drafted title/body in chat as a fallback.

Please prioritize creating the PR directly via `gh` and return the PR URL in this chat. Only fallback to printing the title and description when PR creation cannot be completed.
