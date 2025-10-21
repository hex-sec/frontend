import { useMemo, useCallback, type ReactNode } from 'react'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded'
import PaidRoundedIcon from '@mui/icons-material/PaidRounded'
import { Paper, Typography, Stack, Chip, Button, Divider, Box } from '@mui/material'
import { useSiteBackNavigation } from '@app/layout/useSiteBackNavigation'
import {
  createReportSnapshots,
  formatCurrency,
  type ReportSnapshot,
  type BillingSummaryRow,
  type EventHighlightRow,
} from '@features/admin/reports/reportData'
import { generateReportPdf } from '@features/admin/reports/reportPdf'

export default function ReportsPage() {
  const { activeSite, slug: derivedSlug } = useSiteBackNavigation()
  const siteName = activeSite?.name ?? derivedSlug ?? null
  const isSiteContext = Boolean(siteName)

  const snapshots = useMemo(() => createReportSnapshots(siteName ?? undefined), [siteName])
  const { daily, monthly } = snapshots

  const handleDailyDownload = useCallback(() => generateReportPdf(daily), [daily])
  const handleMonthlyDownload = useCallback(() => generateReportPdf(monthly), [monthly])

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
              <Typography variant="h6">Reports</Typography>
              {isSiteContext && siteName ? (
                <Chip label={siteName} size="small" color="secondary" />
              ) : null}
            </Stack>
            <Typography color="text.secondary" variant="body2">
              Daily and monthly billing summaries paired with the top operational events. Export a
              PDF snapshot to share with stakeholders.
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
              Daily PDF
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadRoundedIcon />}
              onClick={handleMonthlyDownload}
              fullWidth
            >
              Monthly PDF
            </Button>
          </Stack>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          {isSiteContext && siteName
            ? `Metrics are scoped to ${siteName}. Switch back to enterprise mode for cross-site comparisons.`
            : 'Portfolio-wide aggregates shown. Select a specific site to focus this report.'}
        </Typography>

        <Divider flexItem />

        <SnapshotSection snapshot={daily} />
        <SnapshotSection snapshot={monthly} />
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

function SnapshotSection({ snapshot }: { snapshot: ReportSnapshot }) {
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
          title="Billing Overview"
          subtitle={snapshot.dateRange}
        >
          <BillingList items={snapshot.billingSummary} />
        </SummaryCard>
        <SummaryCard
          icon={<EventAvailableRoundedIcon fontSize="small" />}
          title="Event Highlights"
          subtitle={snapshot.dateRange}
        >
          <EventList items={snapshot.eventHighlights} />
        </SummaryCard>
      </Box>
      <SummaryCard title="Key Insights">
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
