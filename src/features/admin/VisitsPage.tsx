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
import AddBusinessIcon from '@mui/icons-material/AddBusiness'
import FilterListIcon from '@mui/icons-material/FilterList'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import SearchIcon from '@mui/icons-material/Search'
import CelebrationIcon from '@mui/icons-material/Celebration'
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled'
import DownloadIcon from '@mui/icons-material/Download'
import QrCode2Icon from '@mui/icons-material/QrCode2'
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import PendingIcon from '@mui/icons-material/Pending'
import { useSiteBackNavigation } from '@app/layout/useSiteBackNavigation'
import {
  useColumnPreferences,
  type ColumnDefinition,
} from '../../components/table/useColumnPreferences'
import { ColumnPreferencesButton } from '../../components/table/ColumnPreferencesButton'
import { useI18nStore } from '@store/i18n.store'

type VisitStatus = 'approved' | 'pending' | 'denied'
type VisitType = 'guest' | 'delivery' | 'event'

type VisitRecord = {
  id: string
  visitorName: string
  visitorEmail?: string
  vehiclePlate?: string
  hostName: string
  hostUnit: string
  siteSlug: string
  siteName: string
  scheduledFor: string
  approvedBy?: string
  status: VisitStatus
  type: VisitType
  badgeCode: string
  createdAt: string
}

const MOCK_VISITS: VisitRecord[] = [
  {
    id: 'VST-1043',
    visitorName: 'Hannah Lee',
    visitorEmail: 'hannah.lee@example.com',
    vehiclePlate: 'HXN-234',
    hostName: 'Carla Jenkins',
    hostUnit: 'Tower A · 1408',
    siteSlug: 'vista-azul',
    siteName: 'Vista Azul',
    scheduledFor: '2025-10-20T15:30:00-06:00',
    approvedBy: 'Guard Station 2',
    status: 'approved',
    type: 'guest',
    badgeCode: 'QRC-4812',
    createdAt: '2025-10-18T10:15:00-06:00',
  },
  {
    id: 'VST-1044',
    visitorName: 'Paco & Sons Delivery',
    vehiclePlate: 'LOG-992',
    hostName: 'Ana López',
    hostUnit: 'Service Gate',
    siteSlug: 'vista-azul',
    siteName: 'Vista Azul',
    scheduledFor: '2025-10-20T12:00:00-06:00',
    status: 'pending',
    type: 'delivery',
    badgeCode: 'DRV-2045',
    createdAt: '2025-10-19T08:50:00-06:00',
  },
  {
    id: 'VST-1045',
    visitorName: 'Michelle Ortega',
    visitorEmail: 'michelle.o@events.mx',
    hostName: 'Resident Social Committee',
    hostUnit: 'Clubhouse',
    siteSlug: 'los-olivos',
    siteName: 'Los Olivos',
    scheduledFor: '2025-10-21T18:00:00-06:00',
    approvedBy: 'Carlos Díaz',
    status: 'approved',
    type: 'event',
    badgeCode: 'EVT-8801',
    createdAt: '2025-10-16T12:10:00-06:00',
  },
  {
    id: 'VST-1046',
    visitorName: 'Cesar Ramirez',
    vehiclePlate: 'SPC-330',
    hostName: 'Guard Services',
    hostUnit: 'Main Gate',
    siteSlug: 'los-olivos',
    siteName: 'Los Olivos',
    scheduledFor: '2025-10-20T07:00:00-06:00',
    status: 'denied',
    type: 'guest',
    badgeCode: 'DEN-1944',
    createdAt: '2025-10-20T06:30:00-06:00',
  },
  {
    id: 'VST-1047',
    visitorName: 'Maria Gutierrez',
    visitorEmail: 'mgutie@visitors.mx',
    hostName: 'Zoe Ramirez',
    hostUnit: 'Tower B · 907',
    siteSlug: 'los-olivos',
    siteName: 'Los Olivos',
    scheduledFor: '2025-10-21T09:30:00-06:00',
    status: 'pending',
    type: 'guest',
    badgeCode: 'PEN-3920',
    createdAt: '2025-10-19T09:45:00-06:00',
  },
]

const STATUS_META: Record<
  VisitStatus,
  { label: string; color: 'success' | 'warning' | 'error'; Icon: typeof CheckCircleOutlineIcon }
> = {
  approved: { label: 'Approved', color: 'success', Icon: CheckCircleOutlineIcon },
  pending: { label: 'Pending', color: 'warning', Icon: PendingIcon },
  denied: { label: 'Denied', color: 'error', Icon: ErrorOutlineIcon },
}

const TYPE_META: Record<VisitType, { label: string; Icon: typeof PersonAddAltIcon }> = {
  guest: { label: 'Guest', Icon: PersonAddAltIcon },
  delivery: { label: 'Delivery', Icon: DirectionsCarFilledIcon },
  event: { label: 'Event', Icon: CelebrationIcon },
}

type VisitFilter = 'all' | VisitStatus | VisitType
const FILTER_OPTIONS: Array<{ value: VisitFilter; label: string }> = [
  { value: 'all', label: 'All visits' },
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'denied', label: 'Denied' },
  { value: 'guest', label: 'Guests' },
  { value: 'delivery', label: 'Deliveries' },
  { value: 'event', label: 'Events' },
]

// Removed USER_LOCALE, DATE_FORMATTER, and TIME_FORMATTER from module scope

export default function VisitsPage() {
  const { activeSite, slug: derivedSiteSlug } = useSiteBackNavigation()
  // Use the selected locale from the i18n store
  // Replace this import with your actual i18n store hook if different
  // import { useI18nStore } from '@app/i18n/useI18nStore'
  // const locale = useI18nStore((state) => state.language) || 'en-US'
  // Use language from i18n store; fall back to 'en'
  const lang = useI18nStore((s) => s.language) ?? 'en'
  // Intl accepts simple language tags like 'en', 'es', 'fr'
  const DATE_FORMATTER = new Intl.DateTimeFormat(lang, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const TIME_FORMATTER = new Intl.DateTimeFormat(lang, { hour: 'numeric', minute: '2-digit' })

  const isSiteContext = Boolean(derivedSiteSlug)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<VisitFilter>('all')
  const [rowMenu, setRowMenu] = useState<{ anchor: HTMLElement | null; visit?: VisitRecord }>({
    anchor: null,
    visit: undefined,
  })
  const [downloading, setDownloading] = useState(false)

  const filteredVisits = useMemo(() => {
    const lower = search.trim().toLowerCase()
    return MOCK_VISITS.filter((visit) => {
      if (derivedSiteSlug && visit.siteSlug !== derivedSiteSlug) {
        return false
      }
      if (filter === 'approved' || filter === 'pending' || filter === 'denied') {
        if (visit.status !== filter) return false
      } else if (filter === 'guest' || filter === 'delivery' || filter === 'event') {
        if (visit.type !== filter) return false
      }
      if (!lower) return true
      return (
        visit.visitorName.toLowerCase().includes(lower) ||
        visit.hostName.toLowerCase().includes(lower) ||
        visit.badgeCode.toLowerCase().includes(lower) ||
        visit.id.toLowerCase().includes(lower) ||
        visit.hostUnit.toLowerCase().includes(lower)
      )
    })
  }, [derivedSiteSlug, filter, search])

  const handleOpenRowMenu = useCallback(
    (event: MouseEvent<HTMLButtonElement>, visit: VisitRecord) => {
      event.stopPropagation()
      setRowMenu({ anchor: event.currentTarget, visit })
    },
    [],
  )

  const handleCloseRowMenu = useCallback(() => setRowMenu({ anchor: null, visit: undefined }), [])

  const handleDownloadBadge = useCallback(() => {
    setDownloading(true)
    setTimeout(() => {
      setDownloading(false)
    }, 1200)
  }, [])

  const columnDefs = useMemo<ColumnDefinition<VisitRecord>[]>(() => {
    const currentSlug = derivedSiteSlug ?? null
    return [
      {
        id: 'id',
        label: 'Visit ID',
        disableToggle: true,
        minWidth: 120,
        render: (visit) => (
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {visit.id}
          </Typography>
        ),
      },
      {
        id: 'visitor',
        label: 'Visitor',
        minWidth: 200,
        render: (visit) => (
          <Stack spacing={0.3}>
            <Typography variant="subtitle2" fontWeight={600}>
              {visit.visitorName}
            </Typography>
            {visit.visitorEmail ? (
              <Typography variant="caption" color="text.secondary">
                {visit.visitorEmail}
              </Typography>
            ) : null}
          </Stack>
        ),
      },
      {
        id: 'host',
        label: 'Host',
        minWidth: 200,
        render: (visit) => (
          <Stack spacing={0.3}>
            <Typography variant="subtitle2">{visit.hostName}</Typography>
            <Typography variant="caption" color="text.secondary">
              {visit.hostUnit}
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'vehicle',
        label: 'Vehicle',
        minWidth: 140,
        render: (visit) => (
          <Stack direction="row" spacing={0.75} alignItems="center">
            <DirectionsCarFilledIcon
              fontSize="small"
              color={visit.vehiclePlate ? 'action' : 'disabled'}
            />
            <Typography
              variant="body2"
              color={visit.vehiclePlate ? 'text.primary' : 'text.secondary'}
            >
              {visit.vehiclePlate ?? 'No plate on file'}
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'site',
        label: 'Site',
        minWidth: 160,
        render: (visit) => (
          <Chip
            label={visit.siteName}
            size="small"
            color={currentSlug && visit.siteSlug === currentSlug ? 'secondary' : 'default'}
          />
        ),
      },
      {
        id: 'schedule',
        label: 'Scheduled',
        minWidth: 160,
        render: (visit) => (
          <Stack spacing={0.2}>
            <Typography variant="body2" fontWeight={600}>
              {DATE_FORMATTER.format(new Date(visit.scheduledFor))}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {TIME_FORMATTER.format(new Date(visit.scheduledFor))}
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        minWidth: 140,
        render: (visit) => {
          const meta = STATUS_META[visit.status]
          return (
            <Chip
              size="small"
              color={meta.color}
              icon={<meta.Icon fontSize="small" />}
              label={meta.label}
              variant={visit.status === 'pending' ? 'outlined' : 'filled'}
            />
          )
        },
      },
      {
        id: 'type',
        label: 'Type',
        minWidth: 140,
        render: (visit) => {
          const meta = TYPE_META[visit.type]
          return (
            <Chip
              size="small"
              icon={<meta.Icon fontSize="small" />}
              label={meta.label}
              color={
                visit.type === 'delivery'
                  ? 'info'
                  : visit.type === 'event'
                    ? 'secondary'
                    : 'default'
              }
            />
          )
        },
      },
      {
        id: 'badge',
        label: 'Badge',
        minWidth: 140,
        render: (visit) => (
          <Stack direction="row" spacing={0.75} alignItems="center">
            <QrCode2Icon fontSize="small" color="action" />
            <Typography variant="body2" fontWeight={600}>
              {visit.badgeCode}
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'actions',
        label: 'Actions',
        disableToggle: true,
        align: 'right',
        minWidth: 160,
        render: (visit) => (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Tooltip title="Download badge">
              <span>
                <IconButton size="small" onClick={handleDownloadBadge} disabled={downloading}>
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="More actions">
              <IconButton size="small" onClick={(event) => handleOpenRowMenu(event, visit)}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ]
  }, [derivedSiteSlug, downloading, handleDownloadBadge, handleOpenRowMenu])

  const {
    orderedColumns,
    visibleColumns,
    hiddenColumns,
    toggleColumnVisibility,
    moveColumn,
    resetColumns,
  } = useColumnPreferences<VisitRecord>('hex:columns:visits', columnDefs)

  const visibleColumnCount = visibleColumns.length || 1
  const activeSiteName = activeSite?.name ?? derivedSiteSlug ?? null

  return (
    <Stack spacing={3}>
      {isSiteContext && activeSiteName ? (
        <Alert
          severity="info"
          icon={<AddBusinessIcon fontSize="inherit" />}
          sx={{ alignItems: 'center', borderRadius: 2 }}
        >
          Visits scoped to <strong>{activeSiteName}</strong>. Approvals, guest lists, and badges
          will prefill for this property.
        </Alert>
      ) : (
        <Alert
          severity="info"
          icon={<AddBusinessIcon fontSize="inherit" />}
          sx={{ alignItems: 'center', borderRadius: 2 }}
        >
          Switch to a specific site to pre-filter kiosk traffic or stay at enterprise level to audit
          all communities.
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
                  Visits
                </Typography>
                {isSiteContext && activeSiteName ? (
                  <Chip label={activeSiteName} size="small" color="secondary" />
                ) : (
                  <Chip label="Enterprise" size="small" color="primary" />
                )}
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Monitor guest traffic, scheduled arrivals, and kiosk approvals in real-time.
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
                onClick={(event) => setRowMenu({ anchor: event.currentTarget, visit: undefined })}
                color={filter === 'all' ? 'inherit' : 'primary'}
              >
                {FILTER_OPTIONS.find((option) => option.value === filter)?.label ?? 'All visits'}
              </Button>
              <Button variant="contained" startIcon={<PersonAddAltIcon />}>
                Create pass
              </Button>
            </Stack>
          </Stack>

          <TextField
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by visitor, host, badge, or ID"
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
                {filteredVisits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={visibleColumnCount}>
                      <Stack spacing={1} alignItems="center" sx={{ py: 5 }}>
                        <Typography variant="subtitle1">No visits found</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Adjust your filters or create a pass to get started.
                        </Typography>
                        <Button variant="contained" startIcon={<PersonAddAltIcon />}>
                          Create pass
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVisits.map((visit) => (
                    <TableRow key={visit.id} hover>
                      {visibleColumns.map((column) => (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          sx={{ minWidth: column.minWidth }}
                        >
                          {column.render(visit)}
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
        onClose={handleCloseRowMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {rowMenu.visit ? (
          <>
            <MenuItem
              onClick={() => {
                handleDownloadBadge()
                handleCloseRowMenu()
              }}
              disabled={downloading}
            >
              Download badge
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleCloseRowMenu()
              }}
            >
              Resend confirmation email
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleCloseRowMenu()
              }}
            >
              Cancel visit
            </MenuItem>
          </>
        ) : (
          FILTER_OPTIONS.map((option) => (
            <MenuItem
              key={option.value}
              selected={filter === option.value}
              onClick={() => {
                setFilter(option.value)
                setRowMenu({ anchor: null, visit: undefined })
              }}
            >
              {option.label}
            </MenuItem>
          ))
        )}
      </Menu>
    </Stack>
  )
}
