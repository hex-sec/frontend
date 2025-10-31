import { useState } from 'react'
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Box,
} from '@mui/material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listIncidents, createIncident } from '../api/incidents.api'
import ReportProblemIcon from '@mui/icons-material/ReportProblem'
import type { IncidentReport } from '@features/shared/types/access.types'

/**
 * Incidents Page
 * Create incident reports and view with filters
 */
export default function Incidents() {
  const queryClient = useQueryClient()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState<IncidentReport['type'] | 'all'>('all')
  const [incidentForm, setIncidentForm] = useState({
    type: 'security' as IncidentReport['type'],
    description: '',
    mediaUrls: [] as string[],
  })

  const { data, isLoading } = useQuery({
    queryKey: ['incidents', 'list', { typeFilter }],
    queryFn: () => listIncidents({ type: typeFilter !== 'all' ? typeFilter : undefined }),
  })

  const createMutation = useMutation({
    mutationFn: createIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
      setCreateDialogOpen(false)
      setIncidentForm({ type: 'security', description: '', mediaUrls: [] })
    },
  })

  const incidents = data?.items ?? []

  const filteredIncidents =
    typeFilter === 'all' ? incidents : incidents.filter((i) => i.type === typeFilter)

  const handleCreate = () => {
    createMutation.mutate({
      type: incidentForm.type,
      description: incidentForm.description,
      mediaUrls: incidentForm.mediaUrls.length > 0 ? incidentForm.mediaUrls : undefined,
    })
  }

  const handleAddMedia = () => {
    // TODO: Implement media upload
    alert('Funcionalidad de adjuntos próximamente')
  }

  const getTypeColor = (type: IncidentReport['type']) => {
    switch (type) {
      case 'security':
        return 'error'
      case 'medical':
        return 'warning'
      case 'damage':
        return 'info'
      default:
        return 'default'
    }
  }

  const getTypeLabel = (type: IncidentReport['type']) => {
    switch (type) {
      case 'security':
        return 'Seguridad'
      case 'medical':
        return 'Médico'
      case 'damage':
        return 'Daño'
      default:
        return 'Otro'
    }
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
        <Typography variant="h4" fontWeight={600}>
          Incidentes
        </Typography>
        <Button
          variant="contained"
          startIcon={<ReportProblemIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Nuevo Incidente
        </Button>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            label="Todos"
            onClick={() => setTypeFilter('all')}
            color={typeFilter === 'all' ? 'primary' : 'default'}
            variant={typeFilter === 'all' ? 'filled' : 'outlined'}
          />
          <Chip
            label="Seguridad"
            onClick={() => setTypeFilter('security')}
            color={typeFilter === 'security' ? 'primary' : 'default'}
            variant={typeFilter === 'security' ? 'filled' : 'outlined'}
          />
          <Chip
            label="Médico"
            onClick={() => setTypeFilter('medical')}
            color={typeFilter === 'medical' ? 'primary' : 'default'}
            variant={typeFilter === 'medical' ? 'filled' : 'outlined'}
          />
          <Chip
            label="Daño"
            onClick={() => setTypeFilter('damage')}
            color={typeFilter === 'damage' ? 'primary' : 'default'}
            variant={typeFilter === 'damage' ? 'filled' : 'outlined'}
          />
          <Chip
            label="Otro"
            onClick={() => setTypeFilter('other')}
            color={typeFilter === 'other' ? 'primary' : 'default'}
            variant={typeFilter === 'other' ? 'filled' : 'outlined'}
          />
        </Stack>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tipo</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Adjuntos</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : filteredIncidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No hay incidentes
                </TableCell>
              </TableRow>
            ) : (
              filteredIncidents.map((incident) => (
                <TableRow key={incident.id} hover>
                  <TableCell>
                    <Chip
                      label={getTypeLabel(incident.type)}
                      size="small"
                      color={getTypeColor(incident.type)}
                    />
                  </TableCell>
                  <TableCell>{incident.description}</TableCell>
                  <TableCell>{new Date(incident.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{incident.mediaUrls?.length || 0} archivos</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Nuevo Incidente</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Tipo"
              fullWidth
              value={incidentForm.type}
              onChange={(e) =>
                setIncidentForm({ ...incidentForm, type: e.target.value as IncidentReport['type'] })
              }
            >
              <MenuItem value="security">Seguridad</MenuItem>
              <MenuItem value="medical">Médico</MenuItem>
              <MenuItem value="damage">Daño</MenuItem>
              <MenuItem value="other">Otro</MenuItem>
            </TextField>
            <TextField
              label="Descripción"
              fullWidth
              multiline
              rows={4}
              value={incidentForm.description}
              onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
            />
            <Button variant="outlined" onClick={handleAddMedia}>
              Agregar Adjuntos (opcional)
            </Button>
            {incidentForm.mediaUrls.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {incidentForm.mediaUrls.length} archivo(s) adjunto(s)
                </Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!incidentForm.description.trim() || createMutation.isPending}
          >
            Crear
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
