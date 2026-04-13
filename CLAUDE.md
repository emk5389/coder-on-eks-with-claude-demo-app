# Doc-Chat Demo App

Single-PDF chat demo — React 19 / Vite frontend, FastAPI backend, Postgres, Bedrock Claude.

## Package Structure

```
packages/
├── api/        # FastAPI backend (port 8000)
├── website/    # React 19 / Vite frontend (port 3000)
└── cdk/        # AWS CDK dev resources (S3 bucket, IAM role)
```

## Running the App

**Always use `make up` / `make down` from the monorepo root.** This runs
docker-compose with postgres + api + web wired together. Never start the
frontend or API individually — the Vite dev server proxies `/api` to the
API container via Docker networking, and the API needs Postgres.

```
make install   # Install all deps (uv + npm)
make up        # Build and start all services (docker-compose)
make down      # Stop all services
```

Services after `make up`:
- Web:      http://localhost:3000
- API:      http://localhost:8000 (healthz: /healthz)
- Postgres: localhost:5432

## Validation

```
make pr-check   # format + test + cdk synth
make test       # pytest + vitest + jest
```

Always run `make pr-check` before pushing. If you have a frontend change,
also run `make up` and verify with playwright.

## Environment

- **Python:** Always use `uv` (`uv run pytest`, `uv sync`). Never bare `pip` or `python`.
- **AWS creds:** In Coder workspaces, credentials come from the IRSA role
  chain mounted at `~/.aws`. `make up` injects them into containers.
  `DOCUMENTS_BUCKET` is set by the workspace template.
- **Do not hardcode** bucket names or account IDs — they come from env vars
  or CloudFormation outputs.

## Coder Workspace

Inside a Coder workspace, use the `preview-urls` skill to get public
preview URLs for the web app. Include the web preview URL in PR
descriptions.

## Style

Keep code self-documenting with minimal comments. Avoid adding features,
abstractions, or error handling beyond what was asked.

## PR Media

Never commit images to the repo. Use the `pr-screenshot` skill to upload
to S3 and embed in PR descriptions.
