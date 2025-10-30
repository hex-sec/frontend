import { type SxProps, type Theme } from '@mui/material/styles'

export type FinancialSnapshot = {
  mrr: string
  arr: string
  overdueInvoices: number
  collectionRate: number
  topLineVsLastMonth: number
  upcomingRenewals: number
}

export type KpiItem = {
  label: string
  value: string
  delta: string
  sublabel: string
  accent: string
  // consumer supplies icon element
}

export type TimelineItem = {
  key: string
  avatarSx: SxProps<Theme>
  iconKey: 'car' | 'alarm' | 'people'
  primary: string
  secondary: string
  chipLabel: string
  chipColor: 'default' | 'success'
}

export type AlertCard = {
  key: string
  borderColor: 'warning.light' | 'error.light'
  title: string
  description: string
  actionLabel: string
  actionColor: 'primary'
}

export type AgendaItem = {
  key: string
  iconKey: 'people' | 'currency' | 'alarm'
  primary: string
  secondary: string
}

export type DashboardData = {
  financialSnapshot: FinancialSnapshot
  kpis: KpiItem[]
  timeline: TimelineItem[]
  alerts: AlertCard[]
  agenda: AgendaItem[]
}

export type DashboardContext = {
  mode: 'site' | 'enterprise'
  currentSlug?: string | null
  language?: string
}

// Simulated async fetch; in real app, replace with HTTP calls
export async function fetchDashboardData(ctx: DashboardContext): Promise<DashboardData> {
  // For now, return defaults; callers localize labels and provide icons
  const siteBase = ctx.mode === 'site' && ctx.currentSlug ? `/site/${ctx.currentSlug}` : '/admin'

  return Promise.resolve({
    financialSnapshot: {
      mrr: '$18,450',
      arr: '$219K',
      overdueInvoices: 3,
      collectionRate: 97,
      topLineVsLastMonth: 6.4,
      upcomingRenewals: 8,
    },
    kpis: [
      {
        label: 'Active residents',
        value: '1,284',
        delta: '+3.2%',
        sublabel: 'in the last 30 days',
        accent: 'primary.main',
      },
      {
        label: 'Scheduled visits',
        value: '86',
        delta: '+12',
        sublabel: 'today',
        accent: 'info.main',
      },
      {
        label: 'Open incidents',
        value: '5',
        delta: '-2',
        sublabel: 'vs last week',
        accent: 'warning.main',
      },
    ],
    timeline: [
      {
        key: 'authorizedEntry',
        avatarSx: { bgcolor: 'primary.main', color: 'common.white' },
        iconKey: 'car',
        primary: 'Authorized vehicle entry',
        secondary: 'QR scan at main gate',
        chipLabel: 'Gate',
        chipColor: 'default',
      },
      {
        key: 'incidentResolved',
        avatarSx: { bgcolor: 'warning.main', color: 'common.black' },
        iconKey: 'alarm',
        primary: 'Incident resolved',
        secondary: 'Noise complaint closed',
        chipLabel: 'Resolved',
        chipColor: 'success',
      },
      {
        key: 'residentRegistered',
        avatarSx: { bgcolor: 'info.main', color: 'common.white' },
        iconKey: 'people',
        primary: 'New resident registered',
        secondary: 'Welcome package sent',
        chipLabel: 'New',
        chipColor: 'default',
      },
    ],
    alerts: [
      {
        key: 'guestPasses',
        borderColor: 'warning.light',
        title: 'Guest passes expiring',
        description: 'Several guest passes will expire this week.',
        actionLabel: 'Renew',
        actionColor: 'primary',
      },
      {
        key: 'cameraOffline',
        borderColor: 'error.light',
        title: 'Camera offline',
        description: 'South entrance camera is offline.',
        actionLabel: 'Assign guard',
        actionColor: 'primary',
      },
    ],
    quickActions: [
      {
        key: 'createVisit',
        label: 'Create visit',
        description: 'Schedule a new visitor entry.',
        href: `${siteBase}/visits`,
        iconKey: 'add',
      },
      {
        key: 'logIncident',
        label: 'Log incident',
        description: 'Record a gate or site incident.',
        href: `${siteBase}/incidents`,
        iconKey: 'alarm',
      },
      {
        key: 'inviteResident',
        label: 'Invite resident',
        description: 'Send an invitation to a household.',
        href: `${siteBase}/users`,
        iconKey: 'people',
      },
    ],
    navShortcuts: [
      { key: 'sites', label: 'Sites', caption: '3 properties', to: `${siteBase}/sites` },
      { key: 'users', label: 'Users', caption: 'Manage members', to: `${siteBase}/users` },
      { key: 'admins', label: 'Admins', caption: '5 admins', to: `${siteBase}/users/admins` },
      { key: 'guards', label: 'Guards', caption: '12 guards', to: `${siteBase}/users/guards` },
      {
        key: 'residents',
        label: 'Residents',
        caption: '28 residents',
        to: `${siteBase}/users/residents`,
      },
      {
        key: 'residences',
        label: 'Residences',
        caption: 'Units & villas',
        to: `${siteBase}/residences`,
      },
      { key: 'visits', label: 'Visits', caption: 'Entries & passes', to: `${siteBase}/visits` },
      {
        key: 'vehicles',
        label: 'Vehicles',
        caption: 'Registered plates',
        to: `${siteBase}/vehicles`,
      },
      {
        key: 'visitors',
        label: 'Visitors',
        caption: 'Guest directory',
        to: `${siteBase}/visitors`,
      },
      { key: 'reports', label: 'Reports', caption: 'KPIs & exports', to: `${siteBase}/reports` },
    ],
    agenda: [
      {
        key: 'securityCommittee',
        iconKey: 'people',
        primary: 'Security committee',
        secondary: 'Monthly review, 3pm',
      },
      {
        key: 'billingReview',
        iconKey: 'currency',
        primary: 'Billing review',
        secondary: 'Quarterly meeting',
      },
      {
        key: 'guardOnboarding',
        iconKey: 'alarm',
        primary: 'Guard onboarding',
        secondary: 'New contractor training',
      },
    ],
  })
}
