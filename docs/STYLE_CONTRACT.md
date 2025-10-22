# STYLE_CONTRACT.md

## Estándares generales

- TypeScript estricto. Evitar `any` (usar generics o tipos precisos).
- React con funciones puras; evitar side-effects en render.
- Formularios: **React Hook Form + Zod**.
- Datos: **TanStack Query**. Estado UI: **Zustand**.
- Accesibilidad mínima: `aria-*`, foco visible, navegación por teclado.
- Manejo explícito de **loading**, **error** y **empty state**.

## Estructura

```
src/
  features/<dominio>/{ *.page.tsx, *.api.ts, *.types.ts }
  app/{ router, layout, auth }
  components/{ reutilizables }
```

## Estilo (formato)

- **Espaciado en paréntesis** obligatorio para legibilidad:
  - ✅ `if ( condition1 ) {` / `function handle ( data ) {` / `func1( param1, param2.field1, true )`
  - ❌ `if(condition1){` / `func1(param1, param2.field1, true)`
- Usa ESLint `space-in-parens: ["error", "always"]`.
- Prettier controla formato global (comillas, ancho, punto y coma, etc.).
- The project requires a space after '(' and before ')' in conditional and call sites for readability. Example: `if ( condition )` and `doThing( arg1, arg2 )`.
- Autofix and formatting commands:
  - `yarn lint --fix` — run ESLint and apply autofixes
  - `yarn format` — run Prettier to ensure consistent formatting

## Patrones

- Rutas por rol: admin, guard (kiosko), resident.
- `RoleGate` para autorización por rol.
- `SiteSelector` si el usuario pertenece a múltiples Sites (multi-tenant).
- `QRBadge`, `QRScanner`, `ConfirmDialog`, `DataTable` como componentes reutilizables.

## Documentación

Cada PR debe **actualizar documentación** relevante: README, docs de API, scripts, instrucciones, ejemplos.
