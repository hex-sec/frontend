# i18n & Translation Automation Policy

This policy covers how translations are generated, reviewed, stored, and deployed. It complements the enterprise policy and provides a clear workflow for safe, auditable machine translation and human review.

## Scope

- Applies to all JSON locale files under `src/i18n/locales/*.json` and any UI text changes that affect localization.

## Responsibilities

- Translation automation may be executed by repository maintainers or an approved automation account.
- A human reviewer fluent in the target language must validate machine-generated translations before they are merged to `main`.

## Translation Tooling

- The repository ships `scripts/translate_locales.py` (Python + OpenAI) for generating translations.
- Recommended steps for a translation run (CI or local):
  1. Ensure a secure API key is available in the environment — do NOT put keys in repo files.
     - For CI: set the key in repository/organization secrets (e.g., GitHub Actions secrets).
     - For scheduled jobs: use an automation account with limited scope and rotate keys periodically.
  2. Install dependencies: `pip install -r scripts/requirements-i18n.txt`.
  3. Dry-run first: `python ./scripts/translate_locales.py --dry-run` (or `yarn i18n:translate -- --dry-run`).
  4. Review diffs in a draft branch and assign a reviewer who is fluent in the language.
  5. After approval, merge to `main`.

## Files & Commit Rules

- Machine-generated translations must be committed under `src/i18n/locales/<lang>.json`.
- Each translation commit must include a changelog entry noting: source language, target language, translation model and version, date, and runner identity.
- The commit message should reference the translation job run ID and include the `--force` flag if overwriting existing translations.

## OpenAI Usage & Secrets

- Do not share or commit OpenAI API keys. Use CI secrets or a secrets manager.
- Limit who can trigger translation jobs; use role-based controls.
- Keep a small automated log of each run (timestamp, model, input locale keys count, target locales). Store logs in a secure location (artifact store, private S3) for 90 days.

## Quality & Review

- Machine translations are considered Drafts. A translation reviewer must:
  - Review UI context and keys in the draft branch.
  - Run the app locally with the translations applied and smoke-check major flows.
  - Approve the PR once satisfied.

## Reverting & Fixes

- If a translation causes regressions or unacceptable copy, revert the commit and open a follow-up PR with corrected translations.
- Maintain a list of exempted keys that should never be machine-translated (identifiers, branded phrases, legal text). Add these keys to `src/i18n/translation_exemptions.json` (maintainers-only).

## CI Integration Example

- Provide a sample GitHub Actions job snippet (CI should inject secrets from GitHub Secrets):

```yaml
name: i18n-translate
on:
  workflow_dispatch:
jobs:
  translate:
    runs-on: ubuntu-latest
    permissions: write-all
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install deps
        run: pip install -r scripts/requirements-i18n.txt
      - name: Run translator (dry-run)
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: |
          python ./scripts/translate_locales.py --dry-run
      - name: Create Draft PR
        if: success()
        run: |
          # create a draft PR with the generated translations (implementation detail)
```

## Privacy

- Translations may expose source strings to the translation provider. Ensure that no PII or secret data is included in text passed to external APIs.
- If the source text can contain PII (e.g., user-supplied content), those keys must be excluded from machine translation and handled with a private translation workflow.

End of i18n & translation policy.
