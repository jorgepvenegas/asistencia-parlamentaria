---
name: ship
description: Commit staged changes and create a PR
disable-model-invocation: true
allowed-tools: Bash(git *), Bash(gh pr create:*)
---

Commit all pending changes and create a PR to main:

1. `git status` + `git diff` to understand changes
2. `git log --oneline -5` for commit message style
3. Stage relevant files (never `.env` or credentials)
4. Commit with concise message
5. Push branch with `-u`
6. `gh pr create` with short summary + test plan
7. Return the PR URL

If `$ARGUMENTS` is provided, use it as the commit message.
