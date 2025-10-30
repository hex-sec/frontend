import { useMemo, useState, useCallback, type MouseEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Alert,
  Button,
  Chip,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  ListItemIcon,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
  Snackbar,
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import VisibilityIcon from '@mui/icons-material/Visibility'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { useSiteBackNavigation } from '@app/layout/useSiteBackNavigation'
import { useSiteStore } from '@store/site.store'
import { ConfigurableTable } from '@features/search/table/ConfigurableTable'
import { type ColumnDefinition } from '../../components/table/useColumnPreferences'
import { useTranslate } from '@i18n/useTranslate'
import { useI18nStore } from '@store/i18n.store'
import PageHeader from './components/PageHeader'

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
  const navigate = useNavigate()
  const location = useLocation()
  const { activeSite, slug: derivedSiteSlug } = useSiteBackNavigation()
  const { sites } = useSiteStore()
  const { t } = useTranslate()
  const language = useI18nStore((state) => state.language) ?? 'en'
  const isSiteContext = Boolean(derivedSiteSlug)

  const isAdminSitesRoute = location.pathname.startsWith('/admin/sites/')
  const handleRowClick = useCallback(
    (residence: ResidenceRecord) => {
      if (isAdminSitesRoute && derivedSiteSlug) {
        navigate(`/admin/sites/${derivedSiteSlug}/residences/${residence.id}`)
        return
      }
      const baseUrl = derivedSiteSlug ? `/site/${derivedSiteSlug}` : '/admin'
      navigate(`${baseUrl}/residences/${residence.id}`)
    },
    [navigate, derivedSiteSlug, isAdminSitesRoute],
  )
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [rowMenu, setRowMenu] = useState<{
    anchor: HTMLElement | null
    residence?: ResidenceRecord
  }>({ anchor: null, residence: undefined })
  const [statusOverrides, setStatusOverrides] = useState<Map<string, ResidenceStatus>>(new Map())
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set())
  const [feedback, setFeedback] = useState<{ open: boolean; message: string } | null>(null)

  // Site filter state - auto-populate from context
  const [siteFilter, setSiteFilter] = useState<string>(() => {
    if (derivedSiteSlug) return derivedSiteSlug
    return 'all'
  })

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

  // PageHeader props
  const badges = useMemo(() => {
    const b = []
    if (isSiteContext && activeSiteName) {
      b.push({ label: activeSiteName, color: 'secondary' as const })
    } else if (siteFilter !== 'all') {
      const site = sites.find((s) => s.slug === siteFilter)
      if (site) {
        b.push({ label: site.name, color: 'secondary' as const })
      }
    } else {
      b.push({ label: enterpriseChipLabel, color: 'primary' as const })
    }
    return b
  }, [isSiteContext, activeSiteName, siteFilter, sites, enterpriseChipLabel])

  const rightActions = (
    <Button variant="contained" startIcon={<HomeWorkIcon />}>
      {addResidenceLabel}
    </Button>
  )

  const mobileBackButton = (
    <IconButton size="small" onClick={() => navigate(-1)} sx={{ color: 'inherit' }}>
      <ArrowBackIcon />
    </IconButton>
  )

  const mobileActions = (
    <IconButton size="small" color="primary" aria-label={addResidenceLabel}>
      <HomeWorkIcon fontSize="small" />
    </IconButton>
  )

  const activeMeta = useMemo(
    () => ({
      siteHint: (siteName: string) =>
        t('residencesPage.meta.siteHint', {
          lng: language,
          siteName,
          defaultValue: `Showing residences for ${siteName}.`,
        }),
    }),
    [language, t],
  )

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
      if (removedIds.has(residence.id)) return false
      if (siteFilter !== 'all' && residence.siteSlug !== siteFilter) {
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
  }, [siteFilter, filter, search, showLargeLayoutsOnly, showUnassignedResidencesOnly, removedIds])

  const handleOpenRowMenu = useCallback(
    (event: MouseEvent<HTMLButtonElement>, residence: ResidenceRecord) => {
      event.stopPropagation()
      setRowMenu({ anchor: event.currentTarget, residence })
    },
    [],
  )

  const handleCloseRowMenu = useCallback(
    () => setRowMenu({ anchor: null, residence: undefined }),
    [],
  )

  const handleCopyToClipboard = useCallback((value?: string) => {
    if (!value) return
    try {
      void navigator.clipboard.writeText(value)
      setFeedback({ open: true, message: value })
    } catch {
      /* noop */
    }
  }, [])

  const handleMarkStatus = useCallback((residence: ResidenceRecord, next: ResidenceStatus) => {
    setStatusOverrides((prev) => {
      const map = new Map(prev)
      map.set(residence.id, next)
      return map
    })
    const label = next === 'occupied' ? 'Occupied' : next === 'vacant' ? 'Vacant' : 'Maintenance'
    setFeedback({ open: true, message: `${label} • ${residence.label}` })
  }, [])

  const handleRemoveResidence = useCallback((residence: ResidenceRecord) => {
    setRemovedIds((prev) => new Set(prev).add(residence.id))
    setFeedback({ open: true, message: `Removed • ${residence.label}` })
  }, [])

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
          const effective = statusOverrides.get(residence.id) ?? residence.status
          const meta = statusMeta[effective]
          return (
            <Chip
              size="small"
              color={meta.color}
              icon={<meta.Icon fontSize="small" />}
              label={meta.label}
              variant={effective === 'vacant' ? 'outlined' : 'filled'}
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
      {
        id: 'actions',
        label: translate('residencesPage.table.columns.actions', 'Actions'),
        minWidth: 160,
        align: 'right',
        disableToggle: true,
        render: (residence: ResidenceRecord) => (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Tooltip title={translate('usersPage.rowMenu.viewProfile', 'View profile')}>
              <Button size="small" variant="outlined" onClick={() => handleRowClick(residence)}>
                {translate('usersPage.rowMenu.viewProfile', 'View profile')}
              </Button>
            </Tooltip>
            <Tooltip title={translate('visitsPage.actions.moreActions', 'More actions')}>
              <IconButton size="small" onClick={(e) => handleOpenRowMenu(e, residence)}>
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
      {isSiteContext && activeSite ? (
        <Alert
          severity="info"
          icon={<AddHomeWorkIcon fontSize="inherit" />}
          sx={{ alignItems: 'center', borderRadius: 2 }}
        >
          {activeMeta.siteHint(activeSite.name)}
        </Alert>
      ) : null}
      {!isSiteContext && siteFilter !== 'all' ? (
        <Alert
          severity="info"
          icon={<AddHomeWorkIcon fontSize="inherit" />}
          sx={{ alignItems: 'center', borderRadius: 2 }}
        >
          {t('residencesPage.alerts.siteFilter.prefix', {
            lng: language,
            defaultValue: 'Filtered to residences in',
          })}{' '}
          <strong>{sites.find((s) => s.slug === siteFilter)?.name ?? siteFilter}</strong>{' '}
          {t('residencesPage.alerts.siteFilter.suffix', {
            lng: language,
            defaultValue: 'Clear the site selector to see the entire portfolio.',
          })}
        </Alert>
      ) : null}

      <PageHeader
        title={residencesTitle}
        subtitle={residencesDescription}
        badges={badges}
        rightActions={rightActions}
        mobileBackButton={mobileBackButton}
        mobileActions={mobileActions}
      />

      <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, minHeight: { xs: 340, sm: 380 } }}>
        {isMobile ? (
          <Stack spacing={2}>
            {/* Site selector for enterprise mode */}
            {!isSiteContext && (
              <TextField
                select
                label={translate('residencesPage.filters.site', 'Site')}
                value={siteFilter}
                onChange={(e) => setSiteFilter(e.target.value)}
                fullWidth
                SelectProps={{
                  native: true,
                }}
              >
                <option value="all">
                  {translate('residencesPage.filters.allSites', 'All sites')}
                </option>
                {sites.map((site) => (
                  <option key={site.slug} value={site.slug}>
                    {site.name}
                  </option>
                ))}
              </TextField>
            )}

            <Stack direction="column" spacing={1}>
              <Button
                variant="outlined"
                onClick={handleOpenFilterMenu}
                color={filter === 'all' ? 'inherit' : 'primary'}
                fullWidth
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
                    onChange={(event) => setShowUnassignedResidencesOnly(event.target.checked)}
                  />
                }
                label={noResidentsToggleLabel}
              />
            </Stack>

            <TextField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            {filteredResidences.length === 0 ? (
              <Stack spacing={2} alignItems="center" sx={{ py: 5 }}>
                <Typography variant="subtitle1">{tableEmptyTitle}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {tableEmptyDescription}
                </Typography>
                <Button variant="contained" startIcon={<HomeWorkIcon />}>
                  {addResidenceLabel}
                </Button>
              </Stack>
            ) : (
              <Stack spacing={2}>
                {filteredResidences.map((residence) => (
                  <ResidenceCard
                    key={residence.id}
                    residence={residence}
                    typeMeta={typeMeta}
                    statusMeta={statusMeta}
                    translate={translate}
                    residentsEmptyLabel={residentsEmptyLabel}
                    layoutBedroomsNA={layoutBedroomsNA}
                    numberFormatter={numberFormatter}
                    inspectionCompliantLabel={inspectionCompliantLabel}
                    inspectionFollowUpLabel={inspectionFollowUpLabel}
                    dateFormatter={dateFormatter}
                    onClick={handleRowClick}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        ) : (
          <ConfigurableTable<ResidenceRecord>
            storageKey="hex:columns:residences"
            columns={columnDefs}
            rows={filteredResidences}
            getRowId={(residence) => residence.id}
            size="small"
            initialSkeletonMs={1000}
            skeletonPadding={{ xs: 2, sm: 3 }}
            skeletonMinHeight={300}
            skeletonRows={4}
            onRowClick={handleRowClick}
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
                  alignItems="center"
                  spacing={1}
                  flexWrap="wrap"
                  rowGap={1}
                  sx={{ width: '100%' }}
                >
                  {ColumnPreferencesTrigger}
                  {/* Site selector for enterprise mode */}
                  {!isSiteContext && (
                    <TextField
                      select
                      label={translate('residencesPage.filters.site', 'Site')}
                      value={siteFilter}
                      onChange={(e) => setSiteFilter(e.target.value)}
                      size="small"
                      sx={{ minWidth: 200 }}
                    >
                      {sites.map((site) => (
                        <MenuItem key={site.slug} value={site.slug}>
                          {site.name}
                        </MenuItem>
                      ))}
                      <MenuItem value="all">
                        {translate('residencesPage.filters.allSites', 'All sites')}
                      </MenuItem>
                    </TextField>
                  )}
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
                        onChange={(event) => setShowUnassignedResidencesOnly(event.target.checked)}
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
        )}
      </Paper>

      <Menu anchorEl={filterAnchor} open={Boolean(filterAnchor)} onClose={handleCloseFilterMenu}>
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
        open={Boolean(rowMenu.anchor && rowMenu.residence)}
        onClose={handleCloseRowMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {rowMenu.residence ? (
          <>
            <MenuItem
              onClick={() => {
                handleRowClick(rowMenu.residence as ResidenceRecord)
                handleCloseRowMenu()
              }}
            >
              <ListItemIcon>
                <VisibilityIcon fontSize="small" />
              </ListItemIcon>
              {t('usersPage.rowMenu.viewProfile', { lng: language, defaultValue: 'View profile' })}
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleCopyToClipboard((rowMenu.residence as ResidenceRecord).id)
                handleCloseRowMenu()
              }}
            >
              <ListItemIcon>
                <ContentCopyIcon fontSize="small" />
              </ListItemIcon>
              {t('usersPage.rowMenu.copyId', { lng: language, defaultValue: 'Copy user ID' })}
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleCopyToClipboard((rowMenu.residence as ResidenceRecord).siteName)
                handleCloseRowMenu()
              }}
            >
              <ListItemIcon>
                <HomeWorkIcon fontSize="small" />
              </ListItemIcon>
              {t('residencesPage.table.columns.site', { lng: language, defaultValue: 'Site' })}
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem
              disabled={
                (statusOverrides.get((rowMenu.residence as ResidenceRecord).id) ??
                  (rowMenu.residence as ResidenceRecord).status) === 'occupied'
              }
              onClick={() => {
                handleMarkStatus(rowMenu.residence as ResidenceRecord, 'occupied')
                handleCloseRowMenu()
              }}
            >
              <ListItemIcon>
                <CheckCircleOutlineIcon fontSize="small" />
              </ListItemIcon>
              {t('residencesPage.statuses.occupied', { lng: language, defaultValue: 'Occupied' })}
            </MenuItem>
            <MenuItem
              disabled={
                (statusOverrides.get((rowMenu.residence as ResidenceRecord).id) ??
                  (rowMenu.residence as ResidenceRecord).status) === 'vacant'
              }
              onClick={() => {
                handleMarkStatus(rowMenu.residence as ResidenceRecord, 'vacant')
                handleCloseRowMenu()
              }}
            >
              <ListItemIcon>
                <DoNotDisturbOnIcon fontSize="small" />
              </ListItemIcon>
              {t('residencesPage.statuses.vacant', { lng: language, defaultValue: 'Vacant' })}
            </MenuItem>
            <MenuItem
              disabled={
                (statusOverrides.get((rowMenu.residence as ResidenceRecord).id) ??
                  (rowMenu.residence as ResidenceRecord).status) === 'maintenance'
              }
              onClick={() => {
                handleMarkStatus(rowMenu.residence as ResidenceRecord, 'maintenance')
                handleCloseRowMenu()
              }}
            >
              <ListItemIcon>
                <BuildCircleIcon fontSize="small" />
              </ListItemIcon>
              {t('residencesPage.statuses.maintenance', {
                lng: language,
                defaultValue: 'Maintenance',
              })}
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem
              onClick={() => {
                handleRemoveResidence(rowMenu.residence as ResidenceRecord)
                handleCloseRowMenu()
              }}
            >
              <ListItemIcon>
                <DeleteOutlineIcon fontSize="small" />
              </ListItemIcon>
              {t('vehiclesPage.actions.removeFromRegistry', {
                lng: language,
                defaultValue: 'Remove from registry',
              })}
            </MenuItem>
          </>
        ) : null}
      </Menu>

      <Snackbar
        open={Boolean(feedback?.open)}
        autoHideDuration={2000}
        onClose={() => setFeedback((prev) => (prev ? { ...prev, open: false } : prev))}
        message={feedback?.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Stack>
  )
}

function ResidenceCard({
  residence,
  typeMeta,
  statusMeta,
  translate,
  residentsEmptyLabel,
  layoutBedroomsNA,
  numberFormatter,
  inspectionCompliantLabel,
  inspectionFollowUpLabel,
  dateFormatter,
  onClick,
}: {
  residence: ResidenceRecord
  typeMeta: Record<ResidenceType, { label: string; Icon: typeof HomeWorkIcon }>
  statusMeta: Record<
    ResidenceStatus,
    { label: string; color: 'success' | 'default' | 'warning'; Icon: typeof CheckCircleOutlineIcon }
  >
  translate: (key: string, defaultValue: string, options?: Record<string, unknown>) => string
  residentsEmptyLabel: string
  layoutBedroomsNA: string
  numberFormatter: Intl.NumberFormat
  inspectionCompliantLabel: string
  inspectionFollowUpLabel: string
  dateFormatter: Intl.DateTimeFormat
  onClick: (residence: ResidenceRecord) => void
}) {
  const typeIcon = typeMeta[residence.type].Icon
  const statusChip = statusMeta[residence.status]
  const TypeIcon = typeIcon

  return (
    <Paper
      onClick={() => onClick(residence)}
      sx={(theme) => ({
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        transition: theme.transitions.create(['box-shadow', 'transform'], { duration: 180 }),
        cursor: 'pointer',
        '&:hover': {
          boxShadow: theme.shadows[4],
        },
      })}
    >
      <Stack spacing={2}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
          <Stack spacing={0.5} sx={{ flex: 1 }}>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <TypeIcon fontSize="small" color="action" />
              <Typography variant="subtitle1" fontWeight={600}>
                {residence.label}
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {translate('residencesPage.table.idPrefix', 'ID {{id}}', { id: residence.id })}
            </Typography>
          </Stack>
          <Chip
            size="small"
            color={statusChip.color}
            icon={<statusChip.Icon fontSize="small" />}
            label={statusChip.label}
            variant={residence.status === 'vacant' ? 'outlined' : 'filled'}
          />
        </Stack>

        <Divider />

        <Stack spacing={1.5}>
          <Stack spacing={0.75}>
            <Typography variant="caption" color="text.secondary">
              {translate('residencesPage.table.columns.residents', 'Residents')}
            </Typography>
            {residence.residents.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {residentsEmptyLabel}
              </Typography>
            ) : (
              residence.residents.map((name) => (
                <Typography key={name} variant="body2">
                  {name}
                </Typography>
              ))
            )}
          </Stack>

          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                {translate('residencesPage.table.columns.layout', 'Layout')}
              </Typography>
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

            <Stack spacing={0.5} alignItems="flex-end">
              <Typography variant="caption" color="text.secondary">
                {translate('residencesPage.table.columns.inspection', 'Last inspection')}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {dateFormatter.format(new Date(residence.lastInspection))}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {residence.status === 'maintenance'
                  ? inspectionFollowUpLabel
                  : inspectionCompliantLabel}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  )
}
