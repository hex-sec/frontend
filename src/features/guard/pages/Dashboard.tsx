import { Paper, Typography, Stack, Button, Box, Card, CardContent } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { Link } from 'react-router-dom'
import { useAccessEvents } from '../hooks/useAccessEvents'
import { LiveFeed } from '../components/LiveFeed'
import AddIcon from '@mui/icons-material/Add'
import LoginIcon from '@mui/icons-material/Login'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import ReportProblemIcon from '@mui/icons-material/ReportProblem'

/**
 * Guard Dashboard
 * Displays KPIs, live feed, and quick actions
 */
export default function Dashboard() {
  const { data: events, isLoading: eventsLoading } = useAccessEvents(20, 3000)

  // Calculate KPIs from events
  const todayEvents =
    events?.filter((e) => {
      const eventDate = new Date(e.at)
      const today = new Date()
      return (
        eventDate.getDate() === today.getDate() &&
        eventDate.getMonth() === today.getMonth() &&
        eventDate.getFullYear() === today.getFullYear()
      )
    }) ?? []

  const entriesToday = todayEvents.filter((e) => e.direction === 'in').length
  const rejectionsToday = todayEvents.filter((e) => e.result === 'denied').length
  const activeVisitors =
    events?.filter((e) => e.person.type === 'visitor' && e.direction === 'in').length ?? 0
  const pendingParcels = 0 // TODO: Fetch from parcels API

  const kpis = [
    { label: 'Entradas hoy', value: entriesToday, color: 'primary' as const },
    { label: 'Rechazos', value: rejectionsToday, color: 'error' as const },
    { label: 'Visitantes activos', value: activeVisitors, color: 'info' as const },
    { label: 'Paquetes pendientes', value: pendingParcels, color: 'warning' as const },
  ]

  return (
    <Stack spacing={3}>
      <Typography variant="h4" fontWeight={600}>
        Dashboard Guardia
      </Typography>

      {/* KPIs */}
      <Grid container spacing={2}>
        {kpis.map((kpi) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={kpi.label}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {kpi.label}
                </Typography>
                <Typography variant="h4" color={`${kpi.color}.main`}>
                  {kpi.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Acciones Rápidas
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <Button
            variant="contained"
            component={Link}
            to="/guard/access"
            startIcon={<LoginIcon />}
            size="large"
          >
            Control de Acceso
          </Button>
          <Button
            variant="outlined"
            component={Link}
            to="/guard/visitors/new"
            startIcon={<AddIcon />}
            size="large"
          >
            Nuevo Visitante
          </Button>
          <Button
            variant="outlined"
            component={Link}
            to="/guard/parcels"
            startIcon={<LocalShippingIcon />}
            size="large"
          >
            Paquetes
          </Button>
          <Button
            variant="outlined"
            component={Link}
            to="/guard/incidents"
            startIcon={<ReportProblemIcon />}
            size="large"
          >
            Incidentes
          </Button>
        </Stack>
      </Paper>

      {/* Live Feed */}
      <LiveFeed items={events ?? []} title="Actividad en Tiempo Real" maxHeight={500} />

      {eventsLoading && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Cargando eventos...
          </Typography>
        </Box>
      )}
    </Stack>
  )
}
