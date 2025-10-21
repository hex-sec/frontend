import { useMemo, useState, useCallback, type MouseEvent } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
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
  Typography,
  InputAdornment,
} from '@mui/material'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWork'
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn'
import BuildCircleIcon from '@mui/icons-material/BuildCircle'
import SearchIcon from '@mui/icons-material/Search'
import AddHomeWorkIcon from '@mui/icons-material/AddHomeWork'
import SubjectIcon from '@mui/icons-material/Subject'
import { useSiteBackNavigation } from '@app/layout/useSiteBackNavigation'
import { ColumnPreferencesButton } from '../../components/table/ColumnPreferencesButton'
import {
  useColumnPreferences,
  type ColumnDefinition,
} from '../../components/table/useColumnPreferences'

const SQFT_FORMATTER = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

type ResidenceStatus = 'occupied' | 'vacant' | 'maintenance'
type ResidenceType = 'tower' | 'villa' | 'amenity' | 'parcel'

type ResidenceRecord = {
  id: string
  label: string
  type: ResidenceType
  status: ResidenceStatus
  residents: string[]
  bedrooms: number
  areaSqFt: number
  siteSlug: string
  siteName: string
  lastInspection: string
}

const TYPE_META: Record<ResidenceType, { label: string; Icon: typeof HomeWorkIcon }> = {
  tower: { label: 'High-rise', Icon: MapsHomeWorkIcon },
  villa: { label: 'Villa', Icon: HomeWorkIcon },
  amenity: { label: 'Amenity', Icon: MeetingRoomIcon },
  parcel: { label: 'Parcel', Icon: SubjectIcon },
}

const STATUS_META: Record<
  ResidenceStatus,
  { label: string; color: 'success' | 'default' | 'warning'; Icon: typeof CheckCircleOutlineIcon }
> = {
  occupied: { label: 'Occupied', color: 'success', Icon: CheckCircleOutlineIcon },
  vacant: { label: 'Vacant', color: 'default', Icon: DoNotDisturbOnIcon },
  maintenance: { label: 'Maintenance', color: 'warning', Icon: BuildCircleIcon },
}

const MOCK_RESIDENCES: ResidenceRecord[] = [
  {
    id: 'UNIT-TA-1408',
    label: 'Tower A · 1408',
    type: 'tower',
    status: 'occupied',
    residents: ['Carla Jenkins', 'Luis Jenkins'],
    bedrooms: 3,
    areaSqFt: 1820,
    siteSlug: 'vista-azul',
    siteName: 'Vista Azul',
    lastInspection: '2025-09-22',
  },
  {
    id: 'UNIT-TA-PH3',
    label: 'Tower A · Penthouse 3',
    type: 'tower',
    status: 'vacant',
    residents: [],
    bedrooms: 4,
    areaSqFt: 2450,
    siteSlug: 'vista-azul',
    siteName: 'Vista Azul',
    lastInspection: '2025-10-05',
  },
  {
    id: 'VIL-08',
    label: 'Villa 08',
    type: 'villa',
    status: 'maintenance',
    residents: ['Temporary housing'],
    bedrooms: 5,
    areaSqFt: 3210,
    siteSlug: 'los-olivos',
    siteName: 'Los Olivos',
    lastInspection: '2025-10-11',
  },
  {
    id: 'VIL-11',
    label: 'Villa 11',
    type: 'villa',
    status: 'occupied',
    residents: ['Francisco Mendez'],
    bedrooms: 4,
    areaSqFt: 2980,
    siteSlug: 'los-olivos',
    siteName: 'Los Olivos',
    lastInspection: '2025-09-28',
  },
  {
    id: 'AMN-CLB',
    label: 'Clubhouse',
    type: 'amenity',
    status: 'occupied',
    residents: ['Community events'],
    bedrooms: 0,
    areaSqFt: 5400,
    siteSlug: 'vista-azul',
    siteName: 'Vista Azul',
    lastInspection: '2025-09-30',
  },
  {
    id: 'PRC-12',
    label: 'Parcel · 12',
    type: 'parcel',
    status: 'vacant',
    residents: [],
    bedrooms: 0,
    areaSqFt: 4200,
    siteSlug: 'los-olivos',
    siteName: 'Los Olivos',
    lastInspection: '2025-08-19',
  },
]

type ResidenceFilter = 'all' | ResidenceStatus

const FILTER_OPTIONS: Array<{ value: ResidenceFilter; label: string }> = [
  { value: 'all', label: 'All residences' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'vacant', label: 'Vacant' },
  { value: 'maintenance', label: 'Under maintenance' },
]

export default function ResidencesPage() {
  const { activeSite, slug: derivedSiteSlug } = useSiteBackNavigation()
  const activeSiteName = activeSite?.name ?? derivedSiteSlug ?? null
  const isSiteContext = Boolean(derivedSiteSlug)

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<ResidenceFilter>('all')
  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null)

  const filteredResidences = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return MOCK_RESIDENCES.filter((residence) => {
      if (derivedSiteSlug && residence.siteSlug !== derivedSiteSlug) {
        return false
      }
      if (filter !== 'all' && residence.status !== filter) {
        return false
      }
      if (!needle) return true
      const residentsJoined = residence.residents.join(' ').toLowerCase()
      return (
        residence.label.toLowerCase().includes(needle) ||
        residence.id.toLowerCase().includes(needle) ||
        residentsJoined.includes(needle)
      )
    })
  }, [derivedSiteSlug, filter, search])

  const handleOpenFilterMenu = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setFilterAnchor(event.currentTarget)
  }, [])

  const handleCloseFilterMenu = useCallback(() => setFilterAnchor(null), [])

  const columnDefs = useMemo<ColumnDefinition<ResidenceRecord>[]>(() => {
    const currentSlug = derivedSiteSlug ?? null
    return [
      {
        id: 'label',
        label: 'Residence',
        minWidth: 220,
        disableToggle: true,
        render: (residence: ResidenceRecord) => {
          const typeMeta = TYPE_META[residence.type]
          return (
            <Stack spacing={0.5}>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <typeMeta.Icon fontSize="small" color="action" />
                <Typography variant="subtitle2" fontWeight={600}>
                  {residence.label}
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                ID {residence.id}
              </Typography>
            </Stack>
          )
        },
      },
      {
        id: 'status',
        label: 'Status',
        minWidth: 140,
        render: (residence: ResidenceRecord) => {
          const statusMeta = STATUS_META[residence.status]
          return (
            <Chip
              size="small"
              color={statusMeta.color}
              icon={<statusMeta.Icon fontSize="small" />}
              label={statusMeta.label}
              variant={residence.status === 'vacant' ? 'outlined' : 'filled'}
            />
          )
        },
      },
      {
        id: 'residents',
        label: 'Residents',
        minWidth: 200,
        render: (residence: ResidenceRecord) => (
          <Stack spacing={0.3}>
            {residence.residents.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                None on record
              </Typography>
            ) : (
              residence.residents.map((name: string) => (
                <Typography key={name} variant="body2">
                  {name}
                </Typography>
              ))
            )}
          </Stack>
        ),
      },
      {
        id: 'layout',
        label: 'Layout',
        minWidth: 140,
        render: (residence: ResidenceRecord) => (
          <Stack spacing={0.2}>
            <Typography variant="body2" fontWeight={600}>
              {residence.bedrooms > 0 ? `${residence.bedrooms} BR` : 'N/A'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {SQFT_FORMATTER.format(residence.areaSqFt)} sq ft
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'site',
        label: 'Site',
        minWidth: 160,
        render: (residence: ResidenceRecord) => (
          <Chip
            label={residence.siteName}
            size="small"
            color={currentSlug && residence.siteSlug === currentSlug ? 'secondary' : 'default'}
          />
        ),
      },
      {
        id: 'inspection',
        label: 'Last inspection',
        minWidth: 160,
        render: (residence: ResidenceRecord) => (
          <Stack spacing={0.2}>
            <Typography variant="body2" fontWeight={600}>
              {DATE_FORMATTER.format(new Date(residence.lastInspection))}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {residence.status === 'maintenance' ? 'Follow-up required' : 'Compliant'}
            </Typography>
          </Stack>
        ),
      },
    ]
  }, [derivedSiteSlug])

  const {
    orderedColumns,
    visibleColumns,
    hiddenColumns,
    toggleColumnVisibility,
    moveColumn,
    resetColumns,
  } = useColumnPreferences<ResidenceRecord>('hex:columns:residences', columnDefs)

  return (
    <Stack spacing={3}>
      {isSiteContext && activeSiteName ? (
        <Alert
          severity="info"
          icon={<AddHomeWorkIcon fontSize="inherit" />}
          sx={{ alignItems: 'center', borderRadius: 2 }}
        >
          Residences scoped to <strong>{activeSiteName}</strong>. Capacity, inspection schedules,
          and occupancy will use this property by default.
        </Alert>
      ) : (
        <Alert
          severity="info"
          icon={<AddHomeWorkIcon fontSize="inherit" />}
          sx={{ alignItems: 'center', borderRadius: 2 }}
        >
          Residences are only available in site-focused mode. Open a site detail page or switch your
          workspace to a specific community to continue.
        </Alert>
      )}

      {isSiteContext ? (
        <>
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
                      Residences
                    </Typography>
                    {isSiteContext && activeSiteName ? (
                      <Chip label={activeSiteName} size="small" color="secondary" />
                    ) : (
                      <Chip label="Enterprise" size="small" color="primary" />
                    )}
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Manage unit inventory, occupancy, and inspections across the portfolio.
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
                    onClick={handleOpenFilterMenu}
                    color={filter === 'all' ? 'inherit' : 'primary'}
                  >
                    {FILTER_OPTIONS.find((option) => option.value === filter)?.label ??
                      'All residences'}
                  </Button>
                  <Button variant="contained" startIcon={<HomeWorkIcon />}>
                    Add residence
                  </Button>
                </Stack>
              </Stack>

              <TextField
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by unit, ID, or resident"
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
                      {visibleColumns.map((column: ColumnDefinition<ResidenceRecord>) => (
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
                    {filteredResidences.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={visibleColumns.length || 1}>
                          <Stack spacing={1} alignItems="center" sx={{ py: 5 }}>
                            <Typography variant="subtitle1">No residences found</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Adjust your filters or add a new residence to get started.
                            </Typography>
                            <Button variant="contained" startIcon={<HomeWorkIcon />}>
                              Add residence
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredResidences.map((residence: ResidenceRecord) => (
                        <TableRow key={residence.id} hover>
                          {visibleColumns.map((column: ColumnDefinition<ResidenceRecord>) => (
                            <TableCell
                              key={column.id}
                              align={column.align}
                              sx={{ minWidth: column.minWidth }}
                            >
                              {column.render(residence)}
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
          >
            {FILTER_OPTIONS.map((option) => (
              <MenuItem
                key={option.value}
                selected={filter === option.value}
                onClick={() => {
                  setFilter(option.value)
                  handleCloseFilterMenu()
                }}
              >
                {option.label}
              </MenuItem>
            ))}
          </Menu>
        </>
      ) : (
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Stack spacing={2} alignItems="flex-start">
            <Typography variant="h6">Select a site to view residences</Typography>
            <Typography variant="body2" color="text.secondary">
              Residences are scoped to individual communities. Choose a site from the workspace
              switcher or open a site detail page to access unit data.
            </Typography>
            <Button variant="contained" component={RouterLink} to="/admin/sites">
              Browse sites
            </Button>
          </Stack>
        </Paper>
      )}
    </Stack>
  )
}
