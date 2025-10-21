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
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled'
import FilterListIcon from '@mui/icons-material/FilterList'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import SearchIcon from '@mui/icons-material/Search'
import HomeIcon from '@mui/icons-material/Home'
import HandshakeIcon from '@mui/icons-material/Handshake'
import BuildCircleIcon from '@mui/icons-material/BuildCircle'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ReportIcon from '@mui/icons-material/Report'
import UpdateIcon from '@mui/icons-material/Update'
import DownloadIcon from '@mui/icons-material/Download'
import { useSiteBackNavigation } from '@app/layout/useSiteBackNavigation'
import {
  useColumnPreferences,
  type ColumnDefinition,
} from '../../components/table/useColumnPreferences'
import { ColumnPreferencesButton } from '../../components/table/ColumnPreferencesButton'

type VehicleUsage = 'resident' | 'visitor' | 'service'
type VehicleStatus = 'active' | 'expired' | 'flagged'

type VehicleRecord = {
  id: string
  plate: string
  makeModel: string
  color: string
  usage: VehicleUsage
  assignedTo: string
  contactName: string
  contactPhone?: string
  siteSlug: string
  siteName: string
  permitId: string
  passesIssued: number
  lastSeen: string
  status: VehicleStatus
}
import vehiclesSeed from '../../mocks/vehicles.json'

const MOCK_VEHICLES: VehicleRecord[] = (vehiclesSeed as Array<Record<string, unknown>>).map(
  (v) => ({
    id: String(v.id),
    plate: String(v.plate),
    makeModel: String(v.makeModel),
    color: String(v.color),
    usage: v.usage as VehicleRecord['usage'],
    assignedTo: String(v.assignedTo),
    contactName: String(v.contactName),
    contactPhone: v.contactPhone as string | undefined,
    siteSlug: String(v.siteSlug),
    siteName: String(v.siteName),
    permitId: String(v.permitId),
    passesIssued: Number(v.passesIssued),
    lastSeen: String(v.lastSeen),
    status: v.status as VehicleRecord['status'],
  }),
)

const USAGE_META: Record<
  VehicleUsage,
  { label: string; Icon: typeof HomeIcon; color: 'default' | 'primary' | 'secondary' | 'info' }
> = {
  resident: { label: 'Resident', Icon: HomeIcon, color: 'primary' },
  visitor: { label: 'Visitor', Icon: HandshakeIcon, color: 'secondary' },
  service: { label: 'Service', Icon: BuildCircleIcon, color: 'info' },
}

const STATUS_META: Record<
  VehicleStatus,
  { label: string; color: 'success' | 'warning' | 'error'; Icon: typeof CheckCircleOutlineIcon }
> = {
  active: { label: 'Active', color: 'success', Icon: CheckCircleOutlineIcon },
  expired: { label: 'Expired permit', color: 'warning', Icon: UpdateIcon },
  flagged: { label: 'Flagged', color: 'error', Icon: ReportIcon },
}

type VehicleFilter = 'all' | VehicleUsage | 'flagged'

const FILTER_OPTIONS: Array<{ value: VehicleFilter; label: string }> = [
  { value: 'all', label: 'All vehicles' },
  { value: 'resident', label: 'Resident vehicles' },
  { value: 'visitor', label: 'Visitor vehicles' },
  { value: 'service', label: 'Service vendors' },
  { value: 'flagged', label: 'Flagged for review' },
]

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})
const TIME_FORMATTER = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' })

export default function VehiclesPage() {
  const { activeSite, slug: derivedSiteSlug } = useSiteBackNavigation()
  const isSiteContext = Boolean(derivedSiteSlug)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<VehicleFilter>('all')
  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null)
  const [rowMenu, setRowMenu] = useState<{ anchor: HTMLElement | null; vehicle?: VehicleRecord }>({
    anchor: null,
    vehicle: undefined,
  })

  const filteredVehicles = useMemo(() => {
    const lower = search.trim().toLowerCase()
    return MOCK_VEHICLES.filter((vehicle) => {
      if (derivedSiteSlug && vehicle.siteSlug !== derivedSiteSlug) {
        return false
      }
      if (filter === 'flagged') {
        if (vehicle.status !== 'flagged') return false
      } else if (filter !== 'all') {
        if (vehicle.usage !== filter) return false
      }
      if (!lower) return true
      return (
        vehicle.plate.toLowerCase().includes(lower) ||
        vehicle.makeModel.toLowerCase().includes(lower) ||
        vehicle.assignedTo.toLowerCase().includes(lower) ||
        vehicle.contactName.toLowerCase().includes(lower) ||
        vehicle.permitId.toLowerCase().includes(lower)
      )
    })
  }, [derivedSiteSlug, filter, search])

  const handleOpenFilterMenu = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setFilterAnchor(event.currentTarget)
  }, [])

  const handleCloseFilterMenu = useCallback(() => {
    setFilterAnchor(null)
  }, [])

  const handleSelectFilter = useCallback((value: VehicleFilter) => {
    setFilter(value)
    setFilterAnchor(null)
  }, [])

  const handleOpenRowMenu = useCallback(
    (event: MouseEvent<HTMLButtonElement>, vehicle: VehicleRecord) => {
      event.stopPropagation()
      setRowMenu({ anchor: event.currentTarget, vehicle })
    },
    [],
  )

  const handleCloseRowMenu = useCallback(() => setRowMenu({ anchor: null, vehicle: undefined }), [])

  const handleDownloadPermit = useCallback(() => {
    handleCloseRowMenu()
  }, [handleCloseRowMenu])

  const handleFlagVehicle = useCallback(() => {
    handleCloseRowMenu()
  }, [handleCloseRowMenu])

  const columnDefs = useMemo<ColumnDefinition<VehicleRecord>[]>(() => {
    const currentSlug = derivedSiteSlug ?? null
    return [
      {
        id: 'plate',
        label: 'Plate',
        disableToggle: true,
        minWidth: 120,
        render: (vehicle) => (
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
            {vehicle.plate}
          </Typography>
        ),
      },
      {
        id: 'vehicle',
        label: 'Vehicle',
        minWidth: 210,
        render: (vehicle) => (
          <Stack spacing={0.3}>
            <Typography variant="subtitle2" fontWeight={600}>
              {vehicle.makeModel}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {vehicle.color}
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'usage',
        label: 'Usage',
        minWidth: 160,
        render: (vehicle) => {
          const meta = USAGE_META[vehicle.usage]
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
        id: 'assignedTo',
        label: 'Assigned to',
        minWidth: 200,
        render: (vehicle) => (
          <Stack spacing={0.2}>
            <Typography variant="subtitle2">{vehicle.assignedTo}</Typography>
            <Typography variant="caption" color="text.secondary">
              {vehicle.contactName}
              {vehicle.contactPhone ? ` • ${vehicle.contactPhone}` : ''}
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'site',
        label: 'Site',
        minWidth: 150,
        render: (vehicle) => (
          <Chip
            label={vehicle.siteName}
            size="small"
            color={currentSlug && vehicle.siteSlug === currentSlug ? 'secondary' : 'default'}
          />
        ),
      },
      {
        id: 'permit',
        label: 'Permit',
        minWidth: 140,
        render: (vehicle) => (
          <Stack spacing={0.2}>
            <Typography variant="body2" fontWeight={600}>
              {vehicle.permitId}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {vehicle.passesIssued} passes issued
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'lastSeen',
        label: 'Last seen',
        minWidth: 160,
        render: (vehicle) => (
          <Stack spacing={0.2}>
            <Typography variant="body2">
              {DATE_FORMATTER.format(new Date(vehicle.lastSeen))}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {TIME_FORMATTER.format(new Date(vehicle.lastSeen))}
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        minWidth: 150,
        render: (vehicle) => {
          const meta = STATUS_META[vehicle.status]
          return (
            <Chip
              size="small"
              color={meta.color}
              icon={<meta.Icon fontSize="small" />}
              label={meta.label}
              variant={vehicle.status === 'expired' ? 'outlined' : 'filled'}
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
        render: (vehicle) => (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Tooltip title="Download permit">
              <IconButton size="small" onClick={handleDownloadPermit}>
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="More actions">
              <IconButton size="small" onClick={(event) => handleOpenRowMenu(event, vehicle)}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ]
  }, [derivedSiteSlug, handleDownloadPermit, handleOpenRowMenu])

  const {
    orderedColumns,
    visibleColumns,
    hiddenColumns,
    toggleColumnVisibility,
    moveColumn,
    resetColumns,
  } = useColumnPreferences<VehicleRecord>('hex:columns:vehicles', columnDefs)

  const visibleColumnCount = visibleColumns.length || 1

  const activeSiteName = activeSite?.name ?? derivedSiteSlug ?? null

  return (
    <Stack spacing={3}>
      {isSiteContext && activeSiteName ? (
        <Alert
          severity="info"
          icon={<DirectionsCarFilledIcon fontSize="inherit" />}
          sx={{ alignItems: 'center', borderRadius: 2 }}
        >
          Showing vehicles scoped to <strong>{activeSiteName}</strong>. Registration flows will
          prefill permits and contact info for this property.
        </Alert>
      ) : (
        <Alert
          severity="info"
          icon={<DirectionsCarFilledIcon fontSize="inherit" />}
          sx={{ alignItems: 'center', borderRadius: 2 }}
        >
          Switch to a site to manage permits at the property level or stay in enterprise mode to
          audit all registered vehicles.
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
                  Vehicle registry
                </Typography>
                {isSiteContext && activeSiteName ? (
                  <Chip label={activeSiteName} size="small" color="secondary" />
                ) : (
                  <Chip label="Enterprise" size="small" color="primary" />
                )}
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Register resident, visitor, and service vehicles to keep guard kiosks synced.
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
                {FILTER_OPTIONS.find((option) => option.value === filter)?.label ?? 'All vehicles'}
              </Button>
              <Button variant="contained" startIcon={<DirectionsCarFilledIcon />}>
                Register vehicle
              </Button>
            </Stack>
          </Stack>

          <TextField
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by plate, permit, or contact"
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
                {filteredVehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={visibleColumnCount}>
                      <Stack spacing={1} alignItems="center" sx={{ py: 5 }}>
                        <Typography variant="subtitle1">No vehicles found</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Adjust filters or register a vehicle to populate this list.
                        </Typography>
                        <Button variant="contained" startIcon={<DirectionsCarFilledIcon />}>
                          Register vehicle
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id} hover>
                      {visibleColumns.map((column) => (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          sx={{ minWidth: column.minWidth }}
                        >
                          {column.render(vehicle)}
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
        open={Boolean(rowMenu.anchor && rowMenu.vehicle)}
        onClose={handleCloseRowMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleDownloadPermit}>Download permit</MenuItem>
        <MenuItem onClick={handleFlagVehicle}>Flag for review</MenuItem>
        <MenuItem
          onClick={() => {
            handleCloseRowMenu()
          }}
        >
          Remove from registry
        </MenuItem>
      </Menu>
    </Stack>
  )
}
