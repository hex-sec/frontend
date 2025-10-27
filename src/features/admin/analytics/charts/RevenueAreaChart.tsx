import { Box, Paper, Skeleton, Stack, Typography } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { LineChart } from '@mui/x-charts/LineChart'
import type { AccessFlowDTO } from '../analytics.types'

interface RevenueAreaChartProps {
  data?: AccessFlowDTO
  loading: boolean
}

export function RevenueAreaChart({ data, loading }: RevenueAreaChartProps) {
  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={300} />
      </Paper>
    )
  }

  if (!data || !data.buckets.length) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No hay datos disponibles</Typography>
      </Paper>
    )
  }

  const entries = data.buckets.filter((b) => b.series === 'entries')
  const exits = data.buckets.filter((b) => b.series === 'exits')

  const entryValues = entries.map((b) => b.value)
  const exitValues = exits.map((b) => b.value)
  const labels = entries.map((b) =>
    new Date(b.ts).toLocaleDateString('es', { month: 'short', day: 'numeric' }),
  )

  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <TrendingUpIcon fontSize="small" color="primary" />
        <Typography variant="h6" fontWeight={600}>
          Flujo de Accesos
        </Typography>
      </Stack>

      <Box sx={{ width: '100%', height: 300 }}>
        <LineChart
          series={[
            {
              data: entryValues,
              label: 'Entradas',
            },
            {
              data: exitValues,
              label: 'Salidas',
            },
          ]}
          xAxis={[{ scaleType: 'point', data: labels }]}
          yAxis={[{ scaleType: 'linear' }]}
          height={300}
        />
      </Box>
    </Paper>
  )
}
