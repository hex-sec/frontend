import { Paper, Typography, Stack, Button } from '@mui/material'
import { Link } from 'react-router-dom'

export default function GateKiosk() {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6">Escaneo de QR (stub)</Typography>
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button variant="contained">Abrir cámara</Button>
        <Button component={Link} to="/guard/plates" variant="outlined">
          Buscar placas
        </Button>
      </Stack>
    </Paper>
  )
}
