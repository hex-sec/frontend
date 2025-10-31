import { Paper, Typography, TextField, Stack } from '@mui/material'
import { useState } from 'react'

/**
 * Plate Search Page - Search vehicles by license plate
 * TODO: Implement full search functionality per spec
 */
export default function PlateSearchPage() {
  const [q, setQ] = useState('')
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6">Buscar placas (stub)</Typography>
      <Stack sx={{ mt: 2 }}>
        <TextField
          label="Placa"
          value={q}
          onChange={(e) => setQ(e.target.value.toUpperCase())}
          inputProps={{ style: { fontSize: 24, letterSpacing: 2 } }}
        />
      </Stack>
    </Paper>
  )
}
