# Guard/Kiosk Implementation Plan

> Based on review of `SPEC_GUARD_KIOSK.md` and current codebase state.

## Current State

### ✅ What Exists
- Basic `/guard` routes with `GuardKioskLayout`
- Stub pages: `GateKiosk`, `PlateSearchPage` under `src/features/gate/`
- `RoleGate` component with role checks
- High-contrast theme support (`setKind('high-contrast')`)
- Dependencies installed: `@zxing/library`, `zod`, `react-hook-form`, `@tanstack/react-query`, `zustand`
- Router structure ready for lazy loading

### ❌ What's Missing
- Proper folder structure (need `features/guard/` and `features/kiosk/` per spec)
- All spec pages (8 guard + 5 kiosk pages)
- API layer (`*.api.ts` files)
- Shared types (`access.types.ts`, `common.types.ts`)
- Hooks (`useKeyboardWedge`, `useAccessEvents`, `useOfflineQueue`)
- Offline queue (Dexie package not installed, no DB schema)
- Kiosk layout separate from guard layout
- Camera component with ZXing
- Wake lock support
- Socket.io (Phase 2)

---

## Implementation Phases

### Phase 1: Foundation & Structure (PR-1)

**1.1 Install Missing Dependencies**
```bash
pnpm add dexie @zxing/browser
pnpm add -D @types/dexie
# Optional for Phase 2:
# pnpm add socket.io-client
```

**1.2 Folder Restructure**
- Move `src/features/gate/` → `src/features/guard/` (rename/refactor)
- Create `src/features/kiosk/` structure
- Create `src/features/shared/` for shared utilities

**1.3 Create Base Types**
- `src/features/shared/types/access.types.ts` (AccessEvent, PersonRef, VisitorPass, ParcelReceipt, IncidentReport)
- `src/features/shared/types/common.types.ts` (common types)

**1.4 Create Offline DB**
- `src/features/shared/offline/db.ts` (Dexie schema for OutboxItem)

**1.5 Create Shared HTTP Client** ✅ DONE
- `src/features/shared/api/http.ts` (axios instance with auth/tenant interceptors)
- Install axios: `pnpm add axios`
- Singleton `httpClient` with:
  - Auth token interceptor (from auth store or localStorage)
  - Tenant ID header from `currentSite`
  - 401 auto-logout handling
  - Convenience methods: `http.get/post/put/patch/delete<T>()`

**1.6 Separate Layouts**
- Keep `GuardKioskLayout.tsx` for guard (enhance with drawer/sidebar per spec)
- Create `KioskLayout.tsx` in `features/kiosk/` with wake lock, fullscreen, theme

**1.7 Kiosk Theme**
- `src/features/kiosk/theme/kioskTheme.ts` (dark mode, large typography, high contrast)

---

### Phase 2: Guard Module - Core Features (PR-2)

**2.1 Create API Layer**
- `src/features/guard/api/access.api.ts` (listAccessEvents, checkAccess)
- `src/features/guard/api/visitors.api.ts` (CRUD for visitors)
- `src/features/guard/api/parcels.api.ts` (receive, deliver, notify)
- `src/features/guard/api/incidents.api.ts` (create, list)

**2.2 Create Hooks**
- `src/features/guard/hooks/useKeyboardWedge.ts` (scanner input handler)
- `src/features/guard/hooks/useAccessEvents.ts` (TanStack Query with polling)
- `src/features/guard/hooks/useOfflineQueue.ts` (Dexie queue management)

**2.3 Create UI Store**
- `src/features/guard/store/guard.ui.store.ts` (Zustand for UI state)

**2.4 Create Components**
- `src/features/guard/components/AccessResultCard.tsx` (display access check result)
- `src/features/guard/components/LiveFeed.tsx` (event feed component)

**2.5 Implement Access Page**
- `src/features/guard/pages/Access.tsx`
  - Universal input (keyboard/scanner)
  - `useKeyboardWedge` integration
  - `checkAccess` mutation with offline fallback
  - `AccessResultCard` display
  - `LiveFeed` of recent events

**2.6 Update Guard Layout**
- Add drawer/sidebar navigation
- TopBar with site name, clock, network status
- Shift change button

**2.7 Implement Dashboard**
- `src/features/guard/pages/Dashboard.tsx`
  - KPIs (entries today, rejections, active visitors, pending parcels)
  - Live feed (polling every 3-5s)
  - Quick action buttons

---

### Phase 3: Guard Module - Extended Pages (PR-3)

**3.1 Visitors Pages**
- `src/features/guard/pages/Visitors.tsx` (list with search/filters)
- `src/features/guard/pages/NewVisitor.tsx`
  - Zod schema validation
  - QR code generation (use existing `qrcode` package)
  - Print option stub

**3.2 Parcels Page**
- `src/features/guard/pages/Parcels.tsx`
  - Receive flow (messenger, timestamp, photo)
  - Notify resident mutation
  - Deliver flow (signature/photo, `deliveredAt`)

**3.3 Incidents Page**
- `src/features/guard/pages/Incidents.tsx`
  - Create form (type, description, attachments)
  - Table with filters (type/date)

**3.4 Shift Page**
- `src/features/guard/pages/Shift.tsx`
  - Configurable checklist
  - Digital signature or PIN
  - Shift summary

**3.5 Log Page**
- `src/features/guard/pages/Log.tsx`
  - Table with filters (date/person/medium/result)
  - Export CSV (optional)

---

### Phase 4: Kiosk Module (PR-4)

**4.1 Create Kiosk Components**
- `src/features/kiosk/components/KioskCamera.tsx`
  - ZXing `BrowserMultiFormatReader`
  - Video element with autoplay
  - `onDetect` callback

**4.2 Create Kiosk Pages**
- `src/features/kiosk/pages/Welcome.tsx`
  - Buttons: "Tengo QR", "No tengo QR", "Entrega de paquete"
  - Language selector (accessibility)
  
- `src/features/kiosk/pages/Scan.tsx`
  - `KioskCamera` component
  - `useKeyboardWedge` for HID scanner fallback
  - Auto-navigate to Confirm on code detection

- `src/features/kiosk/pages/Lookup.tsx`
  - On-screen keyboard for name/host search
  - Debounced suggestions

- `src/features/kiosk/pages/Confirm.tsx`
  - Summary display (destination/visit info)
  - Terms acceptance
  - "Continuar" button → validation → navigate to Done

- `src/features/kiosk/pages/Done.tsx`
  - Visual/sound confirmation
  - Auto-redirect to Welcome after 5s

**4.3 Update Kiosk Layout**
- Fullscreen mode
- Wake lock on mount
- Block context menu
- Optional: disable pinch zoom

**4.4 Router Updates**
- Add `/kiosk` routes with `RoleGate` allowing `['KIOSK','GUARD','ADMIN']`
- Lazy load all kiosk pages

---

### Phase 5: Offline Queue Integration (PR-5)

**5.1 Complete Offline Queue Hook**
- Ensure `useOfflineQueue` handles:
  - `enqueue` with idempotency key
  - `replay` on network recovery
  - Retry logic with max tries

**5.2 Integrate in Access Page**
- Check `navigator.onLine` before API call
- Fallback to `enqueue` when offline
- Toast notification for offline queue
- Auto-replay on `online` event

**5.3 Test Offline Scenarios**
- Disconnect network
- Queue multiple requests
- Reconnect and verify replay

---

### Phase 6: Polish & Accessibility (PR-6)

**6.1 A11y Improvements**
- Focus visible styles (verify MUI defaults)
- Keyboard navigation (Enter confirm, Esc clear)
- Screen reader labels
- Touch target sizes ≥ 44×44px (kiosk)

**6.2 Error Handling**
- ErrorBoundary for guard/kiosk routes
- Graceful degradation for camera permission denied
- Network error UI states

**6.3 Loading States**
- Skeleton loaders for feeds
- Pending states for mutations
- Busy overlay component

**6.4 i18n**
- Extract all strings to locale files
- Add keys for guard/kiosk modules

---

### Phase 7: Testing (PR-7)

**7.1 Unit Tests**
- `useKeyboardWedge` logic
- `useOfflineQueue` replay logic
- Zod schema validation

**7.2 Component Tests**
- `AccessResultCard` rendering
- `KioskCamera` mock ZXing

**7.3 E2E Tests** (Cypress/Playwright)
- RBAC: `/guard/*` blocks non-guard users
- Access flow: scan → result → feed update
- Offline: disconnect → enqueue → reconnect → replay
- Kiosk: Scan → Confirm → Done → redirect

---

## File Structure Target

```
src/
  app/
    router/
      guard.router.tsx          # Update with all guard pages
      app.router.tsx            # Keep as-is
      admin.router.tsx          # Keep as-is
    layout/
      GuardKioskLayout.tsx      # Enhance (add drawer/nav)
      # Remove if KioskLayout is separate
  features/
    guard/
      GuardLayout.tsx           # If separate from GuardKioskLayout
      pages/
        Dashboard.tsx
        Access.tsx
        Visitors.tsx
        NewVisitor.tsx
        Parcels.tsx
        Incidents.tsx
        Shift.tsx
        Log.tsx
      components/
        AccessResultCard.tsx
        LiveFeed.tsx
      api/
        access.api.ts
        visitors.api.ts
        parcels.api.ts
        incidents.api.ts
      hooks/
        useKeyboardWedge.ts
        useAccessEvents.ts
        useOfflineQueue.ts
      store/
        guard.ui.store.ts
    kiosk/
      KioskLayout.tsx
      pages/
        Welcome.tsx
        Scan.tsx
        Lookup.tsx
        Confirm.tsx
        Done.tsx
      components/
        KioskCamera.tsx
      theme/
        kioskTheme.ts
    shared/
      components/
        RoleGate.tsx            # Move from app/auth if needed
        BusyOverlay.tsx
        ErrorBoundary.tsx
      api/
        http.ts
      types/
        access.types.ts
        common.types.ts
      utils/
        time.ts
        idempotency.ts
      offline/
        db.ts
  mocks/
    access-events.json
    visitors.json
    parcels.json
    incidents.json
```

---

## Decisions Needed

1. **Folder naming**: Keep `gate/` or rename to `guard/` per spec? → Recommend: rename to `guard/`
2. **Layout separation**: Keep single `GuardKioskLayout` or split `GuardLayout` + `KioskLayout`? → Recommend: split for clarity
3. **Kiosk role**: Do we have a `KIOSK` role in auth, or reuse `GUARD`? → Check auth.store
4. **Camera permissions**: How to handle denied camera access in kiosk? → Show fallback to keyboard input
5. **Wake lock**: Browser support varies; fallback behavior? → Graceful degradation (log warning, continue)
6. **Socket.io**: Start with polling (Phase 1) or prepare socket hooks? → Start with polling per spec

---

## Migration Steps

1. **Create feature branches** from `main` for each PR
2. **Update router** to include new routes incrementally
3. **Test each page** in isolation before integration
4. **Update i18n** as pages are added
5. **Deprecate old `gate/`** after migration complete

---

## Next Steps

1. Review this plan and get approval on structure/decisions
2. Start with **Phase 1** (foundation)
3. Iterate through phases sequentially
4. Update spec doc if deviations needed

