import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Paper,
  Stack,
  Typography,
  IconButton,
  type ChipProps,
  Grid2 as Grid,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RefreshIcon from '@mui/icons-material/Refresh'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useSiteStore } from '@store/site.store'
import { useNavigate } from 'react-router-dom'
import { useTranslate } from '../../i18n/useTranslate'
import { useI18nStore } from '@store/i18n.store'
import SiteCard from './components/SiteCard'
import PageHeader from './components/PageHeader'
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
  const navigate = useNavigate()
  const actionsLabel = t('admin.sitesPage.sections.actions', {
    lng: language,
    defaultValue: 'Actions',
  })

  // Mobile back button component
  const mobileBackButton = (
    <IconButton
      size="small"
      edge="start"
      onClick={() => navigate(-1)}
      aria-label={t('common.back', { lng: language, defaultValue: 'Back' })}
    >
      <ArrowBackIcon />
    </IconButton>
  )

  // Desktop action buttons
  const rightActions = (
    <Stack direction="row" spacing={1} alignItems="center">
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
  )

  // Mobile action buttons - inline with title
  const mobileActionButtons = (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <IconButton
        size="small"
        onClick={() => refetch()}
        aria-label={t('admin.sitesPage.actions.refreshAria', { lng: language })}
      >
        <RefreshIcon />
      </IconButton>
      <IconButton
        size="small"
        color="primary"
        onClick={() => setOpenCreate(true)}
        aria-label={t('admin.sitesPage.actions.create', { lng: language })}
      >
        <AddIcon />
      </IconButton>
    </Stack>
  )

  return (
    <Stack>
      <PageHeader
        title={t('admin.sitesPage.title', { lng: language })}
        subtitle={t('admin.sitesPage.subtitle', {
          lng: language,
          defaultValue: 'Manage all your sites and their configurations',
        })}
        rightActions={rightActions}
        mobileBackButton={mobileBackButton}
        mobileActions={mobileActionButtons}
      />
      {isLoading ? (
        <Paper sx={{ p: 2, mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {t('admin.sitesPage.state.loading', { lng: language })}
          </Typography>
        </Paper>
      ) : null}

      {!isLoading && sites.length === 0 ? (
        <Paper sx={{ p: 2, mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {t('admin.sitesPage.state.empty', { lng: language })}
          </Typography>
        </Paper>
      ) : null}

      <Grid container spacing={2} sx={{ mt: 1, px: { xs: 1.5, sm: 2 }, py: { xs: 1.5, sm: 2 } }}>
        {sites.map((site) => {
          const isCurrent = current?.id === site.id
          return (
            <Grid key={site.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
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
