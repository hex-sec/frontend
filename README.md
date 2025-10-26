# HEX Front — Administración multi-tenant

Aplicación web construida con **React + TypeScript + MUI** sobre **Vite** para administrar complejos residenciales y corporativos bajo un modelo **multi-tenant**. El panel principal permite a los equipos de HEX operar Sites, usuarios, visitas y configuraciones personalizadas tanto para modo web como kiosco.

## ✨ Características principales

- **Panel Admin completo**: páginas para Sites, usuarios, vehículos, visitas y reportes con navegación contextual por slug.
- **Gestión de Settings unificada**: `SettingsService` persiste preferencias de usuario en `localStorage` y mantiene un snapshot JSON para simular un backend. Las opciones del modal se almacenan como un árbol nested (`account`, `notifications`, `appearance`, etc.).
- **Preferencias de aterrizaje**: los usuarios eligen desde el modal de settings a qué vista llegar (dashboard, overview, site específico) y el flujo de login respeta la selección.
- **Temas y presets**: soporte para presets guardados, selección automática por densidad y modo de color, y sincronización con Zustand (`theme.store.ts`).
- **Internacionalización**: `src/i18n` integra i18next con traducciones en español/inglés/portugués, helpers (`useTranslate`) y workflows para sincronizar locales.
- **Mock data**: `src/mocks/*.json` provee datos para residencias, visitas, usuarios, settings, etc., facilitando el desarrollo offline.

## 🧰 Stack

- React 18 + TypeScript
- Vite 5
- Material UI 6
- React Router 6
- TanStack Query 5
- Zustand
- React Hook Form + Zod
- date-fns / dayjs

## 🚀 Comenzar

```bash
yarn install
yarn dev --host   # expone Vite para pruebas en red local
```

Scripts útiles:

- `yarn lint` / `yarn lint:fix`
- `yarn format`
- `yarn typecheck`
- `yarn build`
- `yarn preview`
- `yarn check:routes` — valida rutas registradas

## 🗂️ Estructura relevante

```
src/
  app/                # layout, router, theme, auth
  components/         # piezas reutilizables (tablas, botones, etc.)
  features/           # páginas y lógica por dominio (admin, guard, resident)
  hooks/              # hooks compartidos (p. ej. useUserSettings)
  i18n/               # configuración y utilidades de traducción
  mocks/              # fixtures JSON para desarrollo
  services/           # capas de servicios (SettingsService)
  store/              # stores Zustand para auth, sites, ui, theme
```

### Settings y preferencias

- `src/services/settings.service.ts` persiste los ajustes por usuario.
- Los valores del modal se traducen entre representación plana/nested (`flattenModalSettings` / `expandModalSettings`).
- `useUserSettings` expone `load / save / clear` y aplica theme inmediatamente tras guardar.
- En `SiteDetailsPage` y `TopBar` se aprovechan landing preferences, densidad y tema guardados.

### Internacionalización

- Traducciones en `src/i18n/locales/*`.
- `useTranslate` wrappea i18next y permite sobrescribir `lng` por contexto.
- Workflow de traducción documentado en `docs/workflows/locale-translation.md`.

### Datos y mocks

- Todos los endpoints simulados están bajo `src/mocks`.
- `SettingsService` inicializa desde `src/mocks/user-settings.json` y guarda los cambios en `localStorage` (`mock.settings.file`).
- React Query maneja caching e hidratación en `features/**/sites.api.ts` y equivalentes.

## 🧭 Navegación y roles

- Layouts diferenciados (`AppLayout`, `AdminLayout`, `GuardKioskLayout`).
- `RoleGate` protege las rutas según rol.
- `useSiteStore` mantiene `mode` (`enterprise`/`site`) y el `current` site para simular multi-tenant.

## 📚 Documentación adicional

- `docs/STYLE_CONTRACT.md` — convenciones de código y organización.
- `docs/MASTER_PROMPT_HEX_FRONT_v2.md` — guía operativa resumida.
- `docs/policies/*` — lineamientos internos, enterprise policy, routing, i18n.

Mantén estos archivos sincronizados con cualquier cambio en arquitectura, dependencias o workflows.
