# Developer Guidelines

This document collects practical conventions for developers working on this repository. It complements the enterprise and site policies with actionable examples and checks.

## Summary of Important Conventions
- Routing: Use `buildEntityUrl` from `src/app/utils/contextPaths.ts` for building links across admin/site contexts.
- i18n: Use `t('key.path')` from `src/i18n/i18n.ts` and keep translation keys in `src/i18n/locales/*`.
- State: Use Zustand stores defined under `src/store/*` (e.g., `@store/i18n.store`, `@store/site.store`).
- Formatting: Follow existing ESLint and Prettier configs. Always run `yarn lint` and `yarn format` before opening a PR.

## i18n & UI
- Use translation keys instead of hard-coded strings in UI components.
- When rendering date/number/currency values, prefer using helper functions that accept `locale`/`currency` and fall back to `getCurrentLanguage()` or store-provided values.
- Avoid translating programmatic or identifier strings. Wrap only human-facing text in `t(...)`.

## Translation Automation (summary)
- The repo contains `scripts/translate_locales.py` which uses the OpenAI API to generate translations.
- Never commit your OpenAI key. Use CI secrets or a secure vault to run automated translation jobs.
- Machine translations must be run with `--dry-run` or uploaded to a draft branch and must include a translation-reviewer approval step before merging to main.

## CI & Pre-merge Checklist
Before opening a PR:
- Run `yarn lint` and fix issues.
- Run `yarn typecheck`.
- Run unit tests: `yarn test` (if available).

On PR merge:
- CI must ensure lint/typecheck/tests pass and must block merging when they fail.
- i18n changes should be labeled and require at least one reviewer fluent in the target language.

## Building Links
- When building links to entity pages, use `buildEntityUrl(entity, id, { siteSlug, mode })` so behavior is consistent across contexts.
- Use `useSiteStore()` to access `mode` and `current.slug` to decide whether to render admin or site-scoped navigation.

## Quick Troubleshooting
- If pages are showing incorrect language or not updating on language change, ensure components read from `useI18nStore((s) => s.language)` or call `t(key, { lng: language })` where appropriate.
- If routes load admin pages when coming from site nav, check that links were constructed via `buildEntityUrl` and that `mode` is propagated correctly.

End of developer guidelines.
