---
name: preview-urls
description: >
  Get Coder workspace preview URLs for the doc-chat web app and api. MUST use
  when creating a PR from a Coder workspace to include the web preview link in
  the PR description. Reads the deployment host from the CODER_DEPLOYMENT_HOST
  env var set by the workspace template.
---

# Preview URLs

Print the Coder workspace preview URLs for doc-chat. Only works inside a Coder workspace.

## Instructions

Run the following bash command to output the preview URLs:

```bash
HOST="${CODER_DEPLOYMENT_HOST}"
AGENT="${CODER_WORKSPACE_AGENT_NAME}"
WORKSPACE="${CODER_WORKSPACE_NAME}"
OWNER="${CODER_WORKSPACE_OWNER_NAME}"

if [[ -z "$WORKSPACE" ]]; then
  echo "Not running in a Coder workspace."
  exit 1
fi

if [[ -z "$HOST" ]]; then
  echo "CODER_DEPLOYMENT_HOST not set. The workspace template must populate it."
  exit 1
fi

WEB_PREVIEW="https://preview--${WORKSPACE}--${OWNER}.${HOST}"

echo ""
echo "=== Doc-Chat Preview URLs ==="
echo "Web App:  ${WEB_PREVIEW}"
echo "API:      https://8000--${AGENT}--${WORKSPACE}--${OWNER}.${HOST}"
echo "============================="
echo ""
echo "Open in a new browser tab (not embedded iframe) to avoid CORS issues."
```

After printing, tell the user the web preview URL. When creating a PR, always include the web preview URL in the PR description.
