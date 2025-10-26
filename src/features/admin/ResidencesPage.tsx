import { useMemo, useState, useCallback, type MouseEvent } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControlLabel,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
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
import { ConfigurableTable } from '@features/search/table/ConfigurableTable'
import { type ColumnDefinition } from '../../components/table/useColumnPreferences'
import { useTranslate } from '@i18n/useTranslate'
import { useI18nStore } from '@store/i18n.store'

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

const TYPE_META_BASE: Record<ResidenceType, { defaultLabel: string; Icon: typeof HomeWorkIcon }> = {
  tower: { defaultLabel: 'High-rise', Icon: MapsHomeWorkIcon },
  villa: { defaultLabel: 'Villa', Icon: HomeWorkIcon },
  amenity: { defaultLabel: 'Amenity', Icon: MeetingRoomIcon },
  parcel: { defaultLabel: 'Parcel', Icon: SubjectIcon },
}

const STATUS_META_BASE: Record<
  ResidenceStatus,
  {
    defaultLabel: string
    color: 'success' | 'default' | 'warning'
    Icon: typeof CheckCircleOutlineIcon
  }
> = {
  occupied: { defaultLabel: 'Occupied', color: 'success', Icon: CheckCircleOutlineIcon },
  vacant: { defaultLabel: 'Vacant', color: 'default', Icon: DoNotDisturbOnIcon },
  maintenance: { defaultLabel: 'Maintenance', color: 'warning', Icon: BuildCircleIcon },
}

import residencesSeed from '../../mocks/residences.json'

const MOCK_RESIDENCES: ResidenceRecord[] = (residencesSeed as Array<Record<string, unknown>>).map(
  (r) => ({
    id: String(r.id),
    label: String(r.label),
    type: r.type as ResidenceRecord['type'],
    status: r.status as ResidenceRecord['status'],
    residents: (r.residents as string[]) ?? [],
    bedrooms: Number(r.bedrooms),
    areaSqFt: Number(r.areaSqFt),
    siteSlug: String(r.siteSlug),
    siteName: String(r.siteName),
    lastInspection: String(r.lastInspection),
  }),
)

type ResidenceFilter = 'all' | ResidenceStatus

export default function ResidencesPage() {
  const { activeSite, slug: derivedSiteSlug } = useSiteBackNavigation()
  const { t } = useTranslate()
  const language = useI18nStore((state) => state.language) ?? 'en'
  const isSiteContext = Boolean(derivedSiteSlug)

  const translate = useMemo(
    () => (key: string, defaultValue: string, options?: Record<string, unknown>) =>
      t(key, { lng: language, defaultValue, ...options }),
    [language, t],
  )

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(language, { maximumFractionDigits: 0 }),
    [language],
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

  const typeMeta = useMemo(
    () => ({
      tower: {
        label: translate('residencesPage.types.tower', TYPE_META_BASE.tower.defaultLabel),
        Icon: TYPE_META_BASE.tower.Icon,
      },
      villa: {
        label: translate('residencesPage.types.villa', TYPE_META_BASE.villa.defaultLabel),
        Icon: TYPE_META_BASE.villa.Icon,
      },
      amenity: {
        label: translate('residencesPage.types.amenity', TYPE_META_BASE.amenity.defaultLabel),
        Icon: TYPE_META_BASE.amenity.Icon,
      },
      parcel: {
        label: translate('residencesPage.types.parcel', TYPE_META_BASE.parcel.defaultLabel),
        Icon: TYPE_META_BASE.parcel.Icon,
      },
    }),
    [translate],
  )

  const statusMeta = useMemo(
    () => ({
      occupied: {
        label: translate(
          'residencesPage.statuses.occupied',
          STATUS_META_BASE.occupied.defaultLabel,
        ),
        color: STATUS_META_BASE.occupied.color,
        Icon: STATUS_META_BASE.occupied.Icon,
      },
      vacant: {
        label: translate('residencesPage.statuses.vacant', STATUS_META_BASE.vacant.defaultLabel),
        color: STATUS_META_BASE.vacant.color,
        Icon: STATUS_META_BASE.vacant.Icon,
      },
      maintenance: {
        label: translate(
          'residencesPage.statuses.maintenance',
          STATUS_META_BASE.maintenance.defaultLabel,
        ),
        color: STATUS_META_BASE.maintenance.color,
        Icon: STATUS_META_BASE.maintenance.Icon,
      },
    }),
    [translate],
  )

  const filterOptions = useMemo<Array<{ value: ResidenceFilter; label: string }>>(
    () => [
      { value: 'all', label: translate('residencesPage.filters.all', 'All residences') },
      { value: 'occupied', label: translate('residencesPage.filters.occupied', 'Occupied') },
      { value: 'vacant', label: translate('residencesPage.filters.vacant', 'Vacant') },
      {
        value: 'maintenance',
        label: translate('residencesPage.filters.maintenance', 'Under maintenance'),
      },
    ],
    [translate],
  )

  const columnLabels = useMemo(
    () => ({
      label: translate('residencesPage.table.columns.label', 'Residence'),
      status: translate('residencesPage.table.columns.status', 'Status'),
      residents: translate('residencesPage.table.columns.residents', 'Residents'),
      layout: translate('residencesPage.table.columns.layout', 'Layout'),
      site: translate('residencesPage.table.columns.site', 'Site'),
      inspection: translate('residencesPage.table.columns.inspection', 'Last inspection'),
    }),
    [translate],
  )

  const residencesTitle = translate('residencesPage.title', 'Residences')
  const residencesDescription = translate(
    'residencesPage.description',
    'Manage unit inventory, occupancy, and inspections across the portfolio.',
  )
  const siteAlertPrefix = translate(
    'residencesPage.alerts.siteScoped.prefix',
    'Residences scoped to',
  )
  const siteAlertSuffix = translate(
    'residencesPage.alerts.siteScoped.suffix',
    'Capacity, inspection schedules, and occupancy will use this property by default.',
  )
  const enterpriseAlert = translate(
    'residencesPage.alerts.enterprise',
    'Residences are only available in site-focused mode. Open a site detail page or switch your workspace to a specific community to continue.',
  )
  const searchPlaceholder = translate(
    'residencesPage.search.placeholder',
    'Search by unit, ID, or resident',
  )
  const addResidenceLabel = translate('residencesPage.actions.addResidence', 'Add residence')
  const enterpriseChipLabel = translate('residencesPage.chip.enterprise', 'Enterprise')
  const residentsEmptyLabel = translate('residencesPage.residents.empty', 'None on record')
  const layoutBedroomsNA = translate('residencesPage.layout.bedroomsNA', 'N/A')
  const inspectionFollowUpLabel = translate(
    'residencesPage.inspection.followUp',
    'Follow-up required',
  )
  const inspectionCompliantLabel = translate('residencesPage.inspection.compliant', 'Compliant')
  const tableEmptyTitle = translate('residencesPage.table.empty.title', 'No residences found')
  const tableEmptyDescription = translate(
    'residencesPage.table.empty.description',
    'Adjust your filters or add a new residence to get started.',
  )
  const noSiteTitle = translate('residencesPage.noSite.title', 'Select a site to view residences')
  const noSiteDescription = translate(
    'residencesPage.noSite.description',
    'Residences are scoped to individual communities. Choose a site from the workspace switcher or open a site detail page to access unit data.',
  )
  const browseSitesLabel = translate('residencesPage.actions.browseSites', 'Browse sites')
  const largeLayoutToggleLabel = translate(
    'residencesPage.filters.largeLayout',
    'Large layouts (3+ BR)',
  )
  const noResidentsToggleLabel = translate(
    'residencesPage.filters.noResidents',
    'No residents on file',
  )

  const activeSiteName = activeSite?.name ?? derivedSiteSlug ?? null

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<ResidenceFilter>('all')
  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null)
  const [showLargeLayoutsOnly, setShowLargeLayoutsOnly] = useState(false)
  const [showUnassignedResidencesOnly, setShowUnassignedResidencesOnly] = useState(false)

  const filterButtonLabel = useMemo(() => {
    return (
      filterOptions.find((option) => option.value === filter)?.label ??
      filterOptions[0]?.label ??
      translate('residencesPage.filters.all', 'All residences')
    )
  }, [filter, filterOptions, translate])

  const filteredResidences = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return MOCK_RESIDENCES.filter((residence) => {
      if (derivedSiteSlug && residence.siteSlug !== derivedSiteSlug) {
        return false
      }
      if (filter === 'occupied' || filter === 'vacant' || filter === 'maintenance') {
        if (residence.status !== filter) {
          return false
        }
      }
      if (showLargeLayoutsOnly && residence.bedrooms < 3 && residence.areaSqFt < 2000) {
        return false
      }
      if (showUnassignedResidencesOnly && residence.residents.length > 0) {
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
  }, [derivedSiteSlug, filter, search, showLargeLayoutsOnly, showUnassignedResidencesOnly])

  const handleOpenFilterMenu = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setFilterAnchor(event.currentTarget)
  }, [])

  const handleCloseFilterMenu = useCallback(() => setFilterAnchor(null), [])

  const handleSelectFilter = useCallback((value: ResidenceFilter) => {
    setFilter(value)
    setFilterAnchor(null)
  }, [])

  const columnDefs = useMemo<ColumnDefinition<ResidenceRecord>[]>(() => {
    const currentSlug = derivedSiteSlug ?? null
    return [
      {
        id: 'label',
        label: columnLabels.label,
        minWidth: 220,
        disableToggle: true,
        render: (residence: ResidenceRecord) => {
          const meta = typeMeta[residence.type]
          return (
            <Stack spacing={0.5}>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <meta.Icon fontSize="small" color="action" />
                <Typography variant="subtitle2" fontWeight={600}>
                  {residence.label}
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {translate('residencesPage.table.idPrefix', 'ID {{id}}', {
                  id: residence.id,
                })}
              </Typography>
            </Stack>
          )
        },
      },
      {
        id: 'status',
        label: columnLabels.status,
        minWidth: 140,
        render: (residence: ResidenceRecord) => {
          const meta = statusMeta[residence.status]
          return (
            <Chip
              size="small"
              color={meta.color}
              icon={<meta.Icon fontSize="small" />}
              label={meta.label}
              variant={residence.status === 'vacant' ? 'outlined' : 'filled'}
            />
          )
        },
      },
      {
        id: 'residents',
        label: columnLabels.residents,
        minWidth: 200,
        render: (residence: ResidenceRecord) => (
          <Stack spacing={0.3}>
            {residence.residents.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {residentsEmptyLabel}
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
        label: columnLabels.layout,
        minWidth: 140,
        render: (residence: ResidenceRecord) => (
          <Stack spacing={0.2}>
            <Typography variant="body2" fontWeight={600}>
              {residence.bedrooms > 0
                ? translate('residencesPage.layout.bedroomsValue', '{{count}} BR', {
                    count: residence.bedrooms,
                  })
                : layoutBedroomsNA}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {translate('residencesPage.layout.area', '{{value}} sq ft', {
                value: numberFormatter.format(residence.areaSqFt),
              })}
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'site',
        label: columnLabels.site,
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
        label: columnLabels.inspection,
        minWidth: 160,
        render: (residence: ResidenceRecord) => (
          <Stack spacing={0.2}>
            <Typography variant="body2" fontWeight={600}>
              {dateFormatter.format(new Date(residence.lastInspection))}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {residence.status === 'maintenance'
                ? inspectionFollowUpLabel
                : inspectionCompliantLabel}
            </Typography>
          </Stack>
        ),
      },
    ]
  }, [
    columnLabels,
    dateFormatter,
    derivedSiteSlug,
    inspectionCompliantLabel,
    inspectionFollowUpLabel,
    layoutBedroomsNA,
    numberFormatter,
    residentsEmptyLabel,
    statusMeta,
    translate,
    typeMeta,
  ])

  return (
    <Stack spacing={3}>
      {isSiteContext && activeSiteName ? (
        <Alert
          severity="info"
          icon={<AddHomeWorkIcon fontSize="inherit" />}
          sx={{ alignItems: 'center', borderRadius: 2 }}
        >
          <Typography variant="body2">
            {siteAlertPrefix} <strong>{activeSiteName}</strong>. {siteAlertSuffix}
          </Typography>
        </Alert>
      ) : (
        <Alert
          severity="info"
          icon={<AddHomeWorkIcon fontSize="inherit" />}
          sx={{ alignItems: 'center', borderRadius: 2 }}
        >
          <Typography variant="body2">{enterpriseAlert}</Typography>
        </Alert>
      )}

      {isSiteContext ? (
        <>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <ConfigurableTable<ResidenceRecord>
              storageKey="hex:columns:residences"
              columns={columnDefs}
              rows={filteredResidences}
              getRowId={(residence) => residence.id}
              size="small"
              emptyState={{
                title: tableEmptyTitle,
                description: tableEmptyDescription,
                action: (
                  <Button variant="contained" startIcon={<HomeWorkIcon />}>
                    {addResidenceLabel}
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
                          {residencesTitle}
                        </Typography>
                        {isSiteContext && activeSiteName ? (
                          <Chip label={activeSiteName} size="small" color="secondary" />
                        ) : (
                          <Chip label={enterpriseChipLabel} size="small" color="primary" />
                        )}
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {residencesDescription}
                      </Typography>
                    </Box>
                    <Box sx={{ flexShrink: 0 }}>
                      <Button variant="contained" startIcon={<HomeWorkIcon />}>
                        {addResidenceLabel}
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
                      onClick={handleOpenFilterMenu}
                      color={filter === 'all' ? 'inherit' : 'primary'}
                    >
                      {filterButtonLabel}
                    </Button>
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={showLargeLayoutsOnly}
                          onChange={(event) => setShowLargeLayoutsOnly(event.target.checked)}
                        />
                      }
                      label={largeLayoutToggleLabel}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={showUnassignedResidencesOnly}
                          onChange={(event) =>
                            setShowUnassignedResidencesOnly(event.target.checked)
                          }
                        />
                      }
                      label={noResidentsToggleLabel}
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
            anchorEl={filterAnchor}
            open={Boolean(filterAnchor)}
            onClose={handleCloseFilterMenu}
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
        </>
      ) : (
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Stack spacing={2} alignItems="flex-start">
            <Typography variant="h6">{noSiteTitle}</Typography>
            <Typography variant="body2" color="text.secondary">
              {noSiteDescription}
            </Typography>
            <Button variant="contained" component={RouterLink} to="/admin/sites">
              {browseSitesLabel}
            </Button>
          </Stack>
        </Paper>
      )}
    </Stack>
  )
}
