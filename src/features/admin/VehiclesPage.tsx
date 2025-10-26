import { useCallback, useMemo, useState, type MouseEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Switch,
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
import type { ColumnDefinition } from '../../components/table/useColumnPreferences'
import { ConfigurableTable } from '@features/search/table/ConfigurableTable'
import { useTranslate } from '@i18n/useTranslate'
import { useI18nStore } from '@store/i18n.store'

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

type VehicleFilter = 'all' | VehicleUsage

const USAGE_META_BASE: Record<
  VehicleUsage,
  {
    defaultLabel: string
    Icon: typeof HomeIcon
    color: 'default' | 'primary' | 'secondary' | 'info'
  }
> = {
  resident: { defaultLabel: 'Resident', Icon: HomeIcon, color: 'primary' },
  visitor: { defaultLabel: 'Visitor', Icon: HandshakeIcon, color: 'secondary' },
  service: { defaultLabel: 'Service', Icon: BuildCircleIcon, color: 'info' },
}

const STATUS_META_BASE: Record<
  VehicleStatus,
  {
    defaultLabel: string
    color: 'success' | 'warning' | 'error'
    Icon: typeof CheckCircleOutlineIcon
  }
> = {
  active: { defaultLabel: 'Active', color: 'success', Icon: CheckCircleOutlineIcon },
  expired: { defaultLabel: 'Expired permit', color: 'warning', Icon: UpdateIcon },
  flagged: { defaultLabel: 'Flagged', color: 'error', Icon: ReportIcon },
}

export default function VehiclesPage() {
  const { activeSite, slug: derivedSiteSlug } = useSiteBackNavigation()
  const isSiteContext = Boolean(derivedSiteSlug)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<VehicleFilter>('all')
  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null)
  const [statusFilterAnchor, setStatusFilterAnchor] = useState<HTMLElement | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | VehicleStatus>('all')
  const [showHighPassesOnly, setShowHighPassesOnly] = useState(false)
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
      if (filter === 'resident' || filter === 'visitor' || filter === 'service') {
        if (vehicle.usage !== filter) return false
      }
      if (statusFilter !== 'all' && vehicle.status !== statusFilter) {
        return false
      }
      if (showHighPassesOnly && vehicle.passesIssued < 5) {
        return false
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
  }, [derivedSiteSlug, filter, search, showHighPassesOnly, statusFilter])

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
  const { t } = useTranslate()
  const language = useI18nStore((state) => state.language) ?? 'en'

  const translate = useMemo(
    () => (key: string, defaultValue: string, options?: Record<string, unknown>) =>
      t(key, { lng: language, defaultValue, ...options }),
    [language, t],
  )

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(language, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    [language],
  )

  const timeFormatter = useMemo(
    () => new Intl.DateTimeFormat(language, { hour: 'numeric', minute: '2-digit' }),
    [language],
  )

  const usageMeta = useMemo(
    () => ({
      resident: {
        label: translate('vehiclesPage.usage.resident', USAGE_META_BASE.resident.defaultLabel),
        Icon: USAGE_META_BASE.resident.Icon,
        color: USAGE_META_BASE.resident.color,
      },
      visitor: {
        label: translate('vehiclesPage.usage.visitor', USAGE_META_BASE.visitor.defaultLabel),
        Icon: USAGE_META_BASE.visitor.Icon,
        color: USAGE_META_BASE.visitor.color,
      },
      service: {
        label: translate('vehiclesPage.usage.service', USAGE_META_BASE.service.defaultLabel),
        Icon: USAGE_META_BASE.service.Icon,
        color: USAGE_META_BASE.service.color,
      },
    }),
    [translate],
  )

  const statusMeta = useMemo(
    () => ({
      active: {
        label: translate('vehiclesPage.statuses.active', STATUS_META_BASE.active.defaultLabel),
        color: STATUS_META_BASE.active.color,
        Icon: STATUS_META_BASE.active.Icon,
      },
      expired: {
        label: translate('vehiclesPage.statuses.expired', STATUS_META_BASE.expired.defaultLabel),
        color: STATUS_META_BASE.expired.color,
        Icon: STATUS_META_BASE.expired.Icon,
      },
      flagged: {
        label: translate('vehiclesPage.statuses.flagged', STATUS_META_BASE.flagged.defaultLabel),
        color: STATUS_META_BASE.flagged.color,
        Icon: STATUS_META_BASE.flagged.Icon,
      },
    }),
    [translate],
  )

  const filterOptions = useMemo<Array<{ value: VehicleFilter; label: string }>>(
    () => [
      { value: 'all', label: translate('vehiclesPage.filters.all', 'All vehicles') },
      {
        value: 'resident',
        label: translate('vehiclesPage.filters.resident', 'Resident vehicles'),
      },
      {
        value: 'visitor',
        label: translate('vehiclesPage.filters.visitor', 'Visitor vehicles'),
      },
      {
        value: 'service',
        label: translate('vehiclesPage.filters.service', 'Service vendors'),
      },
    ],
    [translate],
  )

  const statusFilterOptions = useMemo(
    () =>
      [
        { value: 'all', label: translate('vehiclesPage.statusFilter.all', 'Any status') },
        { value: 'active', label: translate('vehiclesPage.filters.active', 'Active permits') },
        { value: 'expired', label: translate('vehiclesPage.filters.expired', 'Expired permits') },
        {
          value: 'flagged',
          label: translate('vehiclesPage.filters.flagged', 'Flagged for review'),
        },
      ] as const,
    [translate],
  )

  const columnLabels = useMemo(
    () => ({
      plate: translate('vehiclesPage.table.columns.plate', 'Plate'),
      vehicle: translate('vehiclesPage.table.columns.vehicle', 'Vehicle'),
      usage: translate('vehiclesPage.table.columns.usage', 'Usage'),
      assignedTo: translate('vehiclesPage.table.columns.assignedTo', 'Assigned to'),
      site: translate('vehiclesPage.table.columns.site', 'Site'),
      permit: translate('vehiclesPage.table.columns.permit', 'Permit'),
      lastSeen: translate('vehiclesPage.table.columns.lastSeen', 'Last seen'),
      status: translate('vehiclesPage.table.columns.status', 'Status'),
      actions: translate('vehiclesPage.table.columns.actions', 'Actions'),
    }),
    [translate],
  )

  const vehiclesTitle = translate('vehiclesPage.title', 'Vehicle registry')
  const vehiclesDescription = translate(
    'vehiclesPage.description',
    'Register resident, visitor, and service vehicles to keep guard kiosks synced.',
  )
  const siteAlertPrefix = translate(
    'vehiclesPage.alerts.siteScoped.prefix',
    'Showing vehicles scoped to',
  )
  const siteAlertSuffix = translate(
    'vehiclesPage.alerts.siteScoped.suffix',
    'Registration flows will prefill permits and contact info for this property.',
  )
  const enterpriseAlert = translate(
    'vehiclesPage.alerts.enterprise',
    'Switch to a site to manage permits at the property level or stay in enterprise mode to audit all registered vehicles.',
  )
  const enterpriseChipLabel = translate('vehiclesPage.chip.enterprise', 'Enterprise')
  const searchPlaceholder = translate(
    'vehiclesPage.search.placeholder',
    'Search by plate, permit, or contact',
  )
  const registerVehicleLabel = translate('vehiclesPage.actions.registerVehicle', 'Register vehicle')
  const downloadPermitLabel = translate('vehiclesPage.actions.downloadPermit', 'Download permit')
  const moreActionsLabel = translate('vehiclesPage.actions.moreActions', 'More actions')
  const flagForReviewLabel = translate('vehiclesPage.actions.flagForReview', 'Flag for review')
  const removeFromRegistryLabel = translate(
    'vehiclesPage.actions.removeFromRegistry',
    'Remove from registry',
  )
  const noVehiclesTitle = translate('vehiclesPage.table.empty.title', 'No vehicles found')
  const noVehiclesDescription = translate(
    'vehiclesPage.table.empty.description',
    'Adjust filters or register a vehicle to populate this list.',
  )

  const handleDownloadPermit = useCallback(() => {
    handleCloseRowMenu()
  }, [handleCloseRowMenu])

  const handleFlagVehicle = useCallback(() => {
    handleCloseRowMenu()
  }, [handleCloseRowMenu])

  const filterButtonLabel = useMemo(() => {
    return (
      filterOptions.find((option) => option.value === filter)?.label ??
      filterOptions[0]?.label ??
      translate('vehiclesPage.filters.all', 'All vehicles')
    )
  }, [filter, filterOptions, translate])

  const statusFilterLabel = useMemo(() => {
    return (
      statusFilterOptions.find((option) => option.value === statusFilter)?.label ??
      statusFilterOptions[0]?.label ??
      translate('vehiclesPage.statusFilter.all', 'Any status')
    )
  }, [statusFilter, statusFilterOptions, translate])

  const highPassToggleLabel = translate('vehiclesPage.filters.highPasses', 'High kiosk usage')

  const columnDefs = useMemo<ColumnDefinition<VehicleRecord>[]>(() => {
    const currentSlug = derivedSiteSlug ?? null
    return [
      {
        id: 'plate',
        label: columnLabels.plate,
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
        label: columnLabels.vehicle,
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
        label: columnLabels.usage,
        minWidth: 160,
        render: (vehicle) => {
          const meta = usageMeta[vehicle.usage]
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
        label: columnLabels.assignedTo,
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
        label: columnLabels.site,
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
        label: columnLabels.permit,
        minWidth: 140,
        render: (vehicle) => (
          <Stack spacing={0.2}>
            <Typography variant="body2" fontWeight={600}>
              {vehicle.permitId}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {translate('vehiclesPage.permit.passesIssued', '{{count}} passes issued', {
                count: vehicle.passesIssued,
              })}
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'lastSeen',
        label: columnLabels.lastSeen,
        minWidth: 160,
        render: (vehicle) => (
          <Stack spacing={0.2}>
            <Typography variant="body2">
              {dateFormatter.format(new Date(vehicle.lastSeen))}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {timeFormatter.format(new Date(vehicle.lastSeen))}
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'status',
        label: columnLabels.status,
        minWidth: 150,
        render: (vehicle) => {
          const meta = statusMeta[vehicle.status]
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
        label: columnLabels.actions,
        disableToggle: true,
        align: 'right',
        minWidth: 160,
        render: (vehicle) => (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Tooltip title={downloadPermitLabel}>
              <IconButton size="small" onClick={handleDownloadPermit}>
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={moreActionsLabel}>
              <IconButton size="small" onClick={(event) => handleOpenRowMenu(event, vehicle)}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ]
  }, [
    columnLabels,
    dateFormatter,
    derivedSiteSlug,
    downloadPermitLabel,
    handleDownloadPermit,
    handleOpenRowMenu,
    moreActionsLabel,
    statusMeta,
    timeFormatter,
    translate,
    usageMeta,
  ])

  const activeSiteName = activeSite?.name ?? derivedSiteSlug ?? null

  return (
    <Stack spacing={3}>
      {isSiteContext && activeSiteName ? (
        <Alert
          severity="info"
          icon={<DirectionsCarFilledIcon fontSize="inherit" />}
          sx={{ alignItems: 'center', borderRadius: 2 }}
        >
          <Typography variant="body2">
            {siteAlertPrefix} <strong>{activeSiteName}</strong>. {siteAlertSuffix}
          </Typography>
        </Alert>
      ) : (
        <Alert
          severity="info"
          icon={<DirectionsCarFilledIcon fontSize="inherit" />}
          sx={{ alignItems: 'center', borderRadius: 2 }}
        >
          <Typography variant="body2">{enterpriseAlert}</Typography>
        </Alert>
      )}

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <ConfigurableTable<VehicleRecord>
          storageKey="hex:columns:vehicles"
          columns={columnDefs}
          rows={filteredVehicles}
          getRowId={(vehicle) => vehicle.id}
          size="small"
          emptyState={{
            title: noVehiclesTitle,
            description: noVehiclesDescription,
            action: (
              <Button variant="contained" startIcon={<DirectionsCarFilledIcon />}>
                {registerVehicleLabel}
              </Button>
            ),
          }}
          renderToolbar={({ ColumnPreferencesTrigger }) => (
            <Stack spacing={3}>
              <Stack
                direction="row"
                alignItems="flex-start"
                justifyContent="space-between"
                flexWrap="wrap"
                gap={2}
              >
                <Box sx={{ flex: '1 1 240px' }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Typography variant="h5" fontWeight={600}>
                      {vehiclesTitle}
                    </Typography>
                    {isSiteContext && activeSiteName ? (
                      <Chip label={activeSiteName} size="small" color="secondary" />
                    ) : (
                      <Chip label={enterpriseChipLabel} size="small" color="primary" />
                    )}
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {vehiclesDescription}
                  </Typography>
                </Box>
                <Box sx={{ flexShrink: 0 }}>
                  <Button variant="contained" startIcon={<DirectionsCarFilledIcon />}>
                    {registerVehicleLabel}
                  </Button>
                </Box>
              </Stack>

              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                flexWrap="wrap"
                rowGap={1}
                sx={{ width: '100%' }}
              >
                {ColumnPreferencesTrigger}
                <Button
                  variant="outlined"
                  startIcon={<CheckCircleOutlineIcon />}
                  onClick={(event) => setStatusFilterAnchor(event.currentTarget)}
                  color={statusFilter === 'all' ? 'inherit' : 'primary'}
                >
                  {statusFilterLabel}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={handleOpenFilterMenu}
                  color={filter === 'all' ? 'inherit' : 'primary'}
                >
                  {filterButtonLabel}
                </Button>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={showHighPassesOnly}
                      onChange={(event) => setShowHighPassesOnly(event.target.checked)}
                    />
                  }
                  label={highPassToggleLabel}
                  sx={{ ml: 0 }}
                />
              </Stack>

              <TextField
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          )}
        />
      </Paper>

      <Menu
        anchorEl={statusFilterAnchor}
        open={Boolean(statusFilterAnchor)}
        onClose={() => setStatusFilterAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {statusFilterOptions.map((option) => (
          <MenuItem
            key={option.value}
            selected={statusFilter === option.value}
            onClick={() => {
              setStatusFilter(option.value)
              setStatusFilterAnchor(null)
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={handleCloseFilterMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {filterOptions.map((option) => (
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
        <MenuItem onClick={handleDownloadPermit}>{downloadPermitLabel}</MenuItem>
        <MenuItem onClick={handleFlagVehicle}>{flagForReviewLabel}</MenuItem>
        <MenuItem
          onClick={() => {
            handleCloseRowMenu()
          }}
        >
          {removeFromRegistryLabel}
        </MenuItem>
      </Menu>
    </Stack>
  )
}
