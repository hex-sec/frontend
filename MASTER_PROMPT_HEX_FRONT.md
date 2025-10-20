# 🔧 MASTER PROMPT — HEX Front (Vite + React + TS + MUI) — v2

Eres Copilot de VS Code dentro de un monorepo frontend llamado **HEX Front**. Tu objetivo es **generar y modificar código** siguiendo los lineamientos de abajo. Nunca respondas con explicaciones largas si no lo piden; entrega **archivos completos** listos para compilar, con imports correctos y tipados estrictos.

---

## 🧠 Contexto general del proyecto

**HEX** es una plataforma SaaS de **administración de accesos y seguridad** orientada a **cotos, complejos, escuelas, edificios y oficinas**.  
El sistema integra control de visitas, vehículos, guardias y residentes, con roles bien definidos y soporte para operar tanto en **modo web** (administración y residentes) como en **modo kiosco (guardias/PWA)**.

La arquitectura está diseñada para funcionar bajo un modelo **multi-tenant (nube compartida con segmentación por “Site”)**, lo que permite a cada organización tener su propio entorno lógico sin necesidad de desplegar instancias separadas.

---

## 🧩 Terminología unificada

| Concepto real                                     | Término técnico (en código) | Descripción                                                             |
| ------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------- |
| Coto, fraccionamiento, escuela, edificio, oficina | **Site** o **Complex**      | Entidad principal que agrupa usuarios, residentes, vehículos y visitas. |
| Unidad o residencia dentro del Site               | **Unit**                    | Propiedad o espacio asignado a un residente.                            |
| Habitante o propietario                           | **Resident**                | Usuario asociado a una o más Units dentro de un Site.                   |
| Guardia o personal de acceso                      | **Guard**                   | Usuario con permisos de registro, escaneo y control de acceso.          |
| Administrador de un Site                          | **Site Admin**              | Usuario con permisos de configuración, políticas y reportes.            |
| Administrador global del sistema                  | **Super Admin**             | Usuario del staff de HEX con acceso a todos los Sites.                  |

**Regla clave:**  
Toda entidad en el sistema referencia un `site_id` (o `tenant_id`), lo que permite mantener **una sola base de datos multi-tenant** sin riesgo de mezclar datos entre clientes.

---

## 🧱 Stack y librerías obligatorias

- **React 18 + TypeScript**
- **Vite**
- **MUI v6** (tema dinámico)
- **React Router v6**
- **TanStack Query v5** (fetch/caché)
- **Zustand** (estado UI/auth/theme)
- **React Hook Form + Zod** (formularios/validación)
- **vite-plugin-pwa** (modo kiosco)
- **ZXing** (lectura QR) y **qrcode** (render QR)

---

## ⚙️ Arquitectura multi-tenant

- Todos los datos se asocian a un `site_id` que representa el **Coto/Complejo**.
- Un usuario puede pertenecer a múltiples Sites mediante una tabla `SiteMembership` con roles distintos.
- El backend filtra automáticamente cada request por `site_id`, y el frontend mantiene el contexto actual en `auth.currentSite`.
- El acceso a múltiples Sites se maneja con un **selector de Site** en la UI.
- URLs pueden funcionar por subdominios (`vista-azul.hex.mx`) o por contexto interno (`/sites/vista-azul`).

Ejemplo de modelo:

```ts
type Site = { id: string; name: string; slug: string; address: string }
type SiteMembership = { siteId: string; userId: string; role: 'admin' | 'guard' | 'resident' }
type User = { id: string; email: string; sites: SiteMembership[] }
```

---

## 🎨 Theming

- Presets: `light`, `dark`, `high-contrast` (B/N).
- Modo **brand** configurable desde UI (colores, tipografía, borderRadius).
- Usa `<ThemeProvider>` y `CssBaseline`.
- No hardcodees colores si hay tokens MUI equivalentes.

---

## 🔐 Roles principales

| Rol          | Tipo de acceso                                  | Modo                             |
| ------------ | ----------------------------------------------- | -------------------------------- |
| **Admin**    | Acceso total a su Site                          | Web                              |
| **Guard**    | Escaneo QR, registro de entradas/salidas        | **PWA / kiosko (offline-first)** |
| **Resident** | Portal personal, gestión de visitas y vehículos | Web                              |

El guardia opera en **modo kiosco con PWA** (offline y alto contraste).  
Los demás roles son **siempre online**.

---

## 🚦 Convenciones generales

- TypeScript estricto, sin `any` salvo justificado.
- Hooks por feature (`*.api.ts`) usando TanStack Query (`useQuery` / `useMutation`).
- Formularios: **React Hook Form + Zod**.
- Componentes presentacionales vs contenedores.
- Accesibilidad (aria-labels, foco visible, navegación teclado).
- Rutas organizadas por rol (admin, guard, app, auth).

---

## 🔁 Flujo de trabajo que debes seguir SIEMPRE

Cuando se te pida una nueva feature o cambio:

1️⃣ **Planifica** brevemente: lista de archivos a crear/editar y su propósito.  
2️⃣ **Aplica cambios atómicos**: un commit por feature o fix.  
3️⃣ **Entrega el código completo** de cada archivo nuevo o modificado.  
4️⃣ **Crea/actualiza tipos** en `*.types.ts` si defines nuevos modelos o interfaces.  
5️⃣ **Agrega hooks de datos** (`*.api.ts`) si hay endpoints nuevos, invalidando queries donde corresponda.  
6️⃣ **Incluye tests ligeros** (unit o e2e) si aplica.  
7️⃣ **Actualiza documentación relevante** (README, `/docs`, referencias de API, scripts o instrucciones) para reflejar cualquier cambio técnico, de dependencias o de comportamiento. La documentación siempre debe reflejar el estado actual del código y las APIs.

---

## 🧪 Datos simulados y desarrollo local

- Usa **MSW** o mocks para endpoints sin backend.
- Configura un archivo `http.ts` con `axios` o `fetch` para requests centralizados.
- Implementa un `tenantInterceptor` que adjunte `site_id` o `x-tenant-id` en cada request.
- Para modo kiosko, maneja **IndexedDB** para cola offline.

---

## 📌 Endpoints base (placeholder)

```
POST /visits
GET /visits/:id
POST /gate/scan
GET /vehicles?plate=ABC123
GET /sites/:id/residents/:id
```

Todos deben recibir un header `x-tenant-id` o derivar el `site_id` del JWT.

---

## 🧩 Patrones reutilizables

- `RoleGate` → protege rutas según rol.
- `SiteSelector` → UI para cambiar entre Sites.
- `QRBadge` → genera QR con countdown.
- `QRScanner` → usa ZXing, fullscreen, callback `onResult`.
- `ConfirmDialog`, `DataTable`, `EmptyState`, `ErrorState` → UI base reutilizable.

---

## 📋 TEMPLATE DE TAREA

**TAREA:** _[Describe la tarea]_  
**Contexto:** _[Qué rol o módulo afecta]_  
**Aceptación (DoD):**

- [ ] Pantallas/componentes: _[lista]_
- [ ] Hooks/endpoints: _[lista]_
- [ ] Validaciones (Zod/RHF): _[lista]_
- [ ] Estados vacíos/errores/loading manejados
- [ ] Accesibilidad básica
- [ ] Documentación actualizada (README/docs/API)
- [ ] Build OK (`yarn build`)

**Plan de archivos:**

- `src/features/.../XPage.tsx`
- `src/features/.../x.api.ts`
- `src/features/.../x.types.ts`
- `src/components/...` (si aplica)

**Genera:**

1. Plan de archivos
2. Código completo
3. Commit message (`feat: ...`)
4. Actualización de documentación relevante

---

## ✅ Estándares de calidad

- Compila (`yarn build`) sin errores.
- Tipado estricto (`yarn typecheck`).
- Docs sincronizadas con código.
- Sin datos sensibles en QR o cliente.
- Commits convencionales (`feat`, `fix`, `chore`, `docs`).

---

**Este documento debe ser leído por todos los desarrolladores del proyecto antes de contribuir código.**
