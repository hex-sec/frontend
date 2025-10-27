import { Box, Paper, Skeleton, Stack, Typography } from '@mui/material'
import WarningIcon from '@mui/icons-material/Warning'
import { BarChart } from '@mui/x-charts/BarChart'
import type { IncidentsDTO } from '../analytics.types'

interface IncidentsChartProps {
  data?: IncidentsDTO
  loading: boolean
}

export function IncidentsChart({ data, loading }: IncidentsChartProps) {
  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={300} />
      </Paper>
    )
  }

  if (!data || !data.categories.length) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No hay datos disponibles</Typography>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <WarningIcon fontSize="small" color="error" />
        <Typography variant="h6" fontWeight={600}>
          Incidentes por Categoría
        </Typography>
      </Stack>

      <Box sx={{ width: '100%', height: 300 }}>
        <BarChart
          series={data.series.map((s, idx) => ({
            data: s.data,
            label: s.name,
            id: `series-${idx}`,
          }))}
          xAxis={[{ scaleType: 'band', data: data.categories }]}
          yAxis={[{ scaleType: 'linear' }]}
          height={300}
        />
      </Box>
    </Paper>
  )
}
