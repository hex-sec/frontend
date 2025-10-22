Routing policy — enforce buildEntityUrl usage

Goal

- Prevent hard-coded `/admin` and `/site` route literals in source files.
- Use the centralized `buildEntityUrl(entity, id?, opts?)` helper located at `src/app/utils/contextPaths.ts` to construct URLs so application routing respects mode and current site context.

Why

- Centralized URL building ensures links respect site vs enterprise modes and avoid context bugs when navigating between enterprise and site scoped pages.
- Makes future refactors (route shape changes, prefix changes) easier and safer.

Rule

- Do not use literal strings that start with `/admin/` or `/site/` in code, except inside the `src/app/utils/contextPaths.ts` helper or in tooling/transforms/docs files.
- Allowed: `buildEntityUrl('users')`, `buildEntityUrl('visits', visitId, { mode: 'site', currentSlug })`.
- Disallowed: `to="/admin/users"`, `navigate(`/site/${slug}/visits`)`, `const base = '/admin'`.

How to migrate

1. Detection

- Run the repository checker:

```powershell
# run from repo root
yarn check:routes
```

This script scans for literal occurrences and exits non-zero if any are found.

2. Automated replacement (best-effort)

- A jscodeshift codemod scaffold exists at `transforms/replace-admin-site-routes.js` for simple, literal cases.

Dry-run to preview changes:

```powershell
# preview only, no files changed
npx jscodeshift -t transforms/replace-admin-site-routes.js src --parser=ts --dry
```

Apply the codemod to a branch (manual review required):

```powershell
# run and create a branch for review
git checkout -b codemod/replace-admin-site-routes
npx jscodeshift -t transforms/replace-admin-site-routes.js src --parser=ts
# review changes, run tests and typecheck
yarn typecheck
# commit and open PR
git add -A && git commit -m "chore: replace simple admin/site route literals with buildEntityUrl()"
```

3. Manual fixes

- The codemod is conservative. It won't correctly replace template literal usage with complex expressions, concatenations, or JSX prop cases requiring surrounding context (for example, conditional segments or query parameter suffixes). Search results should be reviewed and hand-edited where necessary.

CI enforcement

- Add a CI job that runs the route checker on every PR. Example GitHub Actions job:

```yaml
name: CI
on: [pull_request]
jobs:
  lint-routes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 18
      - name: Install
        run: yarn --frozen-lockfile
      - name: Check for hard-coded admin/site routes
        run: yarn check:routes
```

Developer guidance & examples

- Good:
  - const url = buildEntityUrl('users')
  - navigate(buildEntityUrl('visits', visitId, { mode: 'site', currentSlug }))

- Bad:
  - navigate(`/admin/users`)
  - const base = `/site/${slug}`

Notes

- The helper `src/app/utils/contextPaths.ts` intentionally contains some explicit `/admin` and `/site` strings; it's the canonical source and therefore excluded from the checker.
- If you believe a literal is required (rare), add a short comment above the line and update the checker ignore-list (PR required).

Contact

- For questions, tag the routing ownership team or open a short PR referencing this policy.
