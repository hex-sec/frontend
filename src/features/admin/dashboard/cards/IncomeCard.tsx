import { Typography, Stack, Box, LinearProgress } from '@mui/material'
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined'
import CurrencyExchangeOutlinedIcon from '@mui/icons-material/CurrencyExchangeOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'

type BillingEntry = {
  key: string
  title: string
  subtitle: string
}

interface IncomeCardProps {
  title: string
  collectionRate: number
  topLineVsLastMonth: number
  growthNote: string
  marginVsLastMonth: string
  overdueInvoicesCount: number
  overdueInvoicesLabel: string
  billingEntries: BillingEntry[]
  monthlyCollectionsLabel: string
  recentBillingLabel: string
}

export function IncomeCard({
  title,
  collectionRate,
  topLineVsLastMonth,
  growthNote,
  marginVsLastMonth,
  overdueInvoicesCount,
  overdueInvoicesLabel,
  billingEntries,
  monthlyCollectionsLabel,
  recentBillingLabel,
}: IncomeCardProps) {
  return (
    <Stack spacing={2}>
      <Typography
        variant="subtitle1"
        fontWeight={600}
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <InsightsOutlinedIcon fontSize="small" color="info" />
        {title}
      </Typography>

      {/* Monthly Collections */}
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <CurrencyExchangeOutlinedIcon fontSize="small" color="primary" />
            <Typography variant="caption" color="text.secondary">
              {monthlyCollectionsLabel}
            </Typography>
          </Stack>
          <Typography variant="h6" fontWeight={600}>
            {collectionRate}%
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={collectionRate}
          sx={{ height: 8, borderRadius: 4 }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {overdueInvoicesLabel.replace('{{count}}', String(overdueInvoicesCount))}
        </Typography>
      </Box>

      {/* Recent Billing */}
      <Box>
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1.5 }}>
          <ReceiptLongOutlinedIcon fontSize="small" color="success" />
          <Typography variant="caption" color="text.secondary">
            {recentBillingLabel}
          </Typography>
        </Stack>
        <Stack spacing={1}>
          {billingEntries.map((entry) => (
            <Box
              key={entry.key}
              sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.default',
                p: 1.5,
              }}
            >
              <Typography variant="body2" fontWeight={500} sx={{ mb: 0.25 }}>
                {entry.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {entry.subtitle}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Growth Metrics */}
      <Box
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          pt: 2,
          mt: 1,
        }}
      >
        <Stack spacing={1}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <TrendingUpIcon color="success" />
            <Typography variant="body2" color="text.secondary">
              {marginVsLastMonth}
            </Typography>
          </Stack>
          <Typography variant="h5" fontWeight={600}>
            {topLineVsLastMonth}%
            <Typography component="span" variant="caption" color="success.main" sx={{ ml: 0.5 }}>
              ↑
            </Typography>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {growthNote}
          </Typography>
        </Stack>
      </Box>
    </Stack>
  )
}
