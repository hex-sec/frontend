import { ThemeProvider, CssBaseline } from '@mui/material'
import { useEffect, useMemo } from 'react'
import { useThemeStore } from '@store/theme.store'
import { lightTheme, darkTheme, highContrastTheme, makeBrandTheme } from './themePresets'
import ContextCacheProvider from '@app/context/ContextCache'

export default function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const { kind, brandConfig, hydrate } = useThemeStore()
  useEffect(() => {
    hydrate()
  }, [hydrate])

  const theme = useMemo(() => {
    if (kind === 'dark') return darkTheme
    if (kind === 'high-contrast') return highContrastTheme
    if (kind === 'brand' && brandConfig) return makeBrandTheme(brandConfig)
    return lightTheme
  }, [kind, brandConfig])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ContextCacheProvider>{children}</ContextCacheProvider>
    </ThemeProvider>
  )
}
