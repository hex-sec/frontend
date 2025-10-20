import { Paper, Typography, Button, Stack } from '@mui/material'
import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6">Portal de Residente</Typography>
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button variant="contained" component={Link} to="/app">
          Inicio
        </Button>
        <Button variant="outlined">Mis visitas (stub)</Button>
      </Stack>
    </Paper>
  )
}
