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

export default function UsersPage() {
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
  const activeMeta = ROLE_VIEW_META[effectiveFilter]
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
    ? `${activeMeta.inviteCta} for ${filteredSiteName}`
    : activeMeta.inviteCta

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
      const base = derivedSiteSlug
        ? `/site/${derivedSiteSlug}/users/${user.id}`
        : `/admin/users/${user.id}`
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
        label: 'User ID',
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
        label: 'Name',
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
        label: 'Email',
        minWidth: 220,
        render: (user) => (
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        ),
      },
      {
        id: 'role',
        label: 'Role',
        minWidth: 120,
        render: (user) => <Chip size="small" label={ROLE_LABEL[user.role]} color="default" />,
      },
      {
        id: 'sites',
        label: 'Sites',
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
        label: 'Status',
        minWidth: 140,
        render: (user) => (
          <Chip
            size="small"
            label={
              user.status === 'active'
                ? 'Active'
                : user.status === 'pending'
                  ? 'Invited'
                  : 'Suspended'
            }
            color={STATUS_COLOR[user.status]}
            variant={user.status === 'active' ? 'filled' : 'outlined'}
          />
        ),
      },
      {
        id: 'lastActive',
        label: 'Last activity',
        minWidth: 140,
        render: (user) => (
          <Typography variant="body2" color="text.secondary">
            {user.lastActive}
          </Typography>
        ),
      },
      {
        id: 'actions',
        label: 'Actions',
        disableToggle: true,
        minWidth: 160,
        align: 'right',
        render: (user) => (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            {isSiteContext ? (
              <Tooltip title="Restrict to this site">
                <Button size="small" variant="outlined">
                  Adjust roles
                </Button>
              </Tooltip>
            ) : (
              <Tooltip title="Manage workspace access">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ManageAccountsIcon fontSize="small" />}
                >
                  Manage
                </Button>
              </Tooltip>
            )}
            <Tooltip title="More actions">
              <IconButton size="small" onClick={(event) => openRowMenu(event, user)}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ]
  }, [activeSiteSlug, buildDetailUrl, isSiteContext, openRowMenu])

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
          Filtered to users associated with <strong>{filteredSiteName ?? siteFilter}</strong>. Clear
          the site selector to see the entire portfolio.
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
                  label={filteredSiteName ?? 'Enterprise'}
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
                  label="Site"
                  value={siteFilter}
                  onChange={(event) => setSiteFilter(event.target.value)}
                  disabled={Boolean(lockedSiteFilter) || sites.length === 0}
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value="all">All sites</MenuItem>
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
                {effectiveFilter === 'all' ? 'All roles' : ROLE_LABEL[effectiveFilter]}
              </Button>
              <Button variant="contained" startIcon={<PersonAddAltIcon />}>
                {inviteCopy}
              </Button>
            </Stack>
          </Stack>

          <TextField
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, or site"
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
        <MenuItem onClick={handleRowMenuViewProfile}>View profile</MenuItem>
      </Menu>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl) && !lockedRoleFilter}
        onClose={handleCloseFilter}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem selected={effectiveFilter === 'all'} onClick={() => handleSelectRole('all')}>
          All roles
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem selected={effectiveFilter === 'admin'} onClick={() => handleSelectRole('admin')}>
          Admins
        </MenuItem>
        <MenuItem selected={effectiveFilter === 'guard'} onClick={() => handleSelectRole('guard')}>
          Guards
        </MenuItem>
        <MenuItem
          selected={effectiveFilter === 'resident'}
          onClick={() => handleSelectRole('resident')}
        >
          Residents
        </MenuItem>
      </Menu>
    </Stack>
  )
}
