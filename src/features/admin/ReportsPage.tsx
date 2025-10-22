import { useMemo, useCallback, type ReactNode } from 'react'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded'
import PaidRoundedIcon from '@mui/icons-material/PaidRounded'
import { Paper, Typography, Stack, Chip, Button, Divider, Box } from '@mui/material'
import { useSiteBackNavigation } from '@app/layout/useSiteBackNavigation'
import {
  createReportSnapshots,
  type ReportTranslate,
  formatCurrency,
  type ReportSnapshot,
  type BillingSummaryRow,
  type EventHighlightRow,
} from '@features/admin/reports/reportData'
import { generateReportPdf } from '@features/admin/reports/reportPdf'
import { useTranslate } from '@i18n/useTranslate'
import { useI18nStore } from '@store/i18n.store'

export default function ReportsPage() {
  const { activeSite, slug: derivedSlug } = useSiteBackNavigation()
  const { t } = useTranslate()
  const language = useI18nStore((state) => state.language) ?? 'en'
  const siteName = activeSite?.name ?? derivedSlug ?? null
  const isSiteContext = Boolean(siteName)

  const translate = useMemo<ReportTranslate>(
    () => (key, defaultValue, options) =>
      t(key, {
        lng: language,
        defaultValue,
        ...options,
      }),
    [language, t],
  )

  const snapshots = useMemo(
    () => createReportSnapshots(translate, { siteName: siteName ?? undefined, language }),
    [language, siteName, translate],
  )

  const { daily, monthly } = snapshots

  const pageTitle = translate('reportsPage.title', 'Reports')
  const pageDescription = translate(
    'reportsPage.description',
    'Daily and monthly billing summaries paired with the top operational events. Export a PDF snapshot to share with stakeholders.',
  )
  const dailyPdfLabel = translate('reportsPage.actions.dailyPdf', 'Daily PDF')
  const monthlyPdfLabel = translate('reportsPage.actions.monthlyPdf', 'Monthly PDF')
  const siteScopedAlert = translate(
    'reportsPage.alerts.siteScoped',
    'Metrics are scoped to {{siteName}}. Switch back to enterprise mode for cross-site comparisons.',
    { siteName: siteName ?? '' },
  )
  const enterpriseAlert = translate(
    'reportsPage.alerts.enterprise',
    'Portfolio-wide aggregates shown. Select a specific site to focus this report.',
  )
  const billingOverviewTitle = translate('reportsPage.cards.billingOverview', 'Billing Overview')
  const eventHighlightsTitle = translate('reportsPage.cards.eventHighlights', 'Event Highlights')
  const keyInsightsTitle = translate('reportsPage.cards.keyInsights', 'Key Insights')

  const pdfLabels = useMemo(
    () => ({
      reportTitle: translate('reportsPage.pdf.title', 'Hex Community Report'),
      focusPrefix: translate('reportsPage.pdf.focusPrefix', 'Focus:'),
      sitePrefix: translate('reportsPage.pdf.sitePrefix', 'Site:'),
      siteFallback: translate('reportsPage.pdf.siteFallback', 'Enterprise Portfolio'),
      dateRangePrefix: translate('reportsPage.pdf.dateRangePrefix', 'Date Range:'),
      generatedPrefix: translate('reportsPage.pdf.generatedPrefix', 'Generated:'),
      billingSummaryTitle: translate('reportsPage.pdf.billingSummary', 'Billing Summary'),
      eventHighlightsTitle: translate('reportsPage.pdf.eventHighlights', 'Event Highlights'),
      keyNotesTitle: translate('reportsPage.pdf.keyNotes', 'Key Notes'),
    }),
    [translate],
  )

  const handleDailyDownload = useCallback(
    () => generateReportPdf(daily, pdfLabels),
    [daily, pdfLabels],
  )
  const handleMonthlyDownload = useCallback(
    () => generateReportPdf(monthly, pdfLabels),
    [monthly, pdfLabels],
  )

  return (
    <Paper sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          <Stack spacing={1} sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6">{pageTitle}</Typography>
              {isSiteContext && siteName ? (
                <Chip label={siteName} size="small" color="secondary" />
              ) : null}
            </Stack>
            <Typography color="text.secondary" variant="body2">
              {pageDescription}
            </Typography>
          </Stack>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <Button
              variant="outlined"
              startIcon={<DownloadRoundedIcon />}
              onClick={handleDailyDownload}
              fullWidth
            >
              {dailyPdfLabel}
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadRoundedIcon />}
              onClick={handleMonthlyDownload}
              fullWidth
            >
              {monthlyPdfLabel}
            </Button>
          </Stack>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          {isSiteContext && siteName ? siteScopedAlert : enterpriseAlert}
        </Typography>

        <Divider flexItem />

        <SnapshotSection
          snapshot={daily}
          billingTitle={billingOverviewTitle}
          eventsTitle={eventHighlightsTitle}
          insightsTitle={keyInsightsTitle}
        />
        <SnapshotSection
          snapshot={monthly}
          billingTitle={billingOverviewTitle}
          eventsTitle={eventHighlightsTitle}
          insightsTitle={keyInsightsTitle}
        />
      </Stack>
    </Paper>
  )
}

type SummaryCardProps = {
  icon?: ReactNode
  title: string
  subtitle?: string
  children: ReactNode
}

function SummaryCard({ icon, title, subtitle, children }: SummaryCardProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
      <Stack spacing={1.5} sx={{ height: '100%' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          {icon ? <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box> : null}
          <Stack spacing={0.25}>
            <Typography variant="subtitle2">{title}</Typography>
            {subtitle ? (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            ) : null}
          </Stack>
        </Stack>
        <Box sx={{ flex: 1 }}>{children}</Box>
      </Stack>
    </Paper>
  )
}

function SnapshotSection({
  snapshot,
  billingTitle,
  eventsTitle,
  insightsTitle,
}: {
  snapshot: ReportSnapshot
  billingTitle: string
  eventsTitle: string
  insightsTitle: string
}) {
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1">{snapshot.title}</Typography>
      <Box
        sx={{
          display: 'grid',
          gap: { xs: 2, md: 2.5 },
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, minmax(0, 1fr))',
          },
        }}
      >
        <SummaryCard
          icon={<PaidRoundedIcon fontSize="small" />}
          title={billingTitle}
          subtitle={snapshot.dateRange}
        >
          <BillingList items={snapshot.billingSummary} />
        </SummaryCard>
        <SummaryCard
          icon={<EventAvailableRoundedIcon fontSize="small" />}
          title={eventsTitle}
          subtitle={snapshot.dateRange}
        >
          <EventList items={snapshot.eventHighlights} />
        </SummaryCard>
      </Box>
      <SummaryCard title={insightsTitle}>
        <InsightList insights={snapshot.insights} />
      </SummaryCard>
    </Stack>
  )
}

function BillingList({ items }: { items: BillingSummaryRow[] }) {
  return (
    <Stack spacing={1.5}>
      {items.map((item) => (
        <Stack spacing={0.5} key={item.label}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline">
            <Typography variant="body2" fontWeight={600}>
              {item.label}
            </Typography>
            <Typography variant="body1">{formatCurrency(item.amount)}</Typography>
          </Stack>
          {item.trend ? (
            <Typography variant="caption" color="text.secondary">
              {item.trend}
            </Typography>
          ) : null}
        </Stack>
      ))}
    </Stack>
  )
}

function EventList({ items }: { items: EventHighlightRow[] }) {
  return (
    <Stack spacing={1.5}>
      {items.map((item) => (
        <Stack spacing={0.5} key={item.label}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline">
            <Typography variant="body2" fontWeight={600}>
              {item.label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.timeframe}
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {item.impact}
          </Typography>
        </Stack>
      ))}
    </Stack>
  )
}

function InsightList({ insights }: { insights: string[] }) {
  return (
    <Stack spacing={1.25}>
      {insights.map((insight) => (
        <Typography key={insight} variant="body2">
          {insight}
        </Typography>
      ))}
    </Stack>
  )
}
