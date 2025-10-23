import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Paper,
  Stack,
  Typography,
  IconButton,
  type ChipProps,
  useTheme,
  useMediaQuery,
  Grid,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RefreshIcon from '@mui/icons-material/Refresh'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useSiteStore } from '@store/site.store'
import { useNavigate } from 'react-router-dom'
import { useTranslate } from '../../i18n/useTranslate'
import { useI18nStore } from '@store/i18n.store'
import SiteCard from './components/SiteCard'
import { useSitesQuery, useCreateSiteMutation, useInviteMutation } from './sites.api'
import { SiteFormDialog } from './components/SiteFormDialog'
import { InviteDialog } from './components/InviteDialog'
import type { Site, SiteStatus } from './sites.types'

const STATUS_CHIP_COLOR: Record<SiteStatus, ChipProps['color']> = {
  active: 'success',
  trial: 'warning',
  suspended: 'default',
}

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
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const navigate = useNavigate()
  const actionsLabel = t('admin.sitesPage.sections.actions', {
    lng: language,
    defaultValue: 'Acciones',
  })

  return (
    <Stack gap={2}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
        flexWrap="wrap"
      >
        <Stack direction="row" spacing={1} alignItems="center">
          {isMobile ? (
            <IconButton
              edge="start"
              onClick={() => navigate(-1)}
              aria-label={t('common.back', { lng: language, defaultValue: 'Back' })}
            >
              <ArrowBackIcon />
            </IconButton>
          ) : null}
          <Typography variant={isMobile ? 'h6' : 'h5'}>
            {t('admin.sitesPage.title', { lng: language })}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={isMobile ? 0.5 : 1} alignItems="center">
          <IconButton
            onClick={() => refetch()}
            aria-label={t('admin.sitesPage.actions.refreshAria', { lng: language })}
          >
            <RefreshIcon />
          </IconButton>
          {isMobile ? (
            <IconButton
              color="primary"
              onClick={() => setOpenCreate(true)}
              aria-label={t('admin.sitesPage.actions.create', { lng: language })}
            >
              <AddIcon />
            </IconButton>
          ) : (
            <Button startIcon={<AddIcon />} variant="contained" onClick={() => setOpenCreate(true)}>
              {t('admin.sitesPage.actions.create', { lng: language })}
            </Button>
          )}
        </Stack>
      </Stack>
      {isLoading ? (
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {t('admin.sitesPage.state.loading', { lng: language })}
          </Typography>
        </Paper>
      ) : null}

      {!isLoading && sites.length === 0 ? (
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {t('admin.sitesPage.state.empty', { lng: language })}
          </Typography>
        </Paper>
      ) : null}

      <Grid container spacing={2} columns={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
        {sites.map((site) => {
          const isCurrent = current?.id === site.id
          return (
            <Grid item key={site.id} xs={12} sm={6} md={6} lg={4} xl={3}>
              <SiteCard
                name={site.name}
                href={`/admin/sites/${site.slug}`}
                statusLabel={t(`admin.sitesPage.statuses.${site.status}`, { lng: language })}
                statusColor={STATUS_CHIP_COLOR[site.status] ?? 'default'}
                isCurrent={isCurrent}
                currentLabel={t('admin.sitesPage.badges.current', { lng: language })}
                details={[
                  {
                    label: t('admin.sitesPage.table.plan', { lng: language }),
                    value: site.plan ?? '—',
                  },
                  {
                    label: t('admin.sitesPage.table.slug', { lng: language }),
                    value: site.slug,
                  },
                ]}
                actionsLabel={actionsLabel}
                inviteLabel={t('admin.sitesPage.actions.invite', { lng: language })}
                setCurrentLabel={t('admin.sitesPage.actions.setCurrent', { lng: language })}
                viewLabel={t('admin.sitesPage.actions.viewDetails', {
                  lng: language,
                  defaultValue: 'Ver detalles',
                })}
                onInvite={() => setInviteFor(site)}
                onSetCurrent={() => setCurrent(site)}
              />
            </Grid>
          )
        })}
      </Grid>

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
