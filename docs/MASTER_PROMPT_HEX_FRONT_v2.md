# 🔧 MASTER PROMPT — HEX Front (Vite + React + TS + MUI) — v2

(versión abreviada) — Usa este documento como guía para Copilot/IA.

## Multi-tenant

- Entidades referencian `site_id`. Usuarios pueden pertenecer a múltiples Sites vía `SiteMembership`.
- Guard = PWA kiosko; Admin/Resident = web online.

## Flujo de trabajo (SIEMPRE)

1. Plan de archivos
2. Cambios atómicos
3. Archivos completos
4. Tipos en `*.types.ts`
5. Hooks `*.api.ts` e invalidaciones
6. Tests ligeros
7. **Actualizar documentación** (README/docs/API/scripts)
