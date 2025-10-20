# HEX Front — Estilo, Lint y CI

Este paquete contiene la configuración de **Prettier**, **ESLint**, **EditorConfig**, **Husky** y **lint-staged** para asegurar
un **estilo consistente** en el proyecto, incluyendo **espacios dentro de paréntesis** para mejorar la legibilidad.

## 📦 Contenido

- `.prettierrc.json` — formato base (Prettier).
- `.eslintrc.cjs` — reglas con `space-in-parens: "always"` y otras buenas prácticas.
- `.editorconfig` — coherencia entre IDEs.
- `.lintstagedrc.json` — tareas sobre archivos staged.
- `.husky/pre-commit` — hook pre-commit que ejecuta lint/format.

## 🚀 Instalación rápida (Yarn)

```bash
yarn add -D eslint prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser   eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-unused-imports   husky lint-staged

# (si usas git por primera vez)
git init

# habilitar Husky
npx husky init

# copia los archivos de este paquete a la raíz del repo
# luego asegúrate de dar permisos al hook (Unix/Mac):
chmod +x .husky/pre-commit
```

### Scripts recomendados en `package.json`

```jsonc
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
  },
}
```

### (Opcional) GitHub Actions CI

Crea `.github/workflows/ci.yml`:

```yaml
name: CI
on: [pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: yarn
      - run: yarn install --frozen-lockfile
      - run: yarn typecheck
      - run: yarn lint
      - run: yarn build
```

## 🧠 Style contract (resumen)

- TS estricto, sin `any`.
- RHF + Zod para formularios; TanStack Query para datos; Zustand para estado UI.
- **Espaciado dentro de paréntesis obligatorio** (ESLint `space-in-parens: ["error","always"]`).
- Errores/loading visibles y accesibilidad básica.

Para el documento completo, revisa `docs/STYLE_CONTRACT.md` y `docs/MASTER_PROMPT_HEX_FRONT_v2.md`.
