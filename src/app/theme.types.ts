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
