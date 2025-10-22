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
  Menu,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import SearchIcon from '@mui/icons-material/Search'
import ShieldIcon from '@mui/icons-material/Shield'
import DomainIcon from '@mui/icons-material/Domain'
import { useSiteStore } from '@store/site.store'
import { useSiteBackNavigation } from '@app/layout/useSiteBackNavigation'
import { ColumnPreferencesButton } from '../../components/table/ColumnPreferencesButton'
import {
  useColumnPreferences,
  type ColumnDefinition,
} from '../../components/table/useColumnPreferences'
import { useTranslate } from '../../i18n/useTranslate'
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
import buildEntityUrl from '@app/utils/contextPaths'
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
  const [search, setSearch] = useState('')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

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
      if (!lower) return true
      return (
        user.name.toLowerCase().includes(lower) ||
        user.email.toLowerCase().includes(lower) ||
        user.sites.some((site) => site.name.toLowerCase().includes(lower))
      )
    })
  }, [activeSiteSlug, effectiveFilter, search])

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

  const buildDetailUrl = useCallback(
    (user: UserRecord) => {
      const params = new URLSearchParams()
      if (effectiveFilter !== 'all') {
        params.set('role', effectiveFilter)
      }
      if (!isSiteContext && !lockedSiteFilter && siteFilter !== 'all') {
        params.set('site', siteFilter)
      }
      const searchSuffix = params.toString()
      const base = buildEntityUrl('users', user.id, {
        mode: derivedSiteSlug ? 'site' : 'enterprise',
        currentSlug: derivedSiteSlug ?? null,
        routeParamSlug: derivedSiteSlug ?? null,
        preferSiteWhenPossible: true,
      })
      return searchSuffix ? `${base}?${searchSuffix}` : base
    },
    [derivedSiteSlug, effectiveFilter, isSiteContext, lockedSiteFilter, siteFilter],
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

  const columnDefs = useMemo<ColumnDefinition<UserRecord>[]>(() => {
    const highlightSlug = activeSiteSlug ?? null
    return [
      {
        id: 'id',
        label: t('usersPage.table.columns.userId', {
          lng: language,
          defaultValue: 'User ID',
        }),
        disableToggle: true,
        minWidth: 120,
        render: (user) => (
          <Button
            component={RouterLink}
            to={buildDetailUrl(user)}
            size="small"
            sx={{ fontFamily: 'monospace', textTransform: 'none', px: 0 }}
          >
            {user.id}
          </Button>
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
      {
        id: 'actions',
        label: t('usersPage.table.columns.actions', {
          lng: language,
          defaultValue: 'Actions',
        }),
        disableToggle: true,
        minWidth: 160,
        align: 'right',
        render: (user) => (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            {isSiteContext ? (
              <Tooltip
                title={t('usersPage.tooltips.restrictSite', {
                  lng: language,
                  defaultValue: 'Restrict to this site',
                })}
              >
                <Button size="small" variant="outlined">
                  {t('usersPage.actions.adjustRoles', {
                    lng: language,
                    defaultValue: 'Adjust roles',
                  })}
                </Button>
              </Tooltip>
            ) : (
              <Tooltip
                title={t('usersPage.tooltips.manageWorkspace', {
                  lng: language,
                  defaultValue: 'Manage workspace access',
                })}
              >
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ManageAccountsIcon fontSize="small" />}
                >
                  {t('usersPage.actions.manage', {
                    lng: language,
                    defaultValue: 'Manage',
                  })}
                </Button>
              </Tooltip>
            )}
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
          </Stack>
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

  const {
    orderedColumns,
    visibleColumns,
    hiddenColumns,
    toggleColumnVisibility,
    moveColumn,
    resetColumns,
  } = useColumnPreferences<UserRecord>('hex:columns:users', columnDefs)

  const visibleColumnCount = visibleColumns.length || 1

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

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack spacing={3}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={2}
          >
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Typography variant="h5" fontWeight={600}>
                  {activeMeta.title}
                </Typography>
                <Chip
                  label={
                    filteredSiteName ??
                    t('usersPage.chip.enterprise', {
                      lng: language,
                      defaultValue: 'Enterprise',
                    })
                  }
                  size="small"
                  color={isSiteContext || siteFilter !== 'all' ? 'secondary' : 'primary'}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {activeMeta.description}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
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
              <ColumnPreferencesButton
                columns={orderedColumns}
                hiddenColumns={hiddenColumns}
                onToggleColumn={toggleColumnVisibility}
                onMoveColumn={moveColumn}
                onReset={resetColumns}
              />
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={handleOpenFilter}
                color={effectiveFilter === 'all' ? 'inherit' : 'primary'}
                disabled={Boolean(lockedRoleFilter)}
              >
                {filterLabel}
              </Button>
              <Button variant="contained" startIcon={<PersonAddAltIcon />}>
                {inviteCopy}
              </Button>
            </Stack>
          </Stack>

          <TextField
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('usersPage.search.placeholder', {
              lng: language,
              defaultValue: 'Search by name, email, or site',
            })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {visibleColumns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      sx={{ minWidth: column.minWidth }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={visibleColumnCount}>
                      <Stack spacing={1} alignItems="center" sx={{ py: 5 }}>
                        <Typography variant="subtitle1">{activeMeta.emptyTitle}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {activeMeta.emptyDescription}
                        </Typography>
                        <Button variant="contained" startIcon={<PersonAddAltIcon />}>
                          {inviteCopy}
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      {visibleColumns.map((column) => (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          sx={{ minWidth: column.minWidth }}
                        >
                          {column.render(user)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Paper>

      <Menu
        anchorEl={rowMenu.anchor}
        open={Boolean(rowMenu.anchor)}
        onClose={closeRowMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleRowMenuViewProfile}>
          {t('usersPage.rowMenu.viewProfile', {
            lng: language,
            defaultValue: 'View profile',
          })}
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
    </Stack>
  )
}
