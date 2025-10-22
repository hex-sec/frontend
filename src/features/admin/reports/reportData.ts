import { startOfMonth, endOfMonth } from 'date-fns'
import { getCurrentLanguage } from '@i18n/i18n'

export type BillingSummaryRow = {
  label: string
  amount: number
  trend?: string
}

export type EventHighlightRow = {
  label: string
  timeframe: string
  impact: string
}

export type ReportSnapshotId = 'daily' | 'monthly'

export type ReportSnapshot = {
  id: ReportSnapshotId
  title: string
  focus: string
  dateRange: string
  generatedOn: Date
  generatedAt: string
  siteName?: string
  billingSummary: BillingSummaryRow[]
  eventHighlights: EventHighlightRow[]
  insights: string[]
}

export type ReportTranslate = (
  key: string,
  defaultValue: string,
  options?: Record<string, unknown>,
) => string

export const formatCurrency = (value: number, locale?: string, currency?: string) => {
  // Determine defaults from current language when locale/currency not provided
  const lang =
    (typeof getCurrentLanguage === 'function' ? (getCurrentLanguage() as string) : 'en') || 'en'
  const defaults: Record<string, { locale: string; currency: string }> = {
    en: { locale: 'en-US', currency: 'USD' },
    es: { locale: 'es-ES', currency: 'EUR' },
    fr: { locale: 'fr-FR', currency: 'EUR' },
    de: { locale: 'de-DE', currency: 'EUR' },
    it: { locale: 'it-IT', currency: 'EUR' },
    ru: { locale: 'ru-RU', currency: 'RUB' },
    zh: { locale: 'zh-CN', currency: 'CNY' },
    ja: { locale: 'ja-JP', currency: 'JPY' },
  }

  const resolvedLocale = locale || defaults[lang]?.locale || 'en-US'
  const resolvedCurrency = currency || defaults[lang]?.currency || 'USD'
  const formatter = new Intl.NumberFormat(resolvedLocale, {
    style: 'currency',
    currency: resolvedCurrency,
    maximumFractionDigits: 0,
  })
  return formatter.format(value)
}

export function createReportSnapshots(
  translate: ReportTranslate,
  options: { siteName?: string; language?: string } = {},
) {
  const { siteName, language = 'en' } = options
  const generatedOn = new Date()

  const singleDayFormatter = new Intl.DateTimeFormat(language, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const rangeStartFormatter = new Intl.DateTimeFormat(language, {
    month: 'long',
    day: 'numeric',
  })

  const rangeEndFormatter = new Intl.DateTimeFormat(language, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const generatedFormatter = new Intl.DateTimeFormat(language, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const todayLabel = translate('admin.reportsPage.snapshots.daily.dateRange', '{{date}}', {
    date: singleDayFormatter.format(generatedOn),
  })

  const monthStart = startOfMonth(generatedOn)
  const monthEnd = endOfMonth(generatedOn)
  const monthRange = translate(
    'admin.reportsPage.snapshots.monthly.dateRange',
    '{{start}} – {{end}}',
    {
      start: rangeStartFormatter.format(monthStart),
      end: rangeEndFormatter.format(monthEnd),
    },
  )

  const generatedAt = translate('admin.reportsPage.snapshots.generatedAt', '{{value}}', {
    value: generatedFormatter.format(generatedOn),
  })

  const portfolioFallback = translate('admin.reportsPage.snapshots.portfolioFallback', 'Portfolio')

  const portfolioLongFallback = translate(
    'admin.reportsPage.snapshots.portfolioLongFallback',
    'The portfolio',
  )

  const dailySnapshot: ReportSnapshot = {
    id: 'daily',
    title: translate('admin.reportsPage.snapshots.daily.title', 'Daily Snapshot'),
    focus: translate('admin.reportsPage.snapshots.daily.focus', 'Billing & Events'),
    dateRange: todayLabel,
    generatedOn,
    generatedAt,
    siteName,
    billingSummary: [
      {
        label: translate(
          'admin.reportsPage.snapshots.daily.billing.invoices.label',
          'Invoices issued today',
        ),
        amount: 13240,
        trend: translate(
          'admin.reportsPage.snapshots.daily.billing.invoices.trend',
          'Up 5% vs yesterday',
        ),
      },
      {
        label: translate(
          'admin.reportsPage.snapshots.daily.billing.payments.label',
          'Payments collected',
        ),
        amount: 11860,
        trend: translate(
          'admin.reportsPage.snapshots.daily.billing.payments.trend',
          '92% same-day capture rate',
        ),
      },
      {
        label: translate(
          'admin.reportsPage.snapshots.daily.billing.outstanding.label',
          'Outstanding balance',
        ),
        amount: 1840,
        trend: translate(
          'admin.reportsPage.snapshots.daily.billing.outstanding.trend',
          '5 households flagged for follow-up',
        ),
      },
      {
        label: translate(
          'admin.reportsPage.snapshots.daily.billing.eventRevenue.label',
          'Event-related revenue',
        ),
        amount: 2200,
        trend: translate(
          'admin.reportsPage.snapshots.daily.billing.eventRevenue.trend',
          'Includes 2 venue deposits',
        ),
      },
    ],
    eventHighlights: [
      {
        label: translate(
          'admin.reportsPage.snapshots.daily.events.vendorSession.label',
          'Vendor onboarding session',
        ),
        timeframe: translate(
          'admin.reportsPage.snapshots.daily.events.vendorSession.timeframe',
          '09:30 – 10:15',
        ),
        impact: translate(
          'admin.reportsPage.snapshots.daily.events.vendorSession.impact',
          'Facilities and Finance aligned on auto-billing for maintenance vendors.',
        ),
      },
      {
        label: translate(
          'admin.reportsPage.snapshots.daily.events.movieNight.label',
          'Community movie night',
        ),
        timeframe: translate(
          'admin.reportsPage.snapshots.daily.events.movieNight.timeframe',
          '19:00 – 21:00',
        ),
        impact: translate(
          'admin.reportsPage.snapshots.daily.events.movieNight.impact',
          '215 RSVPs • Security confirmed perimeter sweep and guest parking overflow.',
        ),
      },
      {
        label: translate(
          'admin.reportsPage.snapshots.daily.events.emergencyMaintenance.label',
          'Emergency gate maintenance',
        ),
        timeframe: translate(
          'admin.reportsPage.snapshots.daily.events.emergencyMaintenance.timeframe',
          'Scheduled 22:30',
        ),
        impact: translate(
          'admin.reportsPage.snapshots.daily.events.emergencyMaintenance.impact',
          'Guard team Bravo on standby • Billing holds waived for affected residents.',
        ),
      },
    ],
    insights: [
      translate(
        'admin.reportsPage.snapshots.daily.insights.recoveries',
        '{{target}} recovered 3 past-due invoices with automated reminders.',
        { target: siteName ?? portfolioFallback },
      ),
      translate(
        'admin.reportsPage.snapshots.daily.insights.portalUsage',
        'Self-service portal usage peaked at 18:40 after the evening broadcast.',
      ),
      translate(
        'admin.reportsPage.snapshots.daily.insights.chargebacks',
        'No chargebacks reported in the last 48 hours.',
      ),
    ],
  }

  const monthlySnapshot: ReportSnapshot = {
    id: 'monthly',
    title: translate('admin.reportsPage.snapshots.monthly.title', 'Monthly Overview'),
    focus: translate('admin.reportsPage.snapshots.monthly.focus', 'Billing & Events'),
    dateRange: monthRange,
    generatedOn,
    generatedAt,
    siteName,
    billingSummary: [
      {
        label: translate(
          'admin.reportsPage.snapshots.monthly.billing.totalInvoiced.label',
          'Total invoiced',
        ),
        amount: 386400,
        trend: translate(
          'admin.reportsPage.snapshots.monthly.billing.totalInvoiced.trend',
          'Up 7% vs prior month',
        ),
      },
      {
        label: translate(
          'admin.reportsPage.snapshots.monthly.billing.payments.label',
          'Payments collected',
        ),
        amount: 348900,
        trend: translate(
          'admin.reportsPage.snapshots.monthly.billing.payments.trend',
          '90% collection rate',
        ),
      },
      {
        label: translate(
          'admin.reportsPage.snapshots.monthly.billing.outstanding.label',
          'Outstanding balance',
        ),
        amount: 37480,
        trend: translate(
          'admin.reportsPage.snapshots.monthly.billing.outstanding.trend',
          'Down 12% vs prior month',
        ),
      },
      {
        label: translate(
          'admin.reportsPage.snapshots.monthly.billing.eventRevenue.label',
          'Event revenue',
        ),
        amount: 15850,
        trend: translate(
          'admin.reportsPage.snapshots.monthly.billing.eventRevenue.trend',
          'Includes 4 corporate rentals',
        ),
      },
    ],
    eventHighlights: [
      {
        label: translate(
          'admin.reportsPage.snapshots.monthly.events.gala.label',
          'Fall gala weekend',
        ),
        timeframe: translate(
          'admin.reportsPage.snapshots.monthly.events.gala.timeframe',
          'Oct 11 – 13',
        ),
        impact: translate(
          'admin.reportsPage.snapshots.monthly.events.gala.impact',
          'Generated $6.2k in sponsorships • Zero escalations logged.',
        ),
      },
      {
        label: translate(
          'admin.reportsPage.snapshots.monthly.events.fireDrills.label',
          'Fire safety drills',
        ),
        timeframe: translate(
          'admin.reportsPage.snapshots.monthly.events.fireDrills.timeframe',
          'Oct 3 / Oct 17',
        ),
        impact: translate(
          'admin.reportsPage.snapshots.monthly.events.fireDrills.impact',
          'All guard shifts compliant • Billing holds lifted for participating vendors.',
        ),
      },
      {
        label: translate(
          'admin.reportsPage.snapshots.monthly.events.marketPrep.label',
          'Holiday market preparation',
        ),
        timeframe: translate(
          'admin.reportsPage.snapshots.monthly.events.marketPrep.timeframe',
          'Oct 21 – 30',
        ),
        impact: translate(
          'admin.reportsPage.snapshots.monthly.events.marketPrep.impact',
          'Early vendor onboarding cuts deposit reconciliation time by 18%.',
        ),
      },
    ],
    insights: [
      translate(
        'admin.reportsPage.snapshots.monthly.insights.paymentRate',
        '{{target}} sustained a 94% on-time payment rate across recurring charges.',
        { target: siteName ?? portfolioLongFallback },
      ),
      translate(
        'admin.reportsPage.snapshots.monthly.insights.attendance',
        'Event attendance is 22% above last October, driven by resident-led initiatives.',
      ),
      translate(
        'admin.reportsPage.snapshots.monthly.insights.receivables',
        'Projected receivables for next month sit 11% below the same period last year.',
      ),
    ],
  }

  return { daily: dailySnapshot, monthly: monthlySnapshot }
}
