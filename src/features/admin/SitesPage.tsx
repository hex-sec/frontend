import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Paper,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Link as MLink,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import RefreshIcon from '@mui/icons-material/Refresh'
import { useSitesQuery, useCreateSiteMutation, useInviteMutation } from './sites.api'
import { SiteFormDialog } from './components/SiteFormDialog'
import { InviteDialog } from './components/InviteDialog'
import type { Site } from './sites.types'
import { useSiteStore } from '@store/site.store'
import { Link } from 'react-router-dom'

export default function SitesPage() {
  const { data, isLoading, refetch } = useSitesQuery()
  const createSite = useCreateSiteMutation()
  const invite = useInviteMutation()

  const [openCreate, setOpenCreate] = useState(false)
  const [inviteFor, setInviteFor] = useState<Site | null>(null)

  const { current, setCurrent, hydrate } = useSiteStore()
  useEffect(() => {
    hydrate()
  }, [hydrate])

  const sites = useMemo(() => data ?? [], [data])

  return (
    <Stack gap={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">Sites</Typography>
        <Stack direction="row" spacing={1}>
          <IconButton onClick={() => refetch()} aria-label="Refrescar">
            <RefreshIcon />
          </IconButton>
          <Button startIcon={<AddIcon />} variant="contained" onClick={() => setOpenCreate(true)}>
            Crear Site
          </Button>
        </Stack>
      </Stack>

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5}>Cargando…</TableCell>
              </TableRow>
            )}
            {!isLoading && sites.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>Sin sites aún</TableCell>
              </TableRow>
            )}
            {sites.map((s) => (
              <TableRow key={s.id} hover selected={current?.id === s.id}>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <MLink component={Link} to={`/admin/sites/${s.slug}`} underline="hover">
                      <Typography fontWeight={600}>{s.name}</Typography>
                    </MLink>
                    {current?.id === s.id && <Chip size="small" label="Actual" />}
                  </Stack>
                </TableCell>
                <TableCell>{s.slug}</TableCell>
                <TableCell>{s.plan ?? '—'}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={s.status}
                    color={s.status === 'active' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" variant="outlined" onClick={() => setCurrent(s)}>
                      Establecer actual
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<PersonAddIcon />}
                      onClick={() => setInviteFor(s)}
                    >
                      Invitar usuario
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <SiteFormDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={async (values) => {
          await createSite.mutateAsync(values)
          setOpenCreate(false)
        }}
        isLoading={createSite.isPending}
      />

      <InviteDialog
        open={!!inviteFor}
        site={inviteFor ?? undefined}
        onClose={() => setInviteFor(null)}
        onSubmit={async (values) => {
          if (!inviteFor) return
          await invite.mutateAsync({ siteId: inviteFor.id, ...values })
          setInviteFor(null)
        }}
        isLoading={invite.isPending}
      />
    </Stack>
  )
}
