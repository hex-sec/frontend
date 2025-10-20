# Fix: @store/site.store not found

This package provides the missing file and reminds you to set up TS/Vite aliases.

## 1) Copy this file into your repo
- src/store/site.store.ts

## 2) Ensure path aliases are configured

### tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@store/*": ["src/store/*"],
      "@app/*": ["src/app/*"],
      "@features/*": ["src/features/*"]
    }
  }
}

### vite.config.ts
import path from 'path'

resolve: {
  alias: {
    '@store': path.resolve(__dirname, 'src/store'),
    '@app': path.resolve(__dirname, 'src/app'),
    '@features': path.resolve(__dirname, 'src/features')
  }
}

### VS Code (Windows)
After editing tsconfig, run:
- Ctrl+Shift+P → “TypeScript: Restart TS server”
- Restart `yarn dev` if necessary