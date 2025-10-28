import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Paper,
  Stack,
  Typography,
  IconButton,
  type ChipProps,
  Grid2 as Grid,
  TextField,
  InputAdornment,
  Box,
  Chip,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  useMediaQuery,
  useTheme,
  Collapse,
  Tooltip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RefreshIcon from '@mui/icons-material/Refresh'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import ClearIcon from '@mui/icons-material/Clear'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useSiteStore } from '@store/site.store'
import { useNavigate } from 'react-router-dom'
import { useTranslate } from '../../i18n/useTranslate'
import { useI18nStore } from '@store/i18n.store'
import SiteCard from './components/SiteCard'
import PageHeader from './components/PageHeader'
import { useSitesQuery, useCreateSiteMutation, useInviteMutation } from './sites.api'
import { SiteFormDialog } from './components/SiteFormDialog'
import { InviteDialog } from './components/InviteDialog'
import type { Site, SiteStatus, SitePlan } from './sites.types'

type SiteFilters = {
  search: string
  status: SiteStatus | 'all'
  plan: SitePlan | 'all'
  admin: string
}

const DEFAULT_FILTERS: SiteFilters = {
  search: '',
  status: 'all',
  plan: 'all',
  admin: '',
}

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
  const [filters, setFilters] = useState<SiteFilters>(DEFAULT_FILTERS)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const { current, setCurrent, hydrate } = useSiteStore()
  useEffect(() => {
    hydrate()
  }, [hydrate])

  // Get all admins from site members data (mock implementation)
  const siteAdmins = useMemo(() => {
    // In real implementation, this would come from the API
    // For now, using mock admin names similar to ModeSwitchDialog
    const mockAdmins = [
      'Sarah Johnson',
      'Mike Chen',
      'Elena Rodriguez',
      'David Park',
      'Anna Williams',
    ]
    return mockAdmins
  }, [])

  // Filter sites based on search criteria
  const filteredSites = useMemo(() => {
    if (!data) return []

    return data.filter((site) => {
      // Search by name or slug
      if (
        filters.search &&
        !site.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !site.slug.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false
      }

      // Filter by status
      if (filters.status !== 'all' && site.status !== filters.status) {
        return false
      }

      // Filter by plan
      if (filters.plan !== 'all' && site.plan !== filters.plan) {
        return false
      }

      // Filter by admin (simplified - in real app would check site members)
      if (
        filters.admin &&
        !siteAdmins.some((admin) => admin.toLowerCase().includes(filters.admin.toLowerCase()))
      ) {
        return false
      }

      return true
    })
  }, [data, filters, siteAdmins])

  const sites = filteredSites
  const navigate = useNavigate()
  const actionsLabel = t('admin.sitesPage.sections.actions', {
    lng: language,
    defaultValue: 'Actions',
  })

  // Handle filter updates
  const updateFilter = <K extends keyof SiteFilters>(key: K, value: SiteFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS)
    setShowAdvancedFilters(false)
  }

  const hasActiveFilters =
    filters.search || filters.status !== 'all' || filters.plan !== 'all' || filters.admin

  // Count active filters for display
  const activeFilterCount = [
    filters.search,
    filters.status !== 'all' ? filters.status : null,
    filters.plan !== 'all' ? filters.plan : null,
    filters.admin,
  ].filter(Boolean).length

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

      {/* Search and Filter Bar */}
      <Paper sx={{ mx: { xs: 1.5, sm: 2 }, mt: 2, p: 2 }}>
        <Stack spacing={2}>
          {/* Main Search Bar */}
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder={t('admin.sitesPage.search.placeholder', {
                lng: language,
                defaultValue: 'Search sites by name or slug...',
              })}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: filters.search && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => updateFilter('search', '')}
                      aria-label={t('common.clear', { lng: language, defaultValue: 'Clear' })}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Filter Toggle Button */}
            <Button
              variant={hasActiveFilters ? 'contained' : 'outlined'}
              startIcon={<FilterListIcon />}
              endIcon={showAdvancedFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              sx={{ minWidth: 'fit-content', whiteSpace: 'nowrap' }}
            >
              {t('admin.sitesPage.search.filters', { lng: language, defaultValue: 'Filters' })}
              {activeFilterCount > 0 && (
                <Chip
                  size="small"
                  label={activeFilterCount}
                  color="primary"
                  sx={{ ml: 1, height: 18, fontSize: '0.625rem' }}
                />
              )}
            </Button>
          </Stack>

          {/* Advanced Filters */}
          <Collapse in={showAdvancedFilters}>
            <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Stack
                direction={isMobile ? 'column' : 'row'}
                spacing={2}
                alignItems={isMobile ? 'stretch' : 'center'}
              >
                {/* Status Filter */}
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>
                    {t('admin.sitesPage.search.status', { lng: language, defaultValue: 'Status' })}
                  </InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => updateFilter('status', e.target.value as SiteStatus | 'all')}
                    label={t('admin.sitesPage.search.status', {
                      lng: language,
                      defaultValue: 'Status',
                    })}
                  >
                    <MenuItem value="all">
                      {t('admin.sitesPage.search.allStatuses', {
                        lng: language,
                        defaultValue: 'All Statuses',
                      })}
                    </MenuItem>
                    <MenuItem value="active">
                      {t('admin.sitesPage.statuses.active', {
                        lng: language,
                        defaultValue: 'Active',
                      })}
                    </MenuItem>
                    <MenuItem value="trial">
                      {t('admin.sitesPage.statuses.trial', {
                        lng: language,
                        defaultValue: 'Trial',
                      })}
                    </MenuItem>
                    <MenuItem value="suspended">
                      {t('admin.sitesPage.statuses.suspended', {
                        lng: language,
                        defaultValue: 'Suspended',
                      })}
                    </MenuItem>
                  </Select>
                </FormControl>

                {/* Plan Filter */}
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>
                    {t('admin.sitesPage.search.plan', { lng: language, defaultValue: 'Plan' })}
                  </InputLabel>
                  <Select
                    value={filters.plan}
                    onChange={(e) => updateFilter('plan', e.target.value as SitePlan | 'all')}
                    label={t('admin.sitesPage.search.plan', {
                      lng: language,
                      defaultValue: 'Plan',
                    })}
                  >
                    <MenuItem value="all">
                      {t('admin.sitesPage.search.allPlans', {
                        lng: language,
                        defaultValue: 'All Plans',
                      })}
                    </MenuItem>
                    <MenuItem value="free">
                      {t('admin.sitesPage.plans.free', { lng: language, defaultValue: 'Free' })}
                    </MenuItem>
                    <MenuItem value="basic">
                      {t('admin.sitesPage.plans.basic', { lng: language, defaultValue: 'Basic' })}
                    </MenuItem>
                    <MenuItem value="pro">
                      {t('admin.sitesPage.plans.pro', { lng: language, defaultValue: 'Pro' })}
                    </MenuItem>
                    <MenuItem value="enterprise">
                      {t('admin.sitesPage.plans.enterprise', {
                        lng: language,
                        defaultValue: 'Enterprise',
                      })}
                    </MenuItem>
                  </Select>
                </FormControl>

                {/* Admin Filter */}
                <TextField
                  value={filters.admin}
                  onChange={(e) => updateFilter('admin', e.target.value)}
                  placeholder={t('admin.sitesPage.search.adminPlaceholder', {
                    lng: language,
                    defaultValue: 'Filter by admin name...',
                  })}
                  size="small"
                  sx={{ minWidth: 200 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <Tooltip
                    title={t('admin.sitesPage.search.clearFilters', {
                      lng: language,
                      defaultValue: 'Clear all filters',
                    })}
                  >
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={clearFilters}
                      startIcon={<ClearIcon />}
                      sx={{ minWidth: 'fit-content' }}
                    >
                      {t('common.clear', { lng: language, defaultValue: 'Clear' })}
                    </Button>
                  </Tooltip>
                )}
              </Stack>
            </Box>
          </Collapse>
        </Stack>
      </Paper>

      {/* Results Summary */}
      {hasActiveFilters && (
        <Box sx={{ mx: { xs: 1.5, sm: 2 }, mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {t('admin.sitesPage.search.resultsCount', {
              lng: language,
              defaultValue: 'Showing {count} of {total} sites',
              count: sites.length,
              total: data?.length || 0,
            })}
          </Typography>
        </Box>
      )}
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
