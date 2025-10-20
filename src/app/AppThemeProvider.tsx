import { ThemeProvider, CssBaseline } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useThemeStore } from '@store/theme.store'
import { lightTheme, darkTheme, highContrastTheme, makeBrandTheme } from './themePresets'
import ContextCacheProvider from '@app/context/ContextCache'

// Behavior:
// - If user selects 'system' we follow the browser's prefers-color-scheme media query.
// - We listen for changes so the app updates if the OS theme changes while open.
// - Brand and high-contrast explicitly override system preference.

export default function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const { kind, brandConfig, hydrate } = useThemeStore()
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean | null>(null)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    // Guard for SSR / non-window environments
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => setSystemPrefersDark(!!mq.matches)
    update()
    // Some browsers use addEventListener, some older ones support addListener
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', update)
    } else if (typeof (mq as unknown as MediaQueryList).addListener === 'function') {
      ;(mq as unknown as MediaQueryList).addListener(update)
    }

    return () => {
      if (typeof mq.removeEventListener === 'function') {
        mq.removeEventListener('change', update)
      } else if (typeof (mq as unknown as MediaQueryList).removeListener === 'function') {
        ;(mq as unknown as MediaQueryList).removeListener(update)
      }
    }
  }, [])

  const effectiveKind = useMemo(() => {
    if (kind === 'system') {
      return systemPrefersDark ? 'dark' : 'light'
    }
    return kind
  }, [kind, systemPrefersDark])

  const theme = useMemo(() => {
    if (effectiveKind === 'dark') return darkTheme
    if (effectiveKind === 'high-contrast') return highContrastTheme
    if (effectiveKind === 'brand' && brandConfig) return makeBrandTheme(brandConfig)
    return lightTheme
  }, [effectiveKind, brandConfig])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ContextCacheProvider>{children}</ContextCacheProvider>
    </ThemeProvider>
  )
}
