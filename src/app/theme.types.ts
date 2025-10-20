export type BrandThemeConfig = {
  name: string
  primary: string
  secondary: string
  contrastMode?: 'normal' | 'high'
  borderRadius?: number
  fontFamily?: string
}
export type ThemeKind = 'light' | 'dark' | 'high-contrast' | 'brand'
