import { Box, Paper, Skeleton, Stack, Typography } from '@mui/material'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import { BarChart } from '@mui/x-charts/BarChart'
import type { FinanceARDTO } from '../analytics.types'

interface FinanceChartProps {
  data?: FinanceARDTO
  loading: boolean
}

export function FinanceChart({ data, loading }: FinanceChartProps) {
  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={300} />
      </Paper>
    )
  }

  if (!data || !data.periods.length) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No hay datos disponibles</Typography>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <AttachMoneyIcon fontSize="small" color="success" />
        <Typography variant="h6" fontWeight={600}>
          Recaudación Mensual
        </Typography>
      </Stack>

      <Box sx={{ width: '100%', height: 300 }}>
        <BarChart
          series={[
            {
              data: data.bars,
              label: 'Recaudado',
            },
            {
              data: data.line,
              label: 'Morosidad',
            },
          ]}
          xAxis={[{ scaleType: 'band', data: data.periods }]}
          yAxis={[{ scaleType: 'linear' }]}
          height={300}
        />
      </Box>
    </Paper>
  )
}
