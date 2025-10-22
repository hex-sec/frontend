# Developer Guidelines

This document collects practical conventions for developers working on this repository. It complements the enterprise and site policies with actionable examples and checks.

## Summary of Important Conventions

- Routing: Use `buildEntityUrl` from `src/app/utils/contextPaths.ts` for building links across admin/site contexts.
- i18n: Use `t('key.path')` from `src/i18n/i18n.ts` and keep translation keys in `src/i18n/locales/*`.
- State: Use Zustand stores defined under `src/store/*` (e.g., `@store/i18n.store`, `@store/site.store`).
- Formatting: Follow existing ESLint and Prettier configs. Always run `yarn lint` and `yarn format` before opening a PR.
- Formatting: Follow existing ESLint and Prettier configs. Always run `yarn lint` and `yarn format` before opening a PR.
  - The repository enforces a strict "space inside parentheses" rule. Use spaces after opening and before closing parentheses for conditions and calls. Example: `if ( condition ) {` and `func1( param1, param2.field1, true )`.
  - Quick commands:
    - Run lint and auto-fix: `yarn lint --fix`
    - Run Prettier: `yarn format`
- Documentation: Write a Javadoc-style block comment above every function detailing parameters, return shape, purpose, and control flow.
- UI Components: New UI components must use the translation helpers and register keys in both `src/i18n/locales/en.json` and `src/i18n/locales/es.json`.

## i18n & UI

- Use translation keys instead of hard-coded strings in UI components.
- When rendering date/number/currency values, prefer using helper functions that accept `locale`/`currency` and fall back to `getCurrentLanguage()` or store-provided values.
- Avoid translating programmatic or identifier strings. Wrap only human-facing text in `t(...)`.
- When introducing a new UI component, ensure all user-facing strings are added to both the English (`en.json`) and Spanish (`es.json`) locale files alongside the component changes.

## Function Documentation

- Add a Javadoc-style comment block immediately above each function. Describe each parameter, the returned value or object shape, the function's responsibility, and a brief outline of its internal flow or major steps.

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
