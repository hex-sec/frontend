# Enterprise Policy

This document defines enterprise-level policies and conventions which apply to organizations that manage multiple sites (portfolios) and grant their site-level projects (or tenants) inherited behavior. These policies are global and should be enforced by the organization (e.g., CI, deployment pipelines, and security gates). When a repository is used in an enterprise setting, site-level projects must adhere to the following policies and may add additional site-specific rules as long as they do not violate enterprise policies.

## Goals
- Ensure consistent routing and context handling for admin vs site-level pages.
- Require strict CI gating to prevent regressions (lint, types, tests).
- Protect secrets and centrally manage API keys (OpenAI, third-party translation tools).
- Define translation automation behaviour and review flows for machine-generated translations.

## Routing & Context
- All code that builds links to entities (users, vehicles, visitors, reports, etc) MUST use the centralized helper `buildEntityUrl(entity, id?, opts?)` in `src/app/utils/contextPaths.ts`.
- Hard-coded routes like `/admin/users/...` or `/site/<slug>/...` are forbidden in shared components. Site-level components may provide relative links which the layout will scope.
- Components must respect run-time mode from `useSiteStore()`:
  - `mode: 'admin' | 'site'` determines whether links are admin-scoped or site-scoped.
  - `current.slug` must be used when building site-scoped URLs.

Enforcement:
- Add a lint rule (ESLint custom rule or regex-based check) in CI to fail PRs that contain string literals matching `"/admin/` or `/site/` in UI components outside of tests and fixtures.
- Create a small codemod to detect and replace common patterns with `buildEntityUrl` usage.

## CI Gates
- On every PR and push to protected branches, run these checks:
  - `yarn lint` and `yarn lint:fix` (fail if autofix cannot resolve errors)
  - `yarn typecheck` (TypeScript --noEmit)
  - Unit tests (if present) and snapshot tests
  - Security scan for dependencies and secrets
- Merge is only allowed if all checks pass.

## Secrets & Keys
- Enterprise secrets (OpenAI API keys, Sentry DSNs, etc.) MUST NOT live in repository files or committed `.env` files.
- Use a central secret manager (HashiCorp Vault, AWS Secrets Manager, Azure KeyVault) or GitHub Actions secrets with restricted access.
- For scheduled/automated translation jobs, store the OpenAI key in the CI/automation environment and limit its scope.

## Translation Automation
- Machine translations are allowed for initial drafts only (see i18n policy). Enterprise must enforce approval and human review before shipping locale changes to production.

## Compliance & Auditing
- Keep an audit log of automated translation runs: who executed the job, when, and what files were updated.
- Periodically run a link-audit across the site and admin routes to ensure paths respect the enterprise scoping model.

## Exceptions
- Any exception to these rules must be requested through the org's change control board and documented in the PR description and approval thread.

---

End of enterprise policy.
