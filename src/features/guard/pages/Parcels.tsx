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
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
} from '@mui/material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listParcels, receiveParcel, deliverParcel, notifyParcel } from '../api/parcels.api'
import LocalShipping from '@mui/icons-material/LocalShipping'
import CheckCircle from '@mui/icons-material/CheckCircle'
import Notifications from '@mui/icons-material/Notifications'

/**
 * Parcels Page
 * Receive parcels, notify residents, and deliver with signature/photo
 */
export default function Parcels() {
  const queryClient = useQueryClient()
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false)
  const [receiveForm, setReceiveForm] = useState({
    residentId: '',
    courier: '',
    evidenceReceivedUrl: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['parcels', 'list'],
    queryFn: () => listParcels({ status: 'pending' }),
  })

  const receiveMutation = useMutation({
    mutationFn: receiveParcel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcels'] })
      setReceiveDialogOpen(false)
      setReceiveForm({ residentId: '', courier: '', evidenceReceivedUrl: '' })
    },
  })

  const deliverMutation = useMutation({
    mutationFn: ({ id, evidenceDeliveredUrl }: { id: string; evidenceDeliveredUrl?: string }) =>
      deliverParcel(id, { evidenceDeliveredUrl }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcels'] })
    },
  })

  const notifyMutation = useMutation({
    mutationFn: notifyParcel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcels'] })
    },
  })

  const parcels = data?.items ?? []

  const handleReceive = () => {
    receiveMutation.mutate({
      residentId: receiveForm.residentId,
      courier: receiveForm.courier,
      evidenceReceivedUrl: receiveForm.evidenceReceivedUrl || undefined,
    })
  }

  const handleDeliver = (id: string) => {
    // TODO: Capture signature/photo
    deliverMutation.mutate({ id })
  }

  const handleNotify = (id: string) => {
    notifyMutation.mutate(id)
  }

  const handlePhotoCapture = () => {
    // TODO: Implement camera capture
    alert('Funcionalidad de cámara próximamente')
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
        <Typography variant="h4" fontWeight={600}>
          Paquetes
        </Typography>
        <Button
          variant="contained"
          startIcon={<LocalShipping />}
          onClick={() => setReceiveDialogOpen(true)}
        >
          Recibir Paquete
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Residente</TableCell>
              <TableCell>Mensajería</TableCell>
              <TableCell>Recibido</TableCell>
              <TableCell>Estado</TableCell>
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
            ) : parcels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No hay paquetes pendientes
                </TableCell>
              </TableRow>
            ) : (
              parcels.map((parcel) => (
                <TableRow key={parcel.id} hover>
                  <TableCell>{parcel.residentId}</TableCell>
                  <TableCell>{parcel.courier}</TableCell>
                  <TableCell>{new Date(parcel.receivedAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={parcel.deliveredAt ? 'Entregado' : 'Pendiente'}
                      size="small"
                      color={parcel.deliveredAt ? 'success' : 'warning'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {!parcel.deliveredAt && (
                        <>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleNotify(parcel.id)}
                            disabled={notifyMutation.isPending}
                            title="Notificar residente"
                          >
                            <Notifications fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleDeliver(parcel.id)}
                            disabled={deliverMutation.isPending}
                            title="Entregar"
                          >
                            <CheckCircle fontSize="small" />
                          </IconButton>
                        </>
                      )}
                      {parcel.evidenceReceivedUrl && (
                        <Box
                          component="img"
                          src={parcel.evidenceReceivedUrl}
                          alt="Evidencia recepción"
                          sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1 }}
                        />
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Receive Dialog */}
      <Dialog
        open={receiveDialogOpen}
        onClose={() => setReceiveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Recibir Paquete</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="ID Residente"
              fullWidth
              value={receiveForm.residentId}
              onChange={(e) => setReceiveForm({ ...receiveForm, residentId: e.target.value })}
            />
            <TextField
              label="Mensajería"
              fullWidth
              value={receiveForm.courier}
              onChange={(e) => setReceiveForm({ ...receiveForm, courier: e.target.value })}
            />
            <Button variant="outlined" onClick={handlePhotoCapture}>
              Tomar Foto (opcional)
            </Button>
            {receiveForm.evidenceReceivedUrl && (
              <Box
                component="img"
                src={receiveForm.evidenceReceivedUrl}
                alt="Evidencia"
                sx={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 1 }}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceiveDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleReceive}
            disabled={!receiveForm.residentId || !receiveForm.courier || receiveMutation.isPending}
          >
            Recibir
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
