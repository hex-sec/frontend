export type BrandThemeConfig = {
  name: string
  primary: string
  secondary: string
  info?: string
  success?: string
  warning?: string
  error?: string
  debug?: string
  contrastMode?: 'normal' | 'high'
  borderRadius?: number
  fontFamily?: string
}
export type ThemeKind = 'light' | 'dark' | 'high-contrast' | 'brand' | 'system'

// Hex theme preset types (for JSON theme presets)
export type HexPaletteColor = { main: string; light?: string; dark?: string; contrastText?: string }

export type HexPalette = {
  mode: 'light' | 'dark'
  primary: HexPaletteColor
  secondary: HexPaletteColor
  background: { default: string; paper: string }
  text?: { primary?: string; secondary?: string }
  success?: HexPaletteColor
  warning?: HexPaletteColor
  error?: HexPaletteColor
  links?: { default: string; visited: string }
}

export type HexThemePreset = {
  id: string
  label: string
  palette: HexPalette
}

export type HexThemesFile = { themes: HexThemePreset[] }
