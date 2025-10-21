# Site Policy

This document describes policies that apply to site-level (tenant) projects which inherit enterprise policies. Site projects may implement site-specific rules provided they do not contradict enterprise policies.

## Inheritance
- Site-level repositories inherit all rules from `docs/policies/enterprise-policy.md` unless explicitly permitted.

## Routing and Context Usage
- When implementing site-specific pages, use the centralized URL helpers (`buildEntityUrl`) when navigating between admin and site flows, unless the navigation is strictly internal and relative.
- Avoid hard-coded admin paths in site-level code.

## Language & Locale
- Site-level projects may choose default language and locale preferences via `useI18nStore().hydrateLanguage(...)` at startup, but must still provide translations for UI strings or use fallback English.
- Do not commit machine-translated locale files without QA review by a native speaker or a translation reviewer.

## Local Secrets
- Local developer `.env` files are allowed for development but MUST be excluded from version control (`.gitignore`); they must not be used in CI or scheduled jobs.

## Deployment
- Site deployments must run the same CI policy gates as enterprise (lint, typecheck, tests). Any additional site-specific pre-deploy checks must be added to the site pipeline.

## Review & QA
- Site owners must designate translation reviewers for each supported language. Translation PRs should be labeled `i18n` and include a reviewer from the language reviewers list.

End of site policy.
