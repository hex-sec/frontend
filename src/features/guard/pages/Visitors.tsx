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
  IconButton,
  Chip,
  InputAdornment,
} from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityIcon from '@mui/icons-material/Visibility'
import BlockIcon from '@mui/icons-material/Block'
import RefreshIcon from '@mui/icons-material/Refresh'
import AddIcon from '@mui/icons-material/Add'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listVisitors, revokeVisitor, renewVisitor } from '../api/visitors.api'
import type { VisitorPass } from '@features/shared/types/access.types'

/**
 * Visitors List Page
 * Search and filter visitors, with actions to view, revoke, or renew
 */
export default function Visitors() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<VisitorPass['status'] | 'all'>('all')

  const { data, isLoading } = useQuery({
    queryKey: ['visitors', 'list', { searchQuery, statusFilter }],
    queryFn: () =>
      listVisitors({
        name: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      }),
  })

  const revokeMutation = useMutation({
    mutationFn: revokeVisitor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] })
    },
  })

  const renewMutation = useMutation({
    mutationFn: ({ id, validUntil }: { id: string; validUntil: string }) =>
      renewVisitor(id, validUntil),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] })
    },
  })

  const visitors = data?.items ?? []

  const filteredVisitors = useMemo(() => {
    if (!searchQuery && statusFilter === 'all') return visitors
    return visitors.filter((v) => {
      const matchesSearch =
        !searchQuery ||
        v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.hostResidentId.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || v.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [visitors, searchQuery, statusFilter])

  const handleRevoke = (id: string) => {
    if (window.confirm('¿Está seguro de que desea revocar este pase?')) {
      revokeMutation.mutate(id)
    }
  }

  const handleRenew = (id: string) => {
    const newDate = new Date()
    newDate.setDate(newDate.getDate() + 7) // Extend 7 days
    if (window.confirm('¿Renovar este pase por 7 días más?')) {
      renewMutation.mutate({ id, validUntil: newDate.toISOString() })
    }
  }

  const getStatusColor = (status: VisitorPass['status']) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'used':
        return 'default'
      case 'revoked':
        return 'error'
      case 'expired':
        return 'warning'
      default:
        return 'default'
    }
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
        <Typography variant="h4" fontWeight={600}>
          Visitantes
        </Typography>
        <Button
          variant="contained"
          component={Link}
          to="/guard/visitors/new"
          startIcon={<AddIcon />}
        >
          Nueva Visita
        </Button>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <TextField
              placeholder="Buscar por código o anfitrión..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
              }}
              startIcon={<RefreshIcon />}
            >
              Limpiar
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label="Todos"
              onClick={() => setStatusFilter('all')}
              color={statusFilter === 'all' ? 'primary' : 'default'}
              variant={statusFilter === 'all' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Activos"
              onClick={() => setStatusFilter('active')}
              color={statusFilter === 'active' ? 'primary' : 'default'}
              variant={statusFilter === 'active' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Usados"
              onClick={() => setStatusFilter('used')}
              color={statusFilter === 'used' ? 'primary' : 'default'}
              variant={statusFilter === 'used' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Revocados"
              onClick={() => setStatusFilter('revoked')}
              color={statusFilter === 'revoked' ? 'primary' : 'default'}
              variant={statusFilter === 'revoked' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Expirados"
              onClick={() => setStatusFilter('expired')}
              color={statusFilter === 'expired' ? 'primary' : 'default'}
              variant={statusFilter === 'expired' ? 'filled' : 'outlined'}
            />
          </Stack>
        </Stack>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Anfitrión</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Válido hasta</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : filteredVisitors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No hay visitantes
                </TableCell>
              </TableRow>
            ) : (
              filteredVisitors.map((visitor) => (
                <TableRow key={visitor.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {visitor.code}
                    </Typography>
                  </TableCell>
                  <TableCell>{visitor.hostResidentId}</TableCell>
                  <TableCell>
                    <Chip
                      label={visitor.status}
                      size="small"
                      color={getStatusColor(visitor.status)}
                    />
                  </TableCell>
                  <TableCell>{new Date(visitor.validUntil).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/guard/visitors/${visitor.id}`)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      {visitor.status === 'active' && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => handleRenew(visitor.id)}
                            disabled={renewMutation.isPending}
                          >
                            <RefreshIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRevoke(visitor.id)}
                            disabled={revokeMutation.isPending}
                          >
                            <BlockIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  )
}
