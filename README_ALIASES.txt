# Admin pages fix + path aliases

This package includes missing admin stub pages and alias instructions.

## 1) Copy these files into your project
- src/features/admin/ResidentsPage.tsx
- src/features/admin/VehiclesPage.tsx
- src/features/admin/PoliciesPage.tsx
- src/features/admin/ReportsPage.tsx
- src/features/admin/UsersPage.tsx

## 2) Ensure TS + Vite path aliases are configured

### tsconfig.json
Add (or ensure) the following under `compilerOptions`:
{
  "baseUrl": ".",
  "paths": {
    "@app/*": ["src/app/*"],
    "@features/*": ["src/features/*"],
    "@store/*": ["src/store/*"]
  }
}

### vite.config.ts
Add (or ensure) the following in `resolve.alias`:
import path from 'path'

resolve: {
  alias: {
    '@app': path.resolve(__dirname, 'src/app'),
    '@features': path.resolve(__dirname, 'src/features'),
    '@store': path.resolve(__dirname, 'src/store'),
  }
}

> If you're on Windows, use `path.resolve` as shown; it works cross‑platform.

After copying these files and confirming aliases, run:
yarn dev