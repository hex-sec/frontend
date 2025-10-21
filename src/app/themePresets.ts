import { createTheme, alpha } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'
import type { BrandThemeConfig } from './theme.types'

// Purpose: provide accessible, opinionated themes for the app.
// Each theme defines palette, shape and component overrides for AppBar (TopNav),
// Breadcrumbs and Buttons so the header and breadcrumbs remain readable in all modes.

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0b5fff' }, // slightly richer blue
    secondary: { main: '#6a1b9a' },
    // use the same white for canvas and surfaces to keep colors consistent across panels
    background: { default: '#ffffff', paper: '#ffffff' },
    text: { primary: '#0f1724', secondary: 'rgba(15,23,36,0.6)' },
    divider: 'rgba(15,23,36,0.08)',
  },
  shape: { borderRadius: 8 },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: 'none',
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.getContrastText(theme.palette.background.paper), 0.02)} 25%, transparent 25%, transparent 50%, ${alpha(theme.palette.getContrastText(theme.palette.background.paper), 0.02)} 50%, ${alpha(theme.palette.getContrastText(theme.palette.background.paper), 0.02)} 75%, transparent 75%, transparent)`,
          backgroundSize: '28px 28px',
        }),
      },
    },
    MuiBreadcrumbs: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.secondary,
          fontSize: '0.875rem',
        }),
        separator: ({ theme }) => ({
          marginLeft: 6,
          marginRight: 6,
          // use contrast-aware separator so it's readable on both light and dark backgrounds
          color: alpha(theme.palette.getContrastText(theme.palette.background.default), 0.6),
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: ({ theme }) => ({
          color: theme.palette.getContrastText(theme.palette.primary.main),
        }),
      },
    },
  },
})

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    secondary: { main: '#ce93d8' },
    background: { default: '#061225', paper: '#061225' },
    text: { primary: '#e6f0fb', secondary: 'rgba(230,240,251,0.7)' },
    divider: 'rgba(230,240,251,0.06)',
  },
  shape: { borderRadius: 8 },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: 'none',
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.getContrastText(theme.palette.background.paper), 0.02)} 25%, transparent 25%, transparent 50%, ${alpha(theme.palette.getContrastText(theme.palette.background.paper), 0.02)} 50%, ${alpha(theme.palette.getContrastText(theme.palette.background.paper), 0.02)} 75%, transparent 75%, transparent)`,
          backgroundSize: '28px 28px',
        }),
      },
    },
    MuiBreadcrumbs: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.secondary,
          fontSize: '0.875rem',
        }),
        separator: ({ theme }) => ({
          marginLeft: 6,
          marginRight: 6,
          // use contrast-aware separator so it's readable on both light and dark backgrounds
          color: alpha(theme.palette.getContrastText(theme.palette.background.default), 0.6),
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: () => ({
          textTransform: 'none',
        }),
        containedPrimary: ({ theme }) => ({
          color: theme.palette.getContrastText(theme.palette.primary.main),
        }),
      },
    },
  },
})

export const highContrastTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#ffffff' },
    secondary: { main: '#000000' },
    background: { default: '#000000', paper: '#000000' },
    text: { primary: '#ffffff', secondary: '#ffffff' },
    divider: '#ffffff',
  },
  shape: { borderRadius: 4 },
  typography: { fontSize: 16, fontWeightBold: 800 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderWidth: 2, borderStyle: 'solid' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          // use the surface color (paper) for app bars in high-contrast so headers match other panels
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: 'none',
          borderBottom: `2px solid ${theme.palette.divider}`,
          backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.getContrastText(theme.palette.background.paper), 0.04)} 25%, transparent 25%, transparent 50%, ${alpha(theme.palette.getContrastText(theme.palette.background.paper), 0.04)} 50%, ${alpha(theme.palette.getContrastText(theme.palette.background.paper), 0.04)} 75%, transparent 75%, transparent)`,
          backgroundSize: '24px 24px',
        }),
      },
    },
    MuiBreadcrumbs: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.primary,
          fontSize: '1rem',
        }),
        separator: ({ theme }) => ({
          marginLeft: 8,
          marginRight: 8,
          color: theme.palette.divider,
        }),
      },
    },
  },
})

export function makeBrandTheme(cfg: BrandThemeConfig) {
  const mode = cfg.contrastMode === 'high' ? 'dark' : 'light'
  const base = createTheme({
    palette: {
      mode,
      primary: { main: cfg.primary },
      secondary: { main: cfg.secondary },
      info: { main: cfg.info ?? '#0288d1' },
      success: { main: cfg.success ?? '#2e7d32' },
      warning: { main: cfg.warning ?? '#f9a825' },
      error: { main: cfg.error ?? '#d32f2f' },
      // debug is non-standard in MUI palette but we can keep it on brandConfig for UI previews
      // align light-brand canvas to pure white so brand panels read the same as app panels
      background:
        mode === 'dark'
          ? { default: '#081226', paper: '#071428' }
          : { default: '#ffffff', paper: '#ffffff' },
    },
    shape: { borderRadius: cfg.borderRadius ?? 8 },
    typography: { fontFamily: cfg.fontFamily ?? 'Roboto, Inter, system-ui, Arial' },
  })

  return createTheme(base, {
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: (params: { theme: Theme }) => ({
            // prefer the brand's secondary color for the topbar so saved 'secondary' shows immediately
            backgroundColor:
              cfg.contrastMode === 'high' ? params.theme.palette.background.paper : cfg.secondary,
            color:
              cfg.contrastMode === 'high'
                ? params.theme.palette.text.primary
                : params.theme.palette.getContrastText(cfg.secondary),
            boxShadow: 'none',
            borderBottom: `1px solid ${params.theme.palette.divider}`,
          }),
        },
      },
      MuiBreadcrumbs: {
        styleOverrides: {
          root: (params: { theme: Theme }) => ({
            color: params.theme.palette.text.secondary,
          }),
        },
      },
    },
  })
}
