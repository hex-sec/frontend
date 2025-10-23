
# PROMPT → Rediseño de Tarjetas de Sitios (Híbrido Moderno)

**Contexto del proyecto**
- Stack: React + TypeScript + Vite + MUI + Zustand.
- Lint: ESLint v9 (flat) + Prettier con `space-in-parens: "always"`.
- Ubicación: `src/features/admin/sites/`
- Vista: `/admin/sites`
- Alias: `@features/*`, `@app/*`, `@store/*`

---

## 🎯 Objetivo
Rediseñar las tarjetas de sitios del panel administrativo para que sean **visualmente modernas**, **jerárquicas**, y **claras**.  
El nuevo diseño debe combinar la **base visual** de la opción 3 (hero + métricas) con la **estructura organizada** de la opción 2 (secciones separadas).

El **nombre del sitio** debe ser un **link** hacia `/admin/sites/:slug`, y los botones y métricas deben tener un layout adaptable entre **desktop** y **móvil**.

---

## 🧩 Diseño final esperado

```
╔════════════════════════════════════════════╗
║ 🏠  [Vista Azul] (link)              🟢 Activo
║ plan: basic   |   slug: vista-azul
║────────────────────────────────────────────║
║ 📊 23 usuarios · 4 visitas hoy           (opcional)
║────────────────────────────────────────────║
║ Acciones:
║  [👤 Invitar usuario]  [🔄 Establecer actual]
║────────────────────────────────────────────║
║ 📄 Ver detalles del sitio →
╚════════════════════════════════════════════╝
```

---

## 🧱 Estructura de archivos

```
src/features/admin/sites/
 ├─ components/
 │   ├─ SiteCard.tsx
 │   ├─ types.ts
 │   └─ SiteMetrics.tsx (opcional)
 └─ SitesPage.tsx (usar SiteCard)
```

---

## 💬 Commit sugerido
```
feat(sites): rediseño de tarjetas híbridas modernas con métricas y acciones

- Nuevo componente SiteCard con estado, métricas y acciones
- Integración en SitesPage
- Estilos responsivos y accesibles
- Hover con elevación y sombreado suave
```
