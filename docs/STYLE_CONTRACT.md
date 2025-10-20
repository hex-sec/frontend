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
  - ✅ `if ( user ) {` / `function handle ( data ) {`
  - ❌ `if(user){`
- Usa ESLint `space-in-parens: ["error", "always"]`.
- Prettier controla formato global (comillas, ancho, punto y coma, etc.).

## Patrones

- Rutas por rol: admin, guard (kiosko), resident.
- `RoleGate` para autorización por rol.
- `SiteSelector` si el usuario pertenece a múltiples Sites (multi-tenant).
- `QRBadge`, `QRScanner`, `ConfirmDialog`, `DataTable` como componentes reutilizables.

## Documentación

Cada PR debe **actualizar documentación** relevante: README, docs de API, scripts, instrucciones, ejemplos.
