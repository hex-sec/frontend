# Locale Translation Workflow

A repeatable workflow for generating machine translations for every supported UI language from the English source file.

## Supported languages

The workspace now exposes the following language codes:

| Code | Language |
| --- | --- |
| en | English |
| es | Spanish |
| fr | French |
| de | German |
| it | Italian |
| ru | Russian |
| zh | Chinese (Simplified) |
| ja | Japanese |

The English catalog (`src/i18n/locales/en.json`) is the source of truth. The workflow mirrors that file into each target locale by invoking the OpenAI API with the `gpt-4o-mini` model (overridable via `OPENAI_TRANSLATION_MODEL`).

## Prerequisites

- Python 3.9 or newer
- `OPENAI_API_KEY` defined in your environment or `.env` at the repo root
- Python deps installed: `pip install -r scripts/requirements-i18n.txt`
- Node.js deps installed for the project: `yarn install`

## Running the workflow

1. Commit or stash any local edits to avoid losing manual translation work.
2. Ensure `src/i18n/locales/en.json` contains the latest keys.
3. Execute the generator:
   ```bash
   yarn i18n:translate
   ```
   This populates `es`, `fr`, `de`, `it`, `ru`, `zh`, and `ja` from the English catalog. Existing non-empty locale files are left untouched unless you opt in to overwrite them.
4. (Optional) Translate a subset of locales:
   ```bash
   yarn i18n:translate -- fr de it
   ```
5. (Optional) Regenerate and overwrite an existing locale:
   ```bash
   yarn i18n:translate -- fr --force
   ```

## Output

- Updated locale files live under `src/i18n/locales/*.json`.
- The language picker uses the `languages` dictionary inside each locale and the supported codes declared in `src/i18n/i18n.ts`.

## Validation

- Start the dev server (`yarn dev`) and toggle the language selector inside the Accessibility settings group.
- Spot check critical screens (navigation, dashboard, settings) for placeholder `{{ token }}` integrity and layout regressions.
- Review machine translations with a native speaker before shipping.

## Notes

- The script preserves `{{variable}}` placeholders and other ICU-style tokens.
- Machine output is intended as a starting point. Always proofread and adjust domain-specific terminology.
- Set `OPENAI_TRANSLATION_MODEL` to target a different model, and adjust retry/backoff logic inside `scripts/translate_locales.py` if needed.
