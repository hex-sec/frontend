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
  type ChipProps,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import RefreshIcon from '@mui/icons-material/Refresh'
import { useSitesQuery, useCreateSiteMutation, useInviteMutation } from './sites.api'
import { SiteFormDialog } from './components/SiteFormDialog'
import { InviteDialog } from './components/InviteDialog'
import type { Site, SiteStatus } from './sites.types'

const STATUS_CHIP_COLOR: Record<SiteStatus, ChipProps['color']> = {
  active: 'success',
  trial: 'warning',
  suspended: 'default',
}
import { useSiteStore } from '@store/site.store'
import { Link } from 'react-router-dom'
import { useTranslate } from '../../i18n/useTranslate'
import { useI18nStore } from '@store/i18n.store'

export default function SitesPage() {
  const { t } = useTranslate()
  const language = useI18nStore((s) => s.language)
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
        <Typography variant="h6">{t('admin.sitesPage.title', { lng: language })}</Typography>
        <Stack direction="row" spacing={1}>
          <IconButton
            onClick={() => refetch()}
            aria-label={t('admin.sitesPage.actions.refreshAria', { lng: language })}
          >
            <RefreshIcon />
          </IconButton>
          <Button startIcon={<AddIcon />} variant="contained" onClick={() => setOpenCreate(true)}>
            {t('admin.sitesPage.actions.create', { lng: language })}
          </Button>
        </Stack>
      </Stack>

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('admin.sitesPage.table.name', { lng: language })}</TableCell>
              <TableCell>{t('admin.sitesPage.table.slug', { lng: language })}</TableCell>
              <TableCell>{t('admin.sitesPage.table.plan', { lng: language })}</TableCell>
              <TableCell>{t('admin.sitesPage.table.status', { lng: language })}</TableCell>
              <TableCell align="right">
                {t('admin.sitesPage.table.actions', { lng: language })}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5}>
                  {t('admin.sitesPage.state.loading', { lng: language })}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && sites.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  {t('admin.sitesPage.state.empty', { lng: language })}
                </TableCell>
              </TableRow>
            )}
            {sites.map((s) => (
              <TableRow key={s.id} hover selected={current?.id === s.id}>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <MLink component={Link} to={`/admin/sites/${s.slug}`} underline="hover">
                      <Typography fontWeight={600}>{s.name}</Typography>
                    </MLink>
                    {current?.id === s.id && (
                      <Chip
                        size="small"
                        label={t('admin.sitesPage.badges.current', { lng: language })}
                      />
                    )}
                  </Stack>
                </TableCell>
                <TableCell>{s.slug}</TableCell>
                <TableCell>{s.plan ?? '—'}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={t(`admin.sitesPage.statuses.${s.status}`, { lng: language })}
                    color={STATUS_CHIP_COLOR[s.status]}
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" variant="outlined" onClick={() => setCurrent(s)}>
                      {t('admin.sitesPage.actions.setCurrent', { lng: language })}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<PersonAddIcon />}
                      onClick={() => setInviteFor(s)}
                    >
                      {t('admin.sitesPage.actions.invite', { lng: language })}
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
