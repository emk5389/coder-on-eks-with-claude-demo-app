# coder-on-eks-with-claude-demo-app

The doc-chat demo application — single-PDF chat backed by Bedrock Claude. This is what you clone *into* a Coder workspace and run via `make up`.

## What's in here

- **`packages/api`** — FastAPI + pydantic-ai backend. Talks to Postgres (chat history + document metadata), S3 (PDF storage), and Bedrock (Claude Sonnet via the Converse API). Production-shaped multi-stage Dockerfile.
- **`packages/website`** — React 19 + Vite frontend. Document list on the left, chat panel on the right. Uploads PDFs, sends messages, renders responses.
- **`packages/cdk`** — TypeScript CDK that provisions the dev resources: documents bucket, pr-assets bucket, KMS key, and the access role that the workspace IRSA role assumes. *No prod stacks* — see the comment block in `bin/app.ts` for how you'd extend it to gamma/prod.
- **`docker-compose.yml`** — three services (postgres, api, web) wired together for the local sim.
- **`.claude/`** — the cannibalized `commit-push-pr` slash command and the `pr-screenshot` / `preview-urls` skills.

## Prerequisites

You should already have deployed the infra stack and have the workspace IRSA role ARN handy. Then, **inside a Coder workspace** spun up from that infra:

1. Clone this repo into the workspace.
2. Make sure `aws sts get-caller-identity` returns *your* AWS account (not "coder" or an empty error). If it fails, your `WORKSPACE_ACCESS_ROLE_ARN` workspace template parameter is unset — see Task 5 of the infra walkthrough.
3. Install deps:
   ```bash
   make install
   ```

## Deploying the dev resources (one-time)

```bash
cd packages/cdk
npx cdk bootstrap   # if you haven't bootstrapped this account before
WORKSPACE_IRSA_ROLE_ARN=arn:aws:iam::<account>:role/workspace-irsa-role \
  npx cdk deploy DocChatDevResources
```

After deploy, capture the outputs:

```bash
DOCUMENTS_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name DocChatDevResources \
  --query 'Stacks[0].Outputs[?OutputKey==`DocumentsBucketName`].OutputValue' \
  --output text)
ACCESS_ROLE_ARN=$(aws cloudformation describe-stacks \
  --stack-name DocChatDevResources \
  --query 'Stacks[0].Outputs[?OutputKey==`AccessRoleArn`].OutputValue' \
  --output text)
export DOCUMENTS_BUCKET
echo "Access role: $ACCESS_ROLE_ARN"
```

Now go back to the infra walkthrough Task 5: re-push the workspace template with `--variable workspace_access_role_arn=$ACCESS_ROLE_ARN`, and restart your workspace so the bind-mounted `~/.aws` chain points at the new role.

## Running locally

From the monorepo root:

```bash
make up
```

This auto-fetches `DOCUMENTS_BUCKET` from CloudFormation, injects AWS credentials from your SSO session, builds the images, and starts postgres + api + web. Output:

```
API:  http://localhost:8000  (healthz: http://localhost:8000/healthz)
Web:  http://localhost:3000
```

Inside a Coder workspace, run `claude` and ask Claude to call the `preview-urls` skill to get the public preview URLs. (Or read them off the workspace dashboard.)

To stop:

```bash
make down
```

## Tests

```bash
make test
```

Runs:
- `packages/api` — pytest (unit tests for db, s3, agent helpers, route shapes via TestClient with stubbed db/s3, plus a happy-path integration test that's skipped unless `BEDROCK_MODEL_ID`, `DATABASE_URL`, and `DOCUMENTS_BUCKET` are all set)
- `packages/website` — Vitest with React Testing Library (smoke test that the App renders empty states)
- `packages/cdk` — Jest snapshot tests via `aws-cdk-lib/assertions` Template

`make pr-check` runs the same plus formatting and a CDK synth.

## Architecture notes

**The api container's bind-mounted `~/.aws` is the seam** where the workspace's role chain reaches the application code. The api Dockerfile creates a non-root user `api` with home `/home/api`, and `docker-compose.yml` mounts `~/.aws` to `/home/api/.aws:ro`. Locally, `make up` also injects temporary SSO credentials as env vars. In Coder, the IRSA role chain config in `~/.aws/config` handles it. Either way, the api thinks it's just `boto3.client('s3')`.

**No RAG, no embeddings, no chunking.** Documents go to S3 as-is, and on every chat turn the api fetches the full PDF from S3 and sends it to Bedrock as `BinaryContent`. Bedrock Claude natively accepts PDFs. This is fine for demo-sized documents and intentionally not how you'd build something with thousands of pages.

**No auth.** Anyone with the workspace URL is "the user". Coder's GitHub OAuth restricts who can reach the workspace in the first place (`CODER_OAUTH2_GITHUB_ALLOWED_ORGS`); inside the workspace, the demo app doesn't add another layer.

**No prod CDK.** `bin/app.ts` has a commented sketch of how you'd add gamma/prod stacks (ECS Fargate, RDS, CloudFront). The intent is "here's the local sim story, here's the same Dockerfile you'd ship to ECR" — the demo deliberately stops short of building the production deploy pipeline.

## License

MIT — see [LICENSE](./LICENSE).
