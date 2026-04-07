---
allowed-tools: Bash(git checkout --branch:*), Bash(git checkout -b:*), Bash(git add:*), Bash(git status:*), Bash(git push:*), Bash(git commit:*), Bash(git diff:*), Bash(git log:*), Bash(gh pr create:*), Bash(make:*), Bash(npm run build:*), Bash(npm run test:*), Bash(uv run pytest:*)
description: Verify, commit, push, and open a PR for the doc-chat demo monorepo
---

## Context

You have the capability to call multiple tools in a single response. You MUST do all of the steps below in order. Do not skip verification. Do not commit with failing tests.

## Step 1: Verify before committing

Run `make pr-check` from the monorepo root. This formats Python, runs all package test suites, and synths the CDK. If any check fails, fix the issue before proceeding. Do not commit with failing tests or lint errors.

For larger changes (multi-package refactors, new endpoints, schema changes), also do a manual smoke test:

```bash
make up
# Open the web preview URL, upload a small PDF, ask a question, verify a response
make down
```

If you can't figure out a failure, stop and report back to the user with what you tried.

## Step 2: Create branch (if needed)

If on `main`, create a new branch following this convention:

```
<type>/<short-description>
```

Types: `feat/`, `fix/`, `refactor/`, `docs/`, `chore/`, `perf/`, `test/`, `build/`, `ci/`

Use **kebab-case** for the description. Examples:
- `feat/add-document-rename`
- `fix/upload-button-busy-state`
- `chore/bump-pydantic-ai`

## Step 3: Commit

Stage changed files individually (never `git add -A` or `git add .`). Do not stage `.env` files, secrets, or media files (images, videos). Media for PRs goes to S3 — see Step 4.

Write a commit message following **Conventional Commits**:

```
<type>(<optional scope>): <description>

[optional body]

Co-Authored-By: Claude <model-id>@anthropic.com
```

- **type**: feat, fix, docs, style, refactor, perf, test, build, ci, chore
- **scope** (optional): `api`, `website`, `cdk`, `compose`, etc.
- **description**: imperative mood, present tense ("add" not "added"), no capital first letter, no trailing period
- **body** (optional): explain the *why*, not the *what*

Use a HEREDOC for the commit message to preserve formatting.

## Step 4: Push and create PR

Push the branch with `-u`, then create a PR.

**Preview URL.** If running in a Coder workspace (`CODER_WORKSPACE_NAME` env var is set), generate the preview URLs and include the web preview in the PR body. Use the `preview-urls` skill — it reads `CODER_DEPLOYMENT_HOST` from the workspace template, so there's no hardcoded host fallback.

**PR title** follows the same Conventional Commits format as the commit summary line.

**PR body** uses this template:

```markdown
## 📋 Pull Request Description

### 🎯 What does this PR do?

[1-3 sentences summarizing the change]

### 🔍 Why is this change needed?

[Explain the problem and your solution. Include context.]

### 🌐 Preview

[Web preview URL from the preview-urls skill, if in a Coder workspace]

## 🧪 Testing

### ✅ What testing has been done?

[Bullet list of what you verified: builds, tests, manual smoke, etc.]
```

Use `gh pr create` with a HEREDOC for the body.

**PR Media (screenshots, videos):** Never commit media. Upload to the pr-assets bucket and embed presigned URLs. Use the `pr-screenshot` skill.

## Execution

You MUST complete all steps in order. Run verification first. Do not skip tests. Do not proceed past a failing step.

## Updating Skill

If the user chastises you while you are running this command for undesirable behavior, propose a change and ask the user if they'd like you to update this command file.
