import { useState, useEffect } from 'react'
import { Box, CircularProgress, Paper, Typography, Stack } from '@mui/material'
import Grid from '@mui/material/Grid2'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import WarningIcon from '@mui/icons-material/Warning'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import { useAnalyticsOverview } from './analytics.api'
import { AnalyticsFilterBar } from './AnalyticsFilterBar'
import type {
  AnalyticsParams,
  AccessFlowDTO,
  FinanceARDTO,
  VisitsFunnelDTO,
  IncidentsDTO,
} from './analytics.types'
import { alpha, useTheme } from '@mui/material/styles'

const getDefaultParams = (): AnalyticsParams => {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 30)
  return {
    date_from: from.toISOString(),
    date_to: to.toISOString(),
    granularity: 'auto',
    site_scope: 'current',
  }
}

// Access Flow - Stats with Icons
function AccessFlowChart({ data }: { data: AccessFlowDTO }) {
  const theme = useTheme()
  const entries = data.buckets.filter((b) => b.series === 'entries')
  const exits = data.buckets.filter((b) => b.series === 'exits')
  const totalEntries = entries.reduce((sum: number, e) => sum + e.value, 0)
  const totalExits = exits.reduce((sum: number, e) => sum + e.value, 0)
  const avgEntries = totalEntries / (entries.length || 1)
  const avgExits = totalExits / (exits.length || 1)

  return (
    <Stack spacing={2} sx={{ py: 1 }}>
      <Stack direction="row" spacing={2}>
        <Box
          sx={{
            flex: 1,
            textAlign: 'center',
            p: 2,
            bgcolor: alpha(theme.palette.success.main, 0.1),
            borderRadius: 2,
          }}
        >
          <Typography variant="h4" fontWeight={700} color="success.main">
            {totalEntries}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Total Entradas
          </Typography>
        </Box>
        <Box
          sx={{
            flex: 1,
            textAlign: 'center',
            p: 2,
            bgcolor: alpha(theme.palette.error.main, 0.1),
            borderRadius: 2,
          }}
        >
          <Typography variant="h4" fontWeight={700} color="error.main">
            {totalExits}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Total Salidas
          </Typography>
        </Box>
      </Stack>
      <Stack direction="row" spacing={2}>
        <Box sx={{ flex: 1, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Promedio Entradas/Día
          </Typography>
          <Typography variant="h5" fontWeight={600} color="success.main">
            {Math.round(avgEntries)}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Promedio Salidas/Día
          </Typography>
          <Typography variant="h5" fontWeight={600} color="error.main">
            {Math.round(avgExits)}
          </Typography>
        </Box>
      </Stack>
    </Stack>
  )
}

function FinanceChart({ data }: { data: FinanceARDTO }) {
  const theme = useTheme()
  const totalRevenue = data.bars.reduce((sum: number, val: number) => sum + val, 0)
  const totalDelinquency = data.line.reduce((sum: number, val: number) => sum + val, 0)
  const delinquentRate = ((totalDelinquency / totalRevenue) * 100).toFixed(1)

  return (
    <Stack spacing={2} sx={{ py: 1 }}>
      <Box
        sx={{
          textAlign: 'center',
          p: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          borderRadius: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Ingresos Total
        </Typography>
        <Typography variant="h3" fontWeight={700} color="primary.main">
          ${(totalRevenue / 1000).toFixed(0)}k
        </Typography>
      </Box>
      <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Tasa de Morosidad
          </Typography>
          <Typography
            variant="h6"
            fontWeight={600}
            color={parseFloat(delinquentRate) > 5 ? 'error.main' : 'success.main'}
          >
            {delinquentRate}%
          </Typography>
        </Stack>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: 8,
            bgcolor: 'divider',
            borderRadius: 4,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: `${delinquentRate}%`,
              height: '100%',
              bgcolor: parseFloat(delinquentRate) > 5 ? 'error.main' : 'warning.main',
              borderRadius: 4,
            }}
          />
        </Box>
      </Box>
    </Stack>
  )
}

function VisitsFunnelChart({ data }: { data: VisitsFunnelDTO }) {
  const theme = useTheme()
  const [scheduled, admitted, completed] = data.steps

  const admittedRate = ((admitted.value / scheduled.value) * 100).toFixed(1)
  const completedRate = ((completed.value / scheduled.value) * 100).toFixed(1)

  return (
    <Stack spacing={2} sx={{ py: 1 }}>
      <Box
        sx={{
          textAlign: 'center',
          p: 3,
          bgcolor: alpha(theme.palette.info.main, 0.1),
          borderRadius: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Visitas Completadas
        </Typography>
        <Typography variant="h3" fontWeight={700} color="info.main">
          {completed.value}
        </Typography>
      </Box>
      <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
        <Stack spacing={1.5}>
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Tasa de Admisión: {admittedRate}%
            </Typography>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: 6,
                bgcolor: 'divider',
                borderRadius: 3,
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: `${admittedRate}%`,
                  height: '100%',
                  bgcolor: 'info.main',
                  borderRadius: 3,
                }}
              />
            </Box>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Tasa de Finalización: {completedRate}%
            </Typography>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: 6,
                bgcolor: 'divider',
                borderRadius: 3,
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: `${completedRate}%`,
                  height: '100%',
                  bgcolor: 'success.main',
                  borderRadius: 3,
                }}
              />
            </Box>
          </Box>
        </Stack>
      </Box>
    </Stack>
  )
}

function IncidentsChart({ data }: { data: IncidentsDTO }) {
  const theme = useTheme()
  const totalByCategory = data.categories.map((cat: string, i: number) => ({
    name: cat,
    total: data.series.reduce((sum: number, s) => sum + s.data[i], 0),
  }))
  const grandTotal = totalByCategory.reduce((sum: number, item) => sum + item.total, 0)

  return (
    <Stack spacing={2} sx={{ py: 1 }}>
      <Box
        sx={{
          textAlign: 'center',
          p: 3,
          bgcolor: alpha(theme.palette.error.main, 0.1),
          borderRadius: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Total Incidentes
        </Typography>
        <Typography variant="h3" fontWeight={700} color="error.main">
          {grandTotal}
        </Typography>
      </Box>
      <Stack spacing={1}>
        {totalByCategory.map((item, i: number) => {
          const percentage = ((item.total / grandTotal) * 100).toFixed(1)
          return (
            <Box key={item.name} sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 0.5 }}
              >
                <Typography variant="body2" fontWeight={500}>
                  {item.name}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {item.total} ({percentage}%)
                </Typography>
              </Stack>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: 6,
                  bgcolor: 'divider',
                  borderRadius: 3,
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: `${percentage}%`,
                    height: '100%',
                    bgcolor: i === 0 ? 'error.main' : i === 1 ? 'warning.main' : 'info.main',
                    borderRadius: 3,
                  }}
                />
              </Box>
            </Box>
          )
        })}
      </Stack>
    </Stack>
  )
}

export function AnalyticsSection() {
  const [params, setParams] = useState<AnalyticsParams>(getDefaultParams())
  const { data, isLoading, error } = useAnalyticsOverview(params)

  useEffect(() => {
    const saved = localStorage.getItem('analytics_filters')
    if (saved) {
      try {
        setParams(JSON.parse(saved))
      } catch {
        // Ignore parse errors
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('analytics_filters', JSON.stringify(params))
  }, [params])

  if (error) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">Error al cargar los datos de analítica</Typography>
      </Paper>
    )
  }

  return (
    <Box sx={{ width: '100%' }}>
      <AnalyticsFilterBar value={params} onChange={setParams} />

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {data && !isLoading && (
        <Grid container spacing={2}>
          {data.accessFlow && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <TrendingUpIcon fontSize="small" color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    Flujo de Accesos
                  </Typography>
                </Stack>
                <AccessFlowChart data={data.accessFlow} />
              </Paper>
            </Grid>
          )}
          {data.financeAR && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <AttachMoneyIcon fontSize="small" color="success" />
                  <Typography variant="h6" fontWeight={600}>
                    Recaudación Mensual
                  </Typography>
                </Stack>
                <FinanceChart data={data.financeAR} />
              </Paper>
            </Grid>
          )}
          {data.visitsFunnel && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <CompareArrowsIcon fontSize="small" color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    Embudo de Visitas
                  </Typography>
                </Stack>
                <VisitsFunnelChart data={data.visitsFunnel} />
              </Paper>
            </Grid>
          )}
          {data.incidents && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <WarningIcon fontSize="small" color="error" />
                  <Typography variant="h6" fontWeight={600}>
                    Incidentes por Categoría
                  </Typography>
                </Stack>
                <IncidentsChart data={data.incidents} />
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  )
}
