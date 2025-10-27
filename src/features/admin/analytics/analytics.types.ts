export type Granularity = 'auto' | 'day' | 'week' | 'month'
export type SiteScope = 'current' | 'all' | string

export type AnalyticsParams = {
  date_from: string // ISO
  date_to: string // ISO
  granularity: Granularity
  site_scope: SiteScope
}

export type TimeBucket = { ts: string; value: number; series?: string }

export type AccessFlowDTO = {
  buckets: TimeBucket[]
  total?: number
}

export type PeaksDTO = {
  hours: number[] // 0..23
  days: string[] // ISO date (o labels)
  matrix: number[][] // rows=days, cols=hours
}

export type VisitsFunnelDTO = {
  steps: { name: string; value: number }[]
}

export type IncidentsDTO = {
  categories: string[]
  series: { name: string; data: number[] }[]
}

export type FinanceARDTO = {
  periods: string[]
  bars: number[] // recaudado
  line: number[] // morosidad
}

export type TopPlatesDTO = {
  items: { label: string; value: number }[]
  total?: number
}

export type AnalyticsOverview = {
  generated_at: string
  params_echo: AnalyticsParams
  accessFlow?: AccessFlowDTO
  peaks?: PeaksDTO
  visitsFunnel?: VisitsFunnelDTO
  incidents?: IncidentsDTO
  financeAR?: FinanceARDTO
  topPlates?: TopPlatesDTO
  errors?: Record<string, { code: string; message: string }>
}
