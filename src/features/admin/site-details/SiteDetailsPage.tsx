import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Paper,
  Tab,
  Tabs,
  Typography,
  Stack,
  Button,
  TextField,
  MenuItem,
  IconButton,
} from '@mui/material'
import {
  useSiteBySlugQuery,
  useUpdateSiteMutation,
  useMembersQuery,
  useInviteMutation,
  useRemoveMemberMutation,
} from '../sites.api'
import type { SitePlan, Site } from '../sites.types'
import DeleteIcon from '@mui/icons-material/Delete'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { InviteDialog } from '../components/InviteDialog'

const PLAN_OPTIONS: SitePlan[] = ['free', 'basic', 'pro', 'enterprise']

export default function SiteDetailsPage() {
  const { slug } = useParams()
  const { data: site } = useSiteBySlugQuery(slug)
  const [tab, setTab] = useState(0)

  if (!site) {
    return <Typography>Site no encontrado.</Typography>
  }

  return (
    <Stack gap={2}>
      <Typography variant="h6">
        {site.name}{' '}
        <Typography component="span" color="text.secondary">
          / {site.slug}
        </Typography>
      </Typography>
      <Paper>
        <Tabs value={tab} onChange={(_e, v) => setTab(v)}>
          <Tab label="Config" />
          <Tab label="Miembros" />
          <Tab label="Billing" />
        </Tabs>
        <Box sx={{ p: 2 }}>
          {tab === 0 && <ConfigTab siteId={site.id} name={site.name} plan={site.plan ?? 'free'} />}
          {tab === 1 && <MembersTab site={site} />}
          {tab === 2 && <BillingTab siteId={site.id} plan={site.plan ?? 'free'} />}
        </Box>
      </Paper>
    </Stack>
  )
}

function ConfigTab({ siteId, name, plan }: { siteId: string; name: string; plan: SitePlan }) {
  const update = useUpdateSiteMutation()
  const [values, setValues] = useState({ name, plan })
  return (
    <Stack gap={2} maxWidth={520}>
      <TextField
        label="Nombre"
        value={values.name}
        onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
      />
      <TextField
        select
        label="Plan"
        value={values.plan}
        onChange={(e) => setValues((v) => ({ ...v, plan: e.target.value as SitePlan }))}
      >
        {PLAN_OPTIONS.map((p) => (
          <MenuItem key={p} value={p}>
            {p}
          </MenuItem>
        ))}
      </TextField>
      <Button
        variant="contained"
        onClick={() => update.mutate({ id: siteId, name: values.name, plan: values.plan })}
        disabled={update.isPending}
      >
        {update.isPending ? 'Guardando…' : 'Guardar cambios'}
      </Button>
    </Stack>
  )
}

function MembersTab({ site }: { site: Site }) {
  const { data: members } = useMembersQuery(site.id)
  const remove = useRemoveMemberMutation()
  const invite = useInviteMutation()
  const [open, setOpen] = useState(false)

  return (
    <Stack gap={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography>Miembros de {site.name}</Typography>
        <Button startIcon={<PersonAddIcon />} variant="contained" onClick={() => setOpen(true)}>
          Invitar
        </Button>
      </Stack>
      <Paper sx={{ p: 2 }}>
        {(members ?? []).length === 0 ? (
          <Typography>No hay miembros aún.</Typography>
        ) : (
          <Stack gap={1}>
            {members?.map((m) => (
              <Stack key={m.id} direction="row" alignItems="center" spacing={2}>
                <Typography sx={{ minWidth: 260 }}>{m.email}</Typography>
                <Typography sx={{ minWidth: 120 }} color="text.secondary">
                  {m.role}
                </Typography>
                <Box sx={{ flex: 1 }} />
                <IconButton
                  aria-label="Eliminar"
                  onClick={() => remove.mutate({ siteId: site.id, memberId: m.id })}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            ))}
          </Stack>
        )}
      </Paper>

      <InviteDialog
        open={open}
        onClose={() => setOpen(false)}
        site={site}
        onSubmit={async (data) => {
          await invite.mutateAsync({ siteId: site.id, ...data })
          setOpen(false)
        }}
        isLoading={invite.isPending}
      />
    </Stack>
  )
}

function BillingTab({ siteId, plan }: { siteId: string; plan: SitePlan }) {
  const update = useUpdateSiteMutation()
  const [nextPlan, setNextPlan] = useState<SitePlan>(plan)
  return (
    <Stack gap={2} maxWidth={520}>
      <Typography variant="body2">
        Plan actual: <b>{plan}</b>
      </Typography>
      <TextField
        select
        label="Cambiar plan"
        value={nextPlan}
        onChange={(e) => setNextPlan(e.target.value as SitePlan)}
      >
        {PLAN_OPTIONS.map((p) => (
          <MenuItem key={p} value={p}>
            {p}
          </MenuItem>
        ))}
      </TextField>
      <Button
        variant="contained"
        onClick={() => update.mutate({ id: siteId, plan: nextPlan })}
        disabled={update.isPending}
      >
        {update.isPending ? 'Actualizando…' : 'Aplicar cambio de plan'}
      </Button>
      <Typography variant="caption" color="text.secondary">
        * En el backend real, esto abrirá un checkout/portal de facturación y aplicará el cambio
        cuando Stripe confirme el pago.
      </Typography>
    </Stack>
  )
}
