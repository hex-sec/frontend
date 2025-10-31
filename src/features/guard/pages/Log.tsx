import { useState, useMemo } from 'react'
import {
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  MenuItem,
  InputAdornment,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { listAccessEvents } from '../api/access.api'
import SearchIcon from '@mui/icons-material/Search'
import DownloadIcon from '@mui/icons-material/Download'
import type { AccessEvent } from '@features/shared/types/access.types'

/**
 * Log Page
 * Table with filters by date/person/medium/result, optional CSV export
 */
export default function Log() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [personFilter, setPersonFilter] = useState('')
  const [mediumFilter, setMediumFilter] = useState<AccessEvent['medium'] | 'all'>('all')
  const [resultFilter, setResultFilter] = useState<AccessEvent['result'] | 'all'>('all')

  const { data, isLoading } = useQuery({
    queryKey: ['access', 'events', 'log', { dateFrom, dateTo }],
    queryFn: () => listAccessEvents(500), // Get more for log view
  })

  const events = data ?? []

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const eventDate = new Date(event.at)

      // Date filters
      if (dateFrom && eventDate < new Date(dateFrom)) return false
      if (dateTo) {
        const toDate = new Date(dateTo)
        toDate.setHours(23, 59, 59, 999)
        if (eventDate > toDate) return false
      }

      // Person filter
      if (personFilter && !event.person.name.toLowerCase().includes(personFilter.toLowerCase())) {
        return false
      }

      // Medium filter
      if (mediumFilter !== 'all' && event.medium !== mediumFilter) return false

      // Result filter
      if (resultFilter !== 'all' && event.result !== resultFilter) return false

      return true
    })
  }, [events, dateFrom, dateTo, personFilter, mediumFilter, resultFilter])

  const handleExportCSV = () => {
    const headers = ['Fecha', 'Persona', 'Tipo', 'Dirección', 'Medio', 'Resultado', 'Unidad']
    const rows = filteredEvents.map((event) => [
      new Date(event.at).toLocaleString(),
      event.person.name,
      event.person.type,
      event.direction === 'in' ? 'Entrada' : 'Salida',
      event.medium,
      event.result,
      event.person.unit || '',
    ])

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `access_log_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getResultColor = (result: AccessEvent['result']) => {
    return result === 'allowed' ? 'success' : 'error'
  }

  const getMediumLabel = (medium: AccessEvent['medium']) => {
    return medium.toUpperCase()
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
        <Typography variant="h4" fontWeight={600}>
          Registro de Acceso
        </Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportCSV}
          disabled={filteredEvents.length === 0}
        >
          Exportar CSV
        </Button>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Desde"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Hasta"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Buscar persona"
              value={personFilter}
              onChange={(e) => setPersonFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              label="Medio"
              value={mediumFilter}
              onChange={(e) => setMediumFilter(e.target.value as AccessEvent['medium'] | 'all')}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="qr">QR</MenuItem>
              <MenuItem value="rfid">RFID</MenuItem>
              <MenuItem value="plate">Placa</MenuItem>
              <MenuItem value="manual">Manual</MenuItem>
            </TextField>
            <TextField
              select
              label="Resultado"
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value as AccessEvent['result'] | 'all')}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="allowed">Permitido</MenuItem>
              <MenuItem value="denied">Denegado</MenuItem>
            </TextField>
          </Stack>
        </Stack>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Persona</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Dirección</TableCell>
              <TableCell>Medio</TableCell>
              <TableCell>Resultado</TableCell>
              <TableCell>Unidad</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : filteredEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No hay eventos que coincidan con los filtros
                </TableCell>
              </TableRow>
            ) : (
              filteredEvents.map((event) => (
                <TableRow key={event.id} hover>
                  <TableCell>{new Date(event.at).toLocaleString()}</TableCell>
                  <TableCell>{event.person.name}</TableCell>
                  <TableCell>
                    <Chip label={event.person.type} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{event.direction === 'in' ? 'Entrada' : 'Salida'}</TableCell>
                  <TableCell>{getMediumLabel(event.medium)}</TableCell>
                  <TableCell>
                    <Chip label={event.result} size="small" color={getResultColor(event.result)} />
                  </TableCell>
                  <TableCell>{event.person.unit || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box>
        <Typography variant="caption" color="text.secondary">
          Mostrando {filteredEvents.length} de {events.length} eventos
        </Typography>
      </Box>
    </Stack>
  )
}
