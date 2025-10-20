import { Typography, Paper, Box } from '@mui/material'

export default function DashboardPage() {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6">Panel de Administración</Typography>
      <Box sx={{ mt: 2 }}>
        <Typography>KPIs, alertas, accesos recientes (stub)</Typography>
      </Box>
    </Paper>
  )
}
