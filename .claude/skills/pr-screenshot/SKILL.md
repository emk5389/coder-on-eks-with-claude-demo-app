---
name: pr-screenshot
description: >
  Upload screenshots to the doc-chat pr-assets S3 bucket and attach them to a PR
  description. Use when: (1) user says "attach screenshot to PR", "upload screenshot",
  or "add image to PR", (2) after taking Playwright screenshots that should be
  documented in a PR, (3) user wants to include visual evidence of UI changes.
  Requires AWS CLI (authenticated via the workspace IRSA chain) and gh CLI.
---

# PR Screenshot Upload

Upload screenshot files to the doc-chat pr-assets S3 bucket, generate presigned URLs, and embed them in the PR description. Screenshots are always the **last section** of the PR body.

## How it works

GitHub proxies all markdown images through `camo.githubusercontent.com`. When a presigned URL is embedded in a PR, camo fetches and caches the image. Once cached, the image continues to render even after the presigned URL expires. Use a 7-day expiry (`604800` seconds) to give camo plenty of time to cache.

## Workflow

### 1. Identify screenshot file(s)

Locate the screenshot(s) to upload. Check in order:
- Path provided by the user
- Recently taken Playwright screenshots (check repo root and `/tmp/`)
- Any recently created `.png` or `.jpg` files in the working directory

If no screenshots are found, tell the user and offer to take one via the Playwright MCP (`browser_take_screenshot`).

### 2. Get the PR number and repo

```bash
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
PR_NUMBER=$(gh pr view --json number -q .number)
```

If no PR exists for the current branch, tell the user to create one first.

### 3. Determine the S3 bucket

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
BUCKET="doc-chat-pr-assets-${ACCOUNT_ID}"
```

If `aws sts` fails, the workspace's role chain isn't set up. Tell the user to check that `WORKSPACE_ACCESS_ROLE_ARN` is populated in the workspace template parameters and that they re-started the workspace after setting it.

### 4. Upload to S3 and generate presigned URL

```bash
FILENAME=$(basename "$FILEPATH")
S3_PATH="s3://${BUCKET}/pr-assets/${PR_NUMBER}/${FILENAME}"
aws s3 cp "$FILEPATH" "$S3_PATH" --content-type image/png
PRESIGNED_URL=$(aws s3 presign "$S3_PATH" --expires-in 604800)
```

Adjust `--content-type` to `image/jpeg` for `.jpg`/`.jpeg` files.

### 5. Append screenshots as the last section of the PR body

Read the existing body, strip any existing `## Screenshots` section, then append screenshots at the end. Use the GitHub REST API directly (`gh pr edit` has issues with classic projects).

```bash
EXISTING_BODY=$(gh api "repos/$REPO/pulls/$PR_NUMBER" --jq '.body')

CLEANED_BODY=$(echo "$EXISTING_BODY" | python3 -c "
import sys, re
body = sys.stdin.read()
body = re.sub(r'\n## Screenshots\n.*?(?=\n## |\Z)', '', body, flags=re.DOTALL)
print(body.rstrip())
")

UPDATED_BODY="${CLEANED_BODY}

## Screenshots

![${ALT_TEXT}](${PRESIGNED_URL})"

gh api "repos/$REPO/pulls/$PR_NUMBER" -X PATCH -f body="$UPDATED_BODY" --jq '.html_url'
```

For multiple screenshots, combine all images under the single `## Screenshots` heading:

```markdown
## Screenshots

![First screenshot description](url1)

![Second screenshot description](url2)
```

Use descriptive alt text (e.g., "Empty document list", "Chat panel after upload").

### 6. Report back

Tell the user:
- Which file(s) were uploaded
- That the PR description has been updated with the screenshot(s) as the last section
