import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react'
import { Link as RouterLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  ListItemIcon,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import SearchIcon from '@mui/icons-material/Search'
import ShieldIcon from '@mui/icons-material/Shield'
import DomainIcon from '@mui/icons-material/Domain'
import EmailIcon from '@mui/icons-material/Email'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import VisibilityIcon from '@mui/icons-material/Visibility'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useSiteStore } from '@store/site.store'
import { useSiteBackNavigation } from '@app/layout/useSiteBackNavigation'
import type { ColumnDefinition } from '../../components/table/useColumnPreferences'
import { ConfigurableTable } from '@features/search/table/ConfigurableTable'
import { useTranslate } from '../../i18n/useTranslate'
import PageHeader from './components/PageHeader'
import {
  PATH_ROLE_SEGMENT_MAP,
  ROLE_LABEL,
  ROLE_VIEW_META,
  STATUS_COLOR,
  USERS,
  type RoleFilter,
  type RoleKey,
  type UserRecord,
  parseRoleFilter,
} from '@features/admin/users/userData'
import { useLastActiveFormatter } from '@features/admin/users/useLastActiveFormatter'
// import buildEntityUrl from '@app/utils/contextPaths'
import { useI18nStore } from '@store/i18n.store'

const ROLE_META_KEYS: Record<RoleFilter, string> = {
  all: 'usersPage.meta.all',
  admin: 'usersPage.meta.admin',
  guard: 'usersPage.meta.guard',
  resident: 'usersPage.meta.resident',
}

type LocalizedRoleViewMeta = {
  title: string
  description: string
  inviteCta: string
  inviteCtaForSite: (siteName: string) => string
  emptyTitle: string
  emptyDescription: string
  siteHint: (siteName: string) => string
}

/**
 * Renders the admin users management page with role and site filters synchronized to the URL.
 * Flow: hydrates site data on mount, derives filter state from navigation params, builds a filtered user dataset, and renders table actions with contextual menus.
 *
 * @returns {JSX.Element} Users roster view for administrators and site operators.
 */
export default function UsersPage(): JSX.Element {
  const { t } = useTranslate()
  const language = useI18nStore((state) => state.language)
  const formatLastActive = useLastActiveFormatter()
  const { sites, hydrate } = useSiteStore()
  const location = useLocation()
  const navigate = useNavigate()
  const params = useParams<{ slug?: string }>()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [search, setSearch] = useState('')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [statusAnchor, setStatusAnchor] = useState<null | HTMLElement>(null)

  const { activeSite, slug: derivedSiteSlug } = useSiteBackNavigation()
  const isSiteContext = Boolean(derivedSiteSlug)
  const lockedRoleFilter = useMemo<RoleKey | null>(() => {
    const segments = location.pathname.split('/').filter(Boolean)
    const last = segments[segments.length - 1]
    return PATH_ROLE_SEGMENT_MAP[last] ?? null
  }, [location.pathname])
  const pathLockedSiteSlug = params.slug ?? null
  const lockedSiteFilter = derivedSiteSlug ?? pathLockedSiteSlug
  const [roleFilter, setRoleFilterState] = useState<RoleFilter>(() => {
    if (lockedRoleFilter) return lockedRoleFilter
    const params = new URLSearchParams(location.search)
    return parseRoleFilter(params.get('role'))
  })
  const [siteFilter, setSiteFilterState] = useState<string>(() => {
    if (lockedSiteFilter) return lockedSiteFilter
    const params = new URLSearchParams(location.search)
    const slug = params.get('site')
    return slug && slug !== 'all' ? slug : 'all'
  })
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>(
    'all',
  )

  useEffect(() => {
    if (sites.length === 0) {
      hydrate()
    }
  }, [hydrate, sites.length])

  useEffect(() => {
    if (lockedRoleFilter) {
      setRoleFilterState((prev) => (prev === lockedRoleFilter ? prev : lockedRoleFilter))
      setAnchorEl(null)
      return
    }
    const params = new URLSearchParams(location.search)
    const next = parseRoleFilter(params.get('role'))
    setRoleFilterState((prev) => (prev === next ? prev : next))
  }, [lockedRoleFilter, location.search])

  useEffect(() => {
    if (lockedSiteFilter) {
      setSiteFilterState((prev) => (prev === lockedSiteFilter ? prev : lockedSiteFilter))
      return
    }
    const params = new URLSearchParams(location.search)
    const slug = params.get('site')
    const next = slug && slug !== 'all' ? slug : 'all'
    setSiteFilterState((prev) => (prev === next ? prev : next))
  }, [lockedSiteFilter, location.search])

  const setRoleFilter = useCallback(
    (value: RoleFilter) => {
      if (lockedRoleFilter) return
      setRoleFilterState(value)
      const params = new URLSearchParams(location.search)
      if (value === 'all') {
        params.delete('role')
      } else {
        params.set('role', value)
      }
      const searchValue = params.toString()
      navigate(
        { pathname: location.pathname, search: searchValue ? `?${searchValue}` : '' },
        { replace: true },
      )
    },
    [lockedRoleFilter, location.pathname, location.search, navigate],
  )

  const setSiteFilter = useCallback(
    (value: string) => {
      if (lockedSiteFilter) return
      setSiteFilterState(value)
      const params = new URLSearchParams(location.search)
      if (!value || value === 'all') {
        params.delete('site')
      } else {
        params.set('site', value)
      }
      const searchValue = params.toString()
      navigate(
        { pathname: location.pathname, search: searchValue ? `?${searchValue}` : '' },
        { replace: true },
      )
    },
    [lockedSiteFilter, location.pathname, location.search, navigate],
  )

  const effectiveFilter: RoleFilter = (lockedRoleFilter ?? roleFilter) as RoleFilter

  const filterLabels = useMemo<Record<RoleFilter, string>>(
    () => ({
      all: t('usersPage.filters.all', { lng: language, defaultValue: 'All roles' }),
      admin: t('usersPage.filters.admin', {
        lng: language,
        defaultValue: ROLE_LABEL.admin,
      }),
      guard: t('usersPage.filters.guard', {
        lng: language,
        defaultValue: ROLE_LABEL.guard,
      }),
      resident: t('usersPage.filters.resident', {
        lng: language,
        defaultValue: ROLE_LABEL.resident,
      }),
    }),
    [language, t],
  )

  const roleChipLabels = useMemo<Record<RoleKey, string>>(
    () => ({
      admin: t('usersPage.roleLabels.admin', {
        lng: language,
        defaultValue: ROLE_LABEL.admin,
      }),
      guard: t('usersPage.roleLabels.guard', {
        lng: language,
        defaultValue: ROLE_LABEL.guard,
      }),
      resident: t('usersPage.roleLabels.resident', {
        lng: language,
        defaultValue: ROLE_LABEL.resident,
      }),
    }),
    [language, t],
  )

  const statusLabels = useMemo(
    () => ({
      active: t('usersPage.status.active', { lng: language, defaultValue: 'Active' }),
      pending: t('usersPage.status.pending', { lng: language, defaultValue: 'Invited' }),
      suspended: t('usersPage.status.suspended', {
        lng: language,
        defaultValue: 'Suspended',
      }),
    }),
    [language, t],
  )

  const activeMeta = useMemo<LocalizedRoleViewMeta>(() => {
    const base = ROLE_VIEW_META[effectiveFilter]
    const metaKey = ROLE_META_KEYS[effectiveFilter]
    return {
      title: t(`${metaKey}.title`, { lng: language, defaultValue: base.title }),
      description: t(`${metaKey}.description`, { lng: language, defaultValue: base.description }),
      inviteCta: t(`${metaKey}.inviteCta`, { lng: language, defaultValue: base.inviteCta }),
      inviteCtaForSite: (siteName: string) =>
        t(`${metaKey}.inviteCtaForSite`, {
          lng: language,
          siteName,
          defaultValue: `${base.inviteCta} for ${siteName}`,
        }),
      emptyTitle: t(`${metaKey}.emptyTitle`, { lng: language, defaultValue: base.emptyTitle }),
      emptyDescription: t(`${metaKey}.emptyDescription`, {
        lng: language,
        defaultValue: base.emptyDescription,
      }),
      siteHint: (siteName: string) =>
        t(`${metaKey}.siteHint`, {
          lng: language,
          siteName,
          defaultValue: base.siteHint(siteName),
        }),
    }
  }, [effectiveFilter, language, t])

  const activeSiteSlug = derivedSiteSlug ?? (siteFilter !== 'all' ? siteFilter : null)

  const filteredUsers = useMemo(() => {
    const lower = search.trim().toLowerCase()
    return USERS.filter((user) => {
      if (effectiveFilter !== 'all' && user.role !== effectiveFilter) {
        return false
      }
      if (activeSiteSlug) {
        const hasSite = user.sites.some((site) => site.slug === activeSiteSlug)
        if (!hasSite) return false
      }
      if (statusFilter !== 'all' && user.status !== statusFilter) {
        return false
      }
      if (!lower) return true
      return (
        user.name.toLowerCase().includes(lower) ||
        user.email.toLowerCase().includes(lower) ||
        user.sites.some((site) => site.name.toLowerCase().includes(lower))
      )
    })
  }, [activeSiteSlug, effectiveFilter, search, statusFilter])

  const selectedSite = useMemo(() => {
    if (derivedSiteSlug) {
      if (activeSite && activeSite.slug === derivedSiteSlug) return activeSite
      return sites.find((site) => site.slug === derivedSiteSlug) ?? null
    }
    if (siteFilter !== 'all') {
      return sites.find((site) => site.slug === siteFilter) ?? null
    }
    return null
  }, [activeSite, derivedSiteSlug, siteFilter, sites])

  const filteredSiteName = selectedSite?.name ?? (siteFilter !== 'all' ? siteFilter : null)
  const inviteCopy = filteredSiteName
    ? activeMeta.inviteCtaForSite(filteredSiteName)
    : activeMeta.inviteCta
  const filterLabel = filterLabels[effectiveFilter]
  const statusFilterLabel =
    statusFilter === 'all'
      ? t('usersPage.statusFilter.all', {
          lng: language,
          defaultValue: 'All statuses',
        })
      : statusLabels[statusFilter]

  const buildDetailUrl = useCallback(
    (user: UserRecord) => {
      // Prefer role-segmented routes when a role view is active
      const roleSegment = effectiveFilter !== 'all' ? `${effectiveFilter}s` : null

      if (derivedSiteSlug) {
        // Site context paths
        if (roleSegment) {
          return `/site/${derivedSiteSlug}/users/${roleSegment}/${user.id}`
        }
        return `/site/${derivedSiteSlug}/users/${user.id}`
      }

      // Enterprise paths
      if (roleSegment) {
        return `/admin/users/${roleSegment}/${user.id}`
      }
      // Fallback to non-segmented detail
      return `/admin/users/${user.id}`
    },
    [derivedSiteSlug, effectiveFilter],
  )

  const handleOpenFilter = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (lockedRoleFilter) return
    setAnchorEl(event.currentTarget)
  }

  const handleCloseFilter = () => {
    setAnchorEl(null)
  }

  const handleSelectRole = (value: RoleFilter) => {
    setRoleFilter(value)
    handleCloseFilter()
  }

  const handleOpenStatusFilter = (event: MouseEvent<HTMLButtonElement>) => {
    setStatusAnchor(event.currentTarget)
  }

  const handleCloseStatusFilter = () => {
    setStatusAnchor(null)
  }

  const handleSelectStatus = (value: 'all' | 'active' | 'pending' | 'suspended') => {
    setStatusFilter(value)
    handleCloseStatusFilter()
  }

  const [rowMenu, setRowMenu] = useState<{ anchor: HTMLElement | null; user?: UserRecord }>({
    anchor: null,
    user: undefined,
  })

  const openRowMenu = useCallback((event: MouseEvent<HTMLButtonElement>, user: UserRecord) => {
    event.stopPropagation()
    setRowMenu({ anchor: event.currentTarget, user })
  }, [])

  const closeRowMenu = useCallback(() => {
    setRowMenu({ anchor: null, user: undefined })
  }, [])

  const handleRowMenuViewProfile = useCallback(() => {
    if (!rowMenu.user) return
    const target = buildDetailUrl(rowMenu.user)
    closeRowMenu()
    navigate(target)
  }, [rowMenu.user, buildDetailUrl, closeRowMenu, navigate])

  const handleCopyToClipboard = useCallback((value: string) => {
    try {
      void navigator.clipboard.writeText(value)
    } catch {
      // ignore clipboard errors
    }
  }, [])

  const columnDefs = useMemo<ColumnDefinition<UserRecord>[]>(() => {
    const highlightSlug = activeSiteSlug ?? null
    return [
      {
        id: 'rowActions',
        label: '',
        disableToggle: true,
        minWidth: 60,
        align: 'center',
        render: (user) => (
          <Tooltip
            title={t('usersPage.tooltips.moreActions', {
              lng: language,
              defaultValue: 'More actions',
            })}
          >
            <IconButton size="small" onClick={(event) => openRowMenu(event, user)}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
      {
        id: 'id',
        label: t('usersPage.table.columns.userId', {
          lng: language,
          defaultValue: 'User ID',
        }),
        disableToggle: true,
        minWidth: 120,
        render: (user) => (
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {user.id}
          </Typography>
        ),
      },
      {
        id: 'name',
        label: t('usersPage.table.columns.name', { lng: language, defaultValue: 'Name' }),
        minWidth: 220,
        render: (user) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Badge
              overlap="circular"
              variant="dot"
              color={user.status === 'active' ? 'success' : 'default'}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Avatar src={user.avatar} sx={{ width: 36, height: 36 }}>
                {user.name
                  .split(' ')
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </Avatar>
            </Badge>
            <Typography variant="subtitle2" fontWeight={600}>
              {user.name}
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'email',
        label: t('usersPage.table.columns.email', {
          lng: language,
          defaultValue: 'Email',
        }),
        minWidth: 220,
        render: (user) => (
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        ),
      },
      {
        id: 'role',
        label: t('usersPage.table.columns.role', { lng: language, defaultValue: 'Role' }),
        minWidth: 120,
        render: (user) => <Chip size="small" label={roleChipLabels[user.role]} color="default" />,
      },
      {
        id: 'sites',
        label: t('usersPage.table.columns.sites', { lng: language, defaultValue: 'Sites' }),
        minWidth: 200,
        render: (user) => (
          <Stack direction="row" spacing={0.75} flexWrap="wrap">
            {user.sites.map((site) => (
              <Chip
                key={site.slug}
                label={site.name}
                size="small"
                color={highlightSlug && site.slug === highlightSlug ? 'secondary' : 'default'}
              />
            ))}
          </Stack>
        ),
      },
      {
        id: 'status',
        label: t('usersPage.table.columns.status', {
          lng: language,
          defaultValue: 'Status',
        }),
        minWidth: 140,
        render: (user) => (
          <Chip
            size="small"
            label={statusLabels[user.status]}
            color={STATUS_COLOR[user.status]}
            variant={user.status === 'active' ? 'filled' : 'outlined'}
          />
        ),
      },
      {
        id: 'lastActive',
        label: t('usersPage.table.columns.lastActive', {
          lng: language,
          defaultValue: 'Last activity',
        }),
        minWidth: 140,
        render: (user) => (
          <Typography variant="body2" color="text.secondary">
            {formatLastActive(user.lastActive)}
          </Typography>
        ),
      },
    ]
  }, [
    activeSiteSlug,
    buildDetailUrl,
    formatLastActive,
    isSiteContext,
    language,
    openRowMenu,
    roleChipLabels,
    statusLabels,
    t,
  ])

  // PageHeader configuration
  const badges = filteredSiteName
    ? [{ label: filteredSiteName, color: 'secondary' as const }]
    : [
        {
          label: t('usersPage.chip.enterprise', { lng: language, defaultValue: 'Enterprise' }),
          color: 'primary' as const,
        },
      ]

  const mobileBackButton = (
    <IconButton size="small" onClick={() => navigate(-1)}>
      <ArrowBackIcon fontSize="small" />
    </IconButton>
  )

  const rightActions = (
    <Button variant="contained" startIcon={<PersonAddAltIcon />}>
      {inviteCopy}
    </Button>
  )

  const mobileActions = (
    <IconButton size="small" color="primary" aria-label={inviteCopy}>
      <PersonAddAltIcon fontSize="small" />
    </IconButton>
  )

  return (
    <Stack spacing={3}>
      {isSiteContext && activeSite ? (
        <Alert
          severity="info"
          icon={<ShieldIcon fontSize="inherit" />}
          sx={{ alignItems: 'center', borderRadius: 2 }}
        >
          {activeMeta.siteHint(activeSite.name)}
        </Alert>
      ) : null}
      {!isSiteContext && siteFilter !== 'all' ? (
        <Alert
          severity="info"
          icon={<DomainIcon fontSize="inherit" />}
          sx={{ alignItems: 'center', borderRadius: 2 }}
        >
          {t('usersPage.alerts.siteFilter.prefix', {
            lng: language,
            defaultValue: 'Filtered to users associated with',
          })}{' '}
          <strong>{filteredSiteName ?? siteFilter}</strong>{' '}
          {t('usersPage.alerts.siteFilter.suffix', {
            lng: language,
            defaultValue: 'Clear the site selector to see the entire portfolio.',
          })}
        </Alert>
      ) : null}

      <PageHeader
        title={activeMeta.title}
        subtitle={activeMeta.description}
        badges={badges}
        rightActions={rightActions}
        mobileBackButton={mobileBackButton}
        mobileActions={mobileActions}
      />

      <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, minHeight: { xs: 340, sm: 380 } }}>
        {isMobile ? (
          <Stack spacing={2}>
            <Stack direction="column" spacing={1}>
              {!isSiteContext ? (
                <TextField
                  select
                  size="small"
                  label={t('usersPage.siteSelector.label', {
                    lng: language,
                    defaultValue: 'Site',
                  })}
                  value={siteFilter}
                  onChange={(event) => setSiteFilter(event.target.value)}
                  disabled={Boolean(lockedSiteFilter) || sites.length === 0}
                  fullWidth
                >
                  <MenuItem value="all">
                    {t('usersPage.siteSelector.all', {
                      lng: language,
                      defaultValue: 'All sites',
                    })}
                  </MenuItem>
                  {sites.map((site) => (
                    <MenuItem key={site.slug} value={site.slug}>
                      {site.name}
                    </MenuItem>
                  ))}
                </TextField>
              ) : null}
              <Button
                variant="outlined"
                startIcon={<ManageAccountsIcon fontSize="small" />}
                onClick={handleOpenStatusFilter}
                color={statusFilter === 'all' ? 'inherit' : 'primary'}
                fullWidth
              >
                {statusFilterLabel}
              </Button>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={handleOpenFilter}
                color={effectiveFilter === 'all' ? 'inherit' : 'primary'}
                disabled={Boolean(lockedRoleFilter)}
                fullWidth
              >
                {filterLabel}
              </Button>
            </Stack>

            <TextField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('usersPage.search.placeholder', {
                lng: language,
                defaultValue: 'Search by name, email, or site',
              })}
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            {filteredUsers.length === 0 ? (
              <Stack spacing={2} alignItems="center" sx={{ py: 5 }}>
                <Typography variant="subtitle1">{activeMeta.emptyTitle}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {activeMeta.emptyDescription}
                </Typography>
                <Button variant="contained" startIcon={<PersonAddAltIcon />}>
                  {inviteCopy}
                </Button>
              </Stack>
            ) : (
              <Stack spacing={2}>
                {filteredUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    roleChipLabels={roleChipLabels}
                    statusLabels={statusLabels}
                    highlightSlug={activeSiteSlug ?? null}
                    isSiteContext={isSiteContext}
                    buildDetailUrl={buildDetailUrl}
                    openRowMenu={openRowMenu}
                    t={t}
                    language={language}
                    formatLastActive={formatLastActive}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        ) : (
          <ConfigurableTable<UserRecord>
            storageKey="hex:columns:users"
            columns={columnDefs}
            rows={filteredUsers}
            getRowId={(user) => user.id}
            size="small"
            initialSkeletonMs={1000}
            skeletonPadding={{ xs: 2, sm: 3 }}
            skeletonMinHeight={300}
            skeletonRows={4}
            onRowClick={(user) => {
              const target = buildDetailUrl(user)
              navigate(target)
            }}
            emptyState={{
              title: activeMeta.emptyTitle,
              description: activeMeta.emptyDescription,
              action: (
                <Button variant="contained" startIcon={<PersonAddAltIcon />}>
                  {inviteCopy}
                </Button>
              ),
            }}
            renderToolbar={({ ColumnPreferencesTrigger }) => (
              <Stack spacing={3}>
                <Box sx={{ display: { xs: 'none', md: 'block' } }} />

                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  flexWrap="wrap"
                  rowGap={1}
                  sx={{ width: '100%' }}
                >
                  {!isSiteContext ? (
                    <TextField
                      select
                      size="small"
                      label={t('usersPage.siteSelector.label', {
                        lng: language,
                        defaultValue: 'Site',
                      })}
                      value={siteFilter}
                      onChange={(event) => setSiteFilter(event.target.value)}
                      disabled={Boolean(lockedSiteFilter) || sites.length === 0}
                      sx={{ minWidth: 200 }}
                    >
                      <MenuItem value="all">
                        {t('usersPage.siteSelector.all', {
                          lng: language,
                          defaultValue: 'All sites',
                        })}
                      </MenuItem>
                      {sites.map((site) => (
                        <MenuItem key={site.slug} value={site.slug}>
                          {site.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  ) : null}
                  {ColumnPreferencesTrigger}
                  <Button
                    variant="outlined"
                    startIcon={<ManageAccountsIcon fontSize="small" />}
                    onClick={handleOpenStatusFilter}
                    color={statusFilter === 'all' ? 'inherit' : 'primary'}
                  >
                    {statusFilterLabel}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<FilterListIcon />}
                    onClick={handleOpenFilter}
                    color={effectiveFilter === 'all' ? 'inherit' : 'primary'}
                    disabled={Boolean(lockedRoleFilter)}
                  >
                    {filterLabel}
                  </Button>
                </Stack>

                <TextField
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t('usersPage.search.placeholder', {
                    lng: language,
                    defaultValue: 'Search by name, email, or site',
                  })}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Stack>
            )}
          />
        )}
      </Paper>

      <Menu
        anchorEl={rowMenu.anchor}
        open={Boolean(rowMenu.anchor)}
        onClose={closeRowMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleRowMenuViewProfile}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          {t('usersPage.rowMenu.viewProfile', {
            lng: language,
            defaultValue: 'View profile',
          })}
        </MenuItem>
        <Divider />
        <MenuItem
          disabled={!rowMenu.user?.email}
          onClick={() => {
            if (!rowMenu.user?.email) return
            handleCopyToClipboard(rowMenu.user.email)
            closeRowMenu()
          }}
        >
          <ListItemIcon>
            <EmailIcon fontSize="small" />
          </ListItemIcon>
          {t('usersPage.rowMenu.copyEmail', { lng: language, defaultValue: 'Copy email' })}
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (!rowMenu.user) return
            handleCopyToClipboard(String(rowMenu.user.id))
            closeRowMenu()
          }}
        >
          <ListItemIcon>
            <BadgeOutlinedIcon fontSize="small" />
          </ListItemIcon>
          {t('usersPage.rowMenu.copyId', { lng: language, defaultValue: 'Copy user ID' })}
        </MenuItem>
        <Divider />
        <MenuItem
          disabled={rowMenu.user?.status !== 'active'}
          onClick={() => {
            // Placeholder for impersonation flow
            closeRowMenu()
          }}
        >
          <ListItemIcon>
            <ShieldIcon fontSize="small" />
          </ListItemIcon>
          {t('usersPage.rowMenu.impersonate', { lng: language, defaultValue: 'Impersonate' })}
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl) && !lockedRoleFilter}
        onClose={handleCloseFilter}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem selected={effectiveFilter === 'all'} onClick={() => handleSelectRole('all')}>
          {filterLabels.all}
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem selected={effectiveFilter === 'admin'} onClick={() => handleSelectRole('admin')}>
          {filterLabels.admin}
        </MenuItem>
        <MenuItem selected={effectiveFilter === 'guard'} onClick={() => handleSelectRole('guard')}>
          {filterLabels.guard}
        </MenuItem>
        <MenuItem
          selected={effectiveFilter === 'resident'}
          onClick={() => handleSelectRole('resident')}
        >
          {filterLabels.resident}
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={statusAnchor}
        open={Boolean(statusAnchor)}
        onClose={handleCloseStatusFilter}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem selected={statusFilter === 'all'} onClick={() => handleSelectStatus('all')}>
          {t('usersPage.statusFilter.all', {
            lng: language,
            defaultValue: 'All statuses',
          })}
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem selected={statusFilter === 'active'} onClick={() => handleSelectStatus('active')}>
          {statusLabels.active}
        </MenuItem>
        <MenuItem
          selected={statusFilter === 'pending'}
          onClick={() => handleSelectStatus('pending')}
        >
          {statusLabels.pending}
        </MenuItem>
        <MenuItem
          selected={statusFilter === 'suspended'}
          onClick={() => handleSelectStatus('suspended')}
        >
          {statusLabels.suspended}
        </MenuItem>
      </Menu>
    </Stack>
  )
}

function UserCard({
  user,
  roleChipLabels,
  statusLabels,
  highlightSlug,
  isSiteContext,
  buildDetailUrl,
  openRowMenu,
  t,
  language,
  formatLastActive,
}: {
  user: UserRecord
  roleChipLabels: Record<RoleKey, string>
  statusLabels: Record<string, string>
  highlightSlug: string | null
  isSiteContext: boolean
  buildDetailUrl: (user: UserRecord) => string
  openRowMenu: (event: React.MouseEvent<HTMLButtonElement>, user: UserRecord) => void
  t: (key: string, options?: { lng?: string; defaultValue?: string }) => string
  language: string
  formatLastActive: (timestamp: number | null) => string
}) {
  return (
    <Paper
      sx={(theme) => ({
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        transition: theme.transitions.create(['box-shadow', 'transform'], { duration: 180 }),
        '&:hover': {
          boxShadow: theme.shadows[4],
        },
      })}
      component={RouterLink}
      to={buildDetailUrl(user)}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <Stack spacing={2}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Badge
              overlap="circular"
              variant="dot"
              color={user.status === 'active' ? 'success' : 'default'}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Avatar src={user.avatar} sx={{ width: 48, height: 48 }}>
                {user.name
                  .split(' ')
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </Avatar>
            </Badge>
            <Stack spacing={0.5}>
              <Typography variant="subtitle1" fontWeight={600}>
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Stack>
          </Stack>
          <IconButton
            size="small"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              openRowMenu(event, user)
            }}
            sx={{ flexShrink: 0 }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Divider />

        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label={roleChipLabels[user.role]} size="small" color="default" />
            <Chip
              label={statusLabels[user.status]}
              size="small"
              color={STATUS_COLOR[user.status]}
              variant={user.status === 'active' ? 'filled' : 'outlined'}
            />
          </Stack>

          {user.sites.length > 0 && (
            <Stack spacing={0.75}>
              <Typography variant="caption" color="text.secondary">
                {t('usersPage.table.columns.sites', {
                  lng: language,
                  defaultValue: 'Sites',
                })}
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                {user.sites.map((site) => (
                  <Chip
                    key={site.slug}
                    label={site.name}
                    size="small"
                    color={highlightSlug && site.slug === highlightSlug ? 'secondary' : 'default'}
                  />
                ))}
              </Stack>
            </Stack>
          )}

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                {t('usersPage.table.columns.userId', {
                  lng: language,
                  defaultValue: 'User ID',
                })}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {user.id}
              </Typography>
            </Stack>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                {t('usersPage.table.columns.lastActive', {
                  lng: language,
                  defaultValue: 'Last activity',
                })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatLastActive(user.lastActive)}
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          justifyContent="flex-end"
          onClick={(e) => e.stopPropagation()}
        >
          {isSiteContext ? (
            <Button size="small" variant="outlined" fullWidth>
              {t('usersPage.actions.adjustRoles', {
                lng: language,
                defaultValue: 'Adjust roles',
              })}
            </Button>
          ) : (
            <Button
              size="small"
              variant="outlined"
              fullWidth
              startIcon={<ManageAccountsIcon fontSize="small" />}
            >
              {t('usersPage.actions.manage', {
                lng: language,
                defaultValue: 'Manage',
              })}
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  )
}
