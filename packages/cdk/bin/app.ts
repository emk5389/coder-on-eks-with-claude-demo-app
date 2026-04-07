#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { DevResourcesStack } from '../lib/stacks/dev-resources-stack';

const app = new cdk.App();

const workspaceIrsaRoleArn =
  app.node.tryGetContext('workspaceIrsaRoleArn') ??
  process.env.WORKSPACE_IRSA_ROLE_ARN;

if (!workspaceIrsaRoleArn) {
  throw new Error(
    'workspaceIrsaRoleArn must be provided via cdk.json context or WORKSPACE_IRSA_ROLE_ARN env var. ' +
      'Get it from the coder-and-claude-on-eks-demo-infra stack output (CoderDemoWorkspaceIam).'
  );
}

new DevResourcesStack(app, 'DocChatDevResources', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
  },
  workspaceIrsaRoleArn,
});

// ────────────────────────────────────────────────────────────────────────
// Extending to gamma/prod
// ────────────────────────────────────────────────────────────────────────
// In a real org you'd add additional stages here, each with their own
// stacks for the prod-shaped resources. Sketch:
//
//   new GammaStack(app, 'DocChatGamma', {
//     env: { account: '<gamma-account-id>', region: 'us-east-1' },
//     // ECS Fargate cluster + service running api/Dockerfile
//     // RDS Postgres replacing the docker-compose postgres
//     // CloudFront + S3 hosting the website build output
//     // ALB or App Runner front door, ACM cert, Route53 record
//   });
//
// We don't define those here because the goal of this demo is to show the
// dev / local-sim story, not the production deploy pipeline. The same
// Dockerfile and Postgres schema would carry over unchanged.
// ────────────────────────────────────────────────────────────────────────
