import { createTheme } from '@mui/material/styles'
import type { BrandThemeConfig } from './theme.types'

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#9c27b0' },
    background: { default: '#fafafa', paper: '#fff' },
  },
  shape: { borderRadius: 8 },
})

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    secondary: { main: '#ce93d8' },
    background: { default: '#0b0b0b', paper: '#141414' },
  },
  shape: { borderRadius: 8 },
})

export const highContrastTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#ffffff' },
    secondary: { main: '#000000' },
    background: { default: '#000000', paper: '#000000' },
    text: { primary: '#ffffff', secondary: '#ffffff' },
  },
  shape: { borderRadius: 4 },
  typography: { fontSize: 16, fontWeightBold: 800 },
  components: {
    MuiButton: { styleOverrides: { root: { borderWidth: 2, borderStyle: 'solid' } } },
  },
})

export function makeBrandTheme(cfg: BrandThemeConfig) {
  return createTheme({
    palette: {
      mode: cfg.contrastMode === 'high' ? 'dark' : 'light',
      primary: { main: cfg.primary },
      secondary: { main: cfg.secondary },
    },
    shape: { borderRadius: cfg.borderRadius ?? 8 },
    typography: { fontFamily: cfg.fontFamily ?? 'Roboto, Inter, system-ui, Arial' },
  })
}
