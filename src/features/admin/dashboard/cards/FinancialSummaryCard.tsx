import {
  Box,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  type SxProps,
  type Theme,
} from '@mui/material'

interface MetricPillProps {
  label: string
  value: string
}

function MetricPill({ label, value }: MetricPillProps) {
  return (
    <Box
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.default',
        p: 1.5,
        minWidth: 0,
        transition: (theme) =>
          theme.transitions.create(['border-color', 'background-color'], {
            duration: theme.transitions.duration.shortest,
          }),
        '&:hover': {
          borderColor: 'primary.light',
          bgcolor: 'action.hover',
        },
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="subtitle2" fontWeight={600}>
        {value}
      </Typography>
    </Box>
  )
}

interface FinancialSummaryCardProps {
  mrr: string
  arr: string
  collectionRate: number
  upcomingRenewals: number
  overdueInvoicesCount: number
  mrrLabel: string
  arrProjectedLabel: string
  upcomingRenewalsLabel: string
  contractsSuffix: string
  monthlyCollectionsLabel: string
  overdueInvoicesLabel: string
}

const surfaceCard: SxProps<Theme> = {
  p: 2,
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
}

export function FinancialSummaryCard({
  mrr,
  arr,
  collectionRate,
  upcomingRenewals,
  overdueInvoicesCount,
  mrrLabel,
  arrProjectedLabel,
  upcomingRenewalsLabel,
  contractsSuffix,
  monthlyCollectionsLabel,
  overdueInvoicesLabel,
}: FinancialSummaryCardProps) {
  return (
    <Paper sx={{ ...surfaceCard }}>
      <Stack spacing={3}>
        {/* MRR */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
            {mrrLabel}
          </Typography>
          <Typography variant="h5" fontWeight={600}>
            {mrr}
          </Typography>
        </Box>

        <Divider />

        {/* ARR & Renewals */}
        <Stack direction="column" spacing={2}>
          <MetricPill label={arrProjectedLabel} value={arr} />
          <MetricPill
            label={upcomingRenewalsLabel}
            value={`${upcomingRenewals} ${contractsSuffix}`}
          />
        </Stack>

        <Divider />

        {/* Collection Rate */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {monthlyCollectionsLabel}
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {collectionRate}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={collectionRate}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {overdueInvoicesLabel.replace('{count}', overdueInvoicesCount.toString())}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  )
}
