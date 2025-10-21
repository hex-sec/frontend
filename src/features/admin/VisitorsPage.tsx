import { useCallback, useMemo, useState, type MouseEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
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
import MoreVertIcon from '@mui/icons-material/MoreVert'
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1'
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom'
import HandshakeIcon from '@mui/icons-material/Handshake'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'
import SearchIcon from '@mui/icons-material/Search'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred'
import HourglassTopIcon from '@mui/icons-material/HourglassTop'
import BadgeIcon from '@mui/icons-material/Badge'
import { useSiteBackNavigation } from '@app/layout/useSiteBackNavigation'
import {
  useColumnPreferences,
  type ColumnDefinition,
} from '../../components/table/useColumnPreferences'
import { ColumnPreferencesButton } from '../../components/table/ColumnPreferencesButton'

type VisitorCategory = 'family' | 'vendor' | 'staff'
type VisitorStatus = 'active' | 'blocked' | 'pending'

type VisitorRecord = {
  id: string
  name: string
  email: string
  phone?: string
  siteSlug: string
  siteName: string
  primaryHost: string
  preferredNotes?: string
  lastVisit: string
  totalVisits: number
  category: VisitorCategory
  status: VisitorStatus
}

const MOCK_VISITORS: VisitorRecord[] = [
  {
    id: 'VIS-3301',
    name: 'Hannah Lee',
    email: 'hannah.lee@example.com',
    phone: '+52 55 7001 1001',
    siteSlug: 'vista-azul',
    siteName: 'Vista Azul',
    primaryHost: 'Carla Jenkins · Tower A 1408',
    preferredNotes: 'Approved for express kiosk check-in.',
    lastVisit: '2025-10-18T10:15:00-06:00',
    totalVisits: 16,
    category: 'family',
    status: 'active',
  },
  {
    id: 'VIS-3302',
    name: 'Paco & Sons Delivery',
    email: 'dispatch@paco-delivery.mx',
    phone: '+52 55 4455 8899',
    siteSlug: 'vista-azul',
    siteName: 'Vista Azul',
    primaryHost: 'Loading Dock · Service Gate',
    preferredNotes: 'Requires dock clearance for oversize packages.',
    lastVisit: '2025-10-19T08:50:00-06:00',
    totalVisits: 42,
    category: 'vendor',
    status: 'active',
  },
  {
    id: 'VIS-3303',
    name: 'Michelle Ortega',
    email: 'michelle.o@events.mx',
    phone: '+52 55 6400 8821',
    siteSlug: 'los-olivos',
    siteName: 'Los Olivos',
    primaryHost: 'Events · Clubhouse',
    preferredNotes: 'Event organizer credential expires Dec 2025.',
    lastVisit: '2025-10-16T12:10:00-06:00',
    totalVisits: 9,
    category: 'vendor',
    status: 'pending',
  },
  {
    id: 'VIS-3304',
    name: 'Cesar Ramirez',
    email: 'cesar.ramirez@unknown.mx',
    siteSlug: 'los-olivos',
    siteName: 'Los Olivos',
    primaryHost: 'Guard Services',
    preferredNotes: 'Flagged for manual review after denied attempt.',
    lastVisit: '2025-10-20T06:30:00-06:00',
    totalVisits: 2,
    category: 'staff',
    status: 'blocked',
  },
  {
    id: 'VIS-3305',
    name: 'Maria Gutierrez',
    email: 'mgutie@visitors.mx',
    phone: '+52 55 3388 2201',
    siteSlug: 'los-olivos',
    siteName: 'Los Olivos',
    primaryHost: 'Zoe Ramirez · Tower B 907',
    lastVisit: '2025-10-19T09:45:00-06:00',
    totalVisits: 6,
    category: 'family',
    status: 'pending',
  },
]

const CATEGORY_META: Record<
  VisitorCategory,
  { label: string; Icon: typeof FamilyRestroomIcon; color: 'primary' | 'secondary' | 'info' }
> = {
  family: { label: 'Family & friends', Icon: FamilyRestroomIcon, color: 'secondary' },
  vendor: { label: 'Vendor', Icon: HandshakeIcon, color: 'primary' },
  staff: { label: 'Staff', Icon: BusinessCenterIcon, color: 'info' },
}

const STATUS_META: Record<
  VisitorStatus,
  {
    label: string
    color: 'success' | 'warning' | 'error'
    Icon: typeof CheckCircleOutlineIcon
    variant?: 'outlined' | 'filled'
  }
> = {
  active: { label: 'Active', color: 'success', Icon: CheckCircleOutlineIcon },
  blocked: { label: 'Blocked', color: 'error', Icon: ReportGmailerrorredIcon },
  pending: {
    label: 'Pending review',
    color: 'warning',
    Icon: HourglassTopIcon,
    variant: 'outlined',
  },
}

type VisitorFilter = 'all' | VisitorStatus | VisitorCategory

const FILTER_OPTIONS: Array<{ value: VisitorFilter; label: string }> = [
  { value: 'all', label: 'All visitors' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending review' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'family', label: 'Family & friends' },
  { value: 'vendor', label: 'Vendors' },
  { value: 'staff', label: 'Staff & contractors' },
]

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})
const TIME_FORMATTER = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' })

export default function VisitorsPage() {
  const { activeSite, slug: derivedSiteSlug } = useSiteBackNavigation()
  const isSiteContext = Boolean(derivedSiteSlug)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<VisitorFilter>('all')
  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null)
  const [rowMenu, setRowMenu] = useState<{ anchor: HTMLElement | null; visitor?: VisitorRecord }>({
    anchor: null,
    visitor: undefined,
  })

  const filteredVisitors = useMemo(() => {
    const lower = search.trim().toLowerCase()
    return MOCK_VISITORS.filter((visitor) => {
      if (derivedSiteSlug && visitor.siteSlug !== derivedSiteSlug) {
        return false
      }
      if (filter === 'active' || filter === 'pending' || filter === 'blocked') {
        if (visitor.status !== filter) return false
      } else if (filter === 'family' || filter === 'vendor' || filter === 'staff') {
        if (visitor.category !== filter) return false
      }
      if (!lower) return true
      return (
        visitor.name.toLowerCase().includes(lower) ||
        visitor.email.toLowerCase().includes(lower) ||
        visitor.primaryHost.toLowerCase().includes(lower) ||
        visitor.siteName.toLowerCase().includes(lower)
      )
    })
  }, [derivedSiteSlug, filter, search])

  const handleOpenFilterMenu = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setFilterAnchor(event.currentTarget)
  }, [])

  const handleCloseFilterMenu = useCallback(() => setFilterAnchor(null), [])

  const handleSelectFilter = useCallback((value: VisitorFilter) => {
    setFilter(value)
    setFilterAnchor(null)
  }, [])

  const handleOpenRowMenu = useCallback(
    (event: MouseEvent<HTMLButtonElement>, visitor: VisitorRecord) => {
      event.stopPropagation()
      setRowMenu({ anchor: event.currentTarget, visitor })
    },
    [],
  )

  const handleCloseRowMenu = useCallback(() => setRowMenu({ anchor: null, visitor: undefined }), [])

  const handlePromoteToPass = useCallback(() => {
    handleCloseRowMenu()
  }, [handleCloseRowMenu])

  const handleBlockVisitor = useCallback(() => {
    handleCloseRowMenu()
  }, [handleCloseRowMenu])

  const columnDefs = useMemo<ColumnDefinition<VisitorRecord>[]>(() => {
    const currentSlug = derivedSiteSlug ?? null
    return [
      {
        id: 'visitor',
        label: 'Visitor',
        minWidth: 220,
        disableToggle: true,
        render: (visitor) => (
          <Stack spacing={0.2}>
            <Typography variant="subtitle2" fontWeight={600}>
              {visitor.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {visitor.email}
            </Typography>
            {visitor.phone ? (
              <Typography variant="caption" color="text.secondary">
                {visitor.phone}
              </Typography>
            ) : null}
          </Stack>
        ),
      },
      {
        id: 'category',
        label: 'Category',
        minWidth: 160,
        render: (visitor) => {
          const meta = CATEGORY_META[visitor.category]
          return (
            <Chip
              size="small"
              icon={<meta.Icon fontSize="small" />}
              label={meta.label}
              color={meta.color}
            />
          )
        },
      },
      {
        id: 'host',
        label: 'Primary host',
        minWidth: 220,
        render: (visitor) => (
          <Stack spacing={0.2}>
            <Typography variant="subtitle2">{visitor.primaryHost}</Typography>
            {visitor.preferredNotes ? (
              <Typography variant="caption" color="text.secondary">
                {visitor.preferredNotes}
              </Typography>
            ) : null}
          </Stack>
        ),
      },
      {
        id: 'site',
        label: 'Site',
        minWidth: 150,
        render: (visitor) => (
          <Chip
            label={visitor.siteName}
            size="small"
            color={currentSlug && visitor.siteSlug === currentSlug ? 'secondary' : 'default'}
          />
        ),
      },
      {
        id: 'lastVisit',
        label: 'Last visit',
        minWidth: 160,
        render: (visitor) => (
          <Stack spacing={0.2}>
            <Typography variant="body2">
              {DATE_FORMATTER.format(new Date(visitor.lastVisit))}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {TIME_FORMATTER.format(new Date(visitor.lastVisit))}
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'totalVisits',
        label: 'Visits logged',
        minWidth: 140,
        render: (visitor) => (
          <Chip size="small" label={`${visitor.totalVisits} visits`} color="default" />
        ),
      },
      {
        id: 'status',
        label: 'Status',
        minWidth: 140,
        render: (visitor) => {
          const meta = STATUS_META[visitor.status]
          return (
            <Chip
              size="small"
              color={meta.color}
              icon={<meta.Icon fontSize="small" />}
              label={meta.label}
              variant={meta.variant ?? 'filled'}
            />
          )
        },
      },
      {
        id: 'actions',
        label: 'Actions',
        disableToggle: true,
        align: 'right',
        minWidth: 160,
        render: (visitor) => (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Tooltip title="Issue visit pass">
              <Button size="small" variant="outlined" onClick={handlePromoteToPass}>
                Create pass
              </Button>
            </Tooltip>
            <Tooltip title="More actions">
              <IconButton size="small" onClick={(event) => handleOpenRowMenu(event, visitor)}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ]
  }, [derivedSiteSlug, handleOpenRowMenu, handlePromoteToPass])

  const {
    orderedColumns,
    visibleColumns,
    hiddenColumns,
    toggleColumnVisibility,
    moveColumn,
    resetColumns,
  } = useColumnPreferences<VisitorRecord>('hex:columns:visitors', columnDefs)

  const visibleColumnCount = visibleColumns.length || 1

  const activeSiteName = activeSite?.name ?? derivedSiteSlug ?? null

  return (
    <Stack spacing={3}>
      {isSiteContext && activeSiteName ? (
        <Alert
          severity="info"
          icon={<BadgeIcon fontSize="inherit" />}
          sx={{ alignItems: 'center', borderRadius: 2 }}
        >
          Visitors scoped to <strong>{activeSiteName}</strong>. Recurring approvals, notes, and
          expedited kiosk settings will stay in sync for this property.
        </Alert>
      ) : (
        <Alert
          severity="info"
          icon={<BadgeIcon fontSize="inherit" />}
          sx={{ alignItems: 'center', borderRadius: 2 }}
        >
          Track frequent guests across the portfolio and move to site mode to tune access rules for
          a single community.
        </Alert>
      )}

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
                  Recurring visitors
                </Typography>
                {isSiteContext && activeSiteName ? (
                  <Chip label={activeSiteName} size="small" color="secondary" />
                ) : (
                  <Chip label="Enterprise" size="small" color="primary" />
                )}
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Store frequent visitor profiles for faster gate processing and audit trails.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
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
                onClick={handleOpenFilterMenu}
                color={filter === 'all' ? 'inherit' : 'primary'}
              >
                {FILTER_OPTIONS.find((option) => option.value === filter)?.label ?? 'All visitors'}
              </Button>
              <Button variant="contained" startIcon={<PersonAddAlt1Icon />}>
                Add recurring visitor
              </Button>
            </Stack>
          </Stack>

          <TextField
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by visitor, email, or host"
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
                {filteredVisitors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={visibleColumnCount}>
                      <Stack spacing={1} alignItems="center" sx={{ py: 5 }}>
                        <Typography variant="subtitle1">No visitors found</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Adjust filters or add a recurring visitor profile.
                        </Typography>
                        <Button variant="contained" startIcon={<PersonAddAlt1Icon />}>
                          Add recurring visitor
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVisitors.map((visitor) => (
                    <TableRow key={visitor.id} hover>
                      {visibleColumns.map((column) => (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          sx={{ minWidth: column.minWidth }}
                        >
                          {column.render(visitor)}
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
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={handleCloseFilterMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {FILTER_OPTIONS.map((option) => (
          <MenuItem
            key={option.value}
            selected={filter === option.value}
            onClick={() => handleSelectFilter(option.value)}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={rowMenu.anchor}
        open={Boolean(rowMenu.anchor && rowMenu.visitor)}
        onClose={handleCloseRowMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handlePromoteToPass}>Issue visit pass</MenuItem>
        <MenuItem onClick={handleBlockVisitor}>Block visitor</MenuItem>
        <MenuItem
          onClick={() => {
            handleCloseRowMenu()
          }}
        >
          Delete profile
        </MenuItem>
      </Menu>
    </Stack>
  )
}
