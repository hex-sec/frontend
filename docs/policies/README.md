# Policies

This folder contains organizational policies and development guidelines that apply to this repository.

Files:

- `enterprise-policy.md` — enterprise-level rules for routing, CI, secrets, and translation automation.
- `site-policy.md` — rules for site-level (tenant) projects that inherit enterprise policies.
- `developer-guidelines.md` — practical developer conventions, workflow hints, and pre-PR checklist.
- `i18n-translation-policy.md` — detailed policy for running automated translations using `scripts/translate_locales.py`.

Enforcement:
- Add CI checks to run lint/typecheck/tests and to scan for banned route patterns.
- Add code review and translation review steps for i18n PRs.

If you want, I can add a sample GitHub Actions workflow implementing these gates and a lint rule to detect hard-coded admin/site paths.
