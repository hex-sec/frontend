import { createTheme, Theme, lighten, darken } from '@mui/material/styles'
import type { HexThemePreset, HexThemesFile } from './theme.types'
import themesJson from '../assets/themes.json'

export function loadThemePresets(): HexThemePreset[] {
  const file = themesJson as unknown as HexThemesFile
  return Array.isArray(file.themes) ? file.themes : []
}

export function presetToMuiTheme(preset: HexThemePreset): Theme {
  const { links, ...palette } = preset.palette
  const base = createTheme({ palette: palette as unknown as Theme['palette'] })

  const linkDefault = links?.default ?? base.palette.primary.main
  const linkVisited =
    links?.visited ??
    (base.palette.mode === 'dark' ? lighten(linkDefault, 0.25) : darken(linkDefault, 0.2))

  return createTheme(base, {
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          a: {
            color: linkDefault,
            transition: 'color 0.2s ease',
            '&:visited': {
              color: linkVisited,
            },
          },
        },
      },
    },
  })
}
