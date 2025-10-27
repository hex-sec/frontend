import { Box, Paper, Skeleton, Stack, Typography } from '@mui/material'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import { BarChart } from '@mui/x-charts/BarChart'
import type { VisitsFunnelDTO } from '../analytics.types'

interface VisitsFunnelChartProps {
  data?: VisitsFunnelDTO
  loading: boolean
}

export function VisitsFunnelChart({ data, loading }: VisitsFunnelChartProps) {
  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={300} />
      </Paper>
    )
  }

  if (!data || !data.steps.length) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No hay datos disponibles</Typography>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <CompareArrowsIcon fontSize="small" color="primary" />
        <Typography variant="h6" fontWeight={600}>
          Embudo de Visitas
        </Typography>
      </Stack>

      <Box sx={{ width: '100%', height: 300 }}>
        <BarChart
          series={[
            {
              data: data.steps.map((s) => s.value),
              label: 'Visitas',
            },
          ]}
          xAxis={[{ scaleType: 'band', data: data.steps.map((s) => s.name) }]}
          yAxis={[{ scaleType: 'linear' }]}
          height={300}
        />
      </Box>
    </Paper>
  )
}
