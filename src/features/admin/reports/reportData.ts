import { format, startOfMonth, endOfMonth } from 'date-fns'
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

export function createReportSnapshots(siteName?: string) {
  const generatedOn = new Date()
  const todayLabel = format(generatedOn, 'MMMM d, yyyy')
  const monthStart = startOfMonth(generatedOn)
  const monthEnd = endOfMonth(generatedOn)
  const monthRange = `${format(monthStart, 'MMMM d')} – ${format(monthEnd, 'MMMM d, yyyy')}`

  const dailySnapshot: ReportSnapshot = {
    id: 'daily',
    title: 'Daily Snapshot',
    focus: 'Billing & Events',
    dateRange: todayLabel,
    generatedOn,
    generatedAt: format(generatedOn, 'MMM d, yyyy • h:mm a'),
    siteName,
    billingSummary: [
      {
        label: 'Invoices issued today',
        amount: 13240,
        trend: 'Up 5% vs yesterday',
      },
      {
        label: 'Payments collected',
        amount: 11860,
        trend: '92% same-day capture rate',
      },
      {
        label: 'Outstanding balance',
        amount: 1840,
        trend: '5 households flagged for follow-up',
      },
      {
        label: 'Event-related revenue',
        amount: 2200,
        trend: 'Includes 2 venue deposits',
      },
    ],
    eventHighlights: [
      {
        label: 'Vendor onboarding session',
        timeframe: '09:30 – 10:15',
        impact: 'Facilities and Finance aligned on auto-billing for maintenance vendors.',
      },
      {
        label: 'Community movie night',
        timeframe: '19:00 – 21:00',
        impact: '215 RSVPs • Security confirmed perimeter sweep and guest parking overflow.',
      },
      {
        label: 'Emergency gate maintenance',
        timeframe: 'Scheduled 22:30',
        impact: 'Guard team Bravo on standby • Billing holds waived for affected residents.',
      },
    ],
    insights: [
      `${siteName ?? 'Portfolio'} recovered 3 past-due invoices with automated reminders.`,
      'Self-service portal usage peaked at 18:40 after the evening broadcast.',
      'No chargebacks reported in the last 48 hours.',
    ],
  }

  const monthlySnapshot: ReportSnapshot = {
    id: 'monthly',
    title: 'Monthly Overview',
    focus: 'Billing & Events',
    dateRange: monthRange,
    generatedOn,
    generatedAt: format(generatedOn, 'MMM d, yyyy • h:mm a'),
    siteName,
    billingSummary: [
      {
        label: 'Total invoiced',
        amount: 386400,
        trend: 'Up 7% vs prior month',
      },
      {
        label: 'Payments collected',
        amount: 348900,
        trend: '90% collection rate',
      },
      {
        label: 'Outstanding balance',
        amount: 37480,
        trend: 'Down 12% vs prior month',
      },
      {
        label: 'Event revenue',
        amount: 15850,
        trend: 'Includes 4 corporate rentals',
      },
    ],
    eventHighlights: [
      {
        label: 'Fall gala weekend',
        timeframe: 'Oct 11 – 13',
        impact: 'Generated $6.2k in sponsorships • Zero escalations logged.',
      },
      {
        label: 'Fire safety drills',
        timeframe: 'Oct 3 / Oct 17',
        impact: 'All guard shifts compliant • Billing holds lifted for participating vendors.',
      },
      {
        label: 'Holiday market preparation',
        timeframe: 'Oct 21 – 30',
        impact: 'Early vendor onboarding cuts deposit reconciliation time by 18%.',
      },
    ],
    insights: [
      `${siteName ?? 'The portfolio'} sustained a 94% on-time payment rate across recurring charges.`,
      'Event attendance is 22% above last October, driven by resident-led initiatives.',
      'Projected receivables for next month sit 11% below the same period last year.',
    ],
  }

  return { daily: dailySnapshot, monthly: monthlySnapshot }
}
