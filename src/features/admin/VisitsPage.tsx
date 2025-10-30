import { useCallback, useMemo, useState, type MouseEvent } from 'react'
import {
  Alert,
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
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
  Snackbar,
} from '@mui/material'
import { ListItemIcon } from '@mui/material'
import AddBusinessIcon from '@mui/icons-material/AddBusiness'
import FilterListIcon from '@mui/icons-material/FilterList'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import SearchIcon from '@mui/icons-material/Search'
import CelebrationIcon from '@mui/icons-material/Celebration'
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled'
import DownloadIcon from '@mui/icons-material/Download'
import VisibilityIcon from '@mui/icons-material/Visibility'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread'
import QrCode2Icon from '@mui/icons-material/QrCode2'
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import PendingIcon from '@mui/icons-material/Pending'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useNavigate } from 'react-router-dom'
import { useSiteBackNavigation } from '@app/layout/useSiteBackNavigation'
import type { ColumnDefinition } from '../../components/table/useColumnPreferences'
import { ConfigurableTable } from '@features/search/table/ConfigurableTable'
import { useI18nStore } from '@store/i18n.store'
import { useTranslate } from '@i18n/useTranslate'
import PageHeader from './components/PageHeader'
import { VisitDetailsModal } from './components/VisitDetailsModal'

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
  status: VisitStatus
  type: VisitType
  badgeCode: string
  createdAt: string
  requestedByName?: string
  requestedByEmail?: string
  requestedByRole?: string
  requestedAt?: string
  approvedByName?: string
  approvedByEmail?: string
  approvedByRole?: string
  approvedAt?: string
  arrivedAt?: string | null
  expiresAt?: string
  lastVisitAt?: string
}
import visitsSeed from '../../mocks/visits.json'

const MOCK_VISITS: VisitRecord[] = (visitsSeed as Array<Record<string, unknown>>).map((v) => ({
  id: String(v.id),
  visitorName: String(v.visitorName),
  visitorEmail: v.visitorEmail as string | undefined,
  vehiclePlate: v.vehiclePlate as string | undefined,
  hostName: String(v.hostName),
  hostUnit: String(v.hostUnit ?? ''),
  siteSlug: String(v.siteSlug),
  siteName: String(v.siteName),
  scheduledFor: String(v.scheduledFor),
  status: v.status as VisitRecord['status'],
  type: v.type as VisitRecord['type'],
  badgeCode: String(v.badgeCode),
  createdAt: String(v.createdAt),
  requestedByName: v.requestedByName as string | undefined,
  requestedByEmail: v.requestedByEmail as string | undefined,
  requestedByRole: v.requestedByRole as string | undefined,
  requestedAt: v.requestedAt as string | undefined,
  approvedByName: v.approvedByName as string | undefined,
  approvedByEmail: v.approvedByEmail as string | undefined,
  approvedByRole: v.approvedByRole as string | undefined,
  approvedAt: v.approvedAt as string | undefined,
  arrivedAt: v.arrivedAt as string | null,
  expiresAt: v.expiresAt as string | undefined,
  lastVisitAt: v.lastVisitAt as string | undefined,
}))

type VisitFilter = 'all' | VisitStatus | VisitType

// Removed USER_LOCALE, DATE_FORMATTER, and TIME_FORMATTER from module scope

export default function VisitsPage() {
  const navigate = useNavigate()
  const { activeSite, slug: derivedSiteSlug } = useSiteBackNavigation()
  const { t } = useTranslate()
  const language = useI18nStore((s) => s.language) ?? 'en'
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

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

  const statusMeta = useMemo(
    () => ({
      approved: {
        label: translate('visitsPage.statuses.approved', 'Approved'),
        color: 'success' as const,
        Icon: CheckCircleOutlineIcon,
      },
      pending: {
        label: translate('visitsPage.statuses.pending', 'Pending'),
        color: 'warning' as const,
        Icon: PendingIcon,
      },
      denied: {
        label: translate('visitsPage.statuses.denied', 'Denied'),
        color: 'error' as const,
        Icon: ErrorOutlineIcon,
      },
    }),
    [translate],
  )

  const typeMeta = useMemo(
    () => ({
      guest: {
        label: translate('visitsPage.types.guest', 'Guest'),
        Icon: PersonAddAltIcon,
      },
      delivery: {
        label: translate('visitsPage.types.delivery', 'Delivery'),
        Icon: DirectionsCarFilledIcon,
      },
      event: {
        label: translate('visitsPage.types.event', 'Event'),
        Icon: CelebrationIcon,
      },
    }),
    [translate],
  )

  const filterOptions = useMemo<Array<{ value: VisitFilter; label: string }>>(
    () => [
      { value: 'all', label: translate('visitsPage.filters.all', 'All visits') },
      { value: 'approved', label: translate('visitsPage.filters.approved', 'Approved') },
      { value: 'pending', label: translate('visitsPage.filters.pending', 'Pending') },
      { value: 'denied', label: translate('visitsPage.filters.denied', 'Denied') },
      { value: 'guest', label: translate('visitsPage.filters.guest', 'Guests') },
      { value: 'delivery', label: translate('visitsPage.filters.delivery', 'Deliveries') },
      { value: 'event', label: translate('visitsPage.filters.event', 'Events') },
    ],
    [translate],
  )

  const timeFilterOptions = useMemo(
    () =>
      [
        { value: 'all', label: translate('visitsPage.timeFilters.all', 'Any date') },
        { value: 'today', label: translate('visitsPage.timeFilters.today', 'Arriving today') },
        {
          value: 'upcoming',
          label: translate('visitsPage.timeFilters.upcoming', 'Upcoming visits'),
        },
        { value: 'past', label: translate('visitsPage.timeFilters.past', 'Past visits') },
      ] as const,
    [translate],
  )

  const columnLabels = useMemo(
    () => ({
      id: translate('visitsPage.table.columns.id', 'Visit ID'),
      visitor: translate('visitsPage.table.columns.visitor', 'Visitor'),
      host: translate('visitsPage.table.columns.host', 'Host'),
      vehicle: translate('visitsPage.table.columns.vehicle', 'Vehicle'),
      site: translate('visitsPage.table.columns.site', 'Site'),
      schedule: translate('visitsPage.table.columns.schedule', 'Scheduled'),
      status: translate('visitsPage.table.columns.status', 'Status'),
      type: translate('visitsPage.table.columns.type', 'Type'),
      badge: translate('visitsPage.table.columns.badge', 'Badge'),
      actions: translate('visitsPage.table.columns.actions', 'Actions'),
    }),
    [translate],
  )

  const visitsTitle = translate('visitsPage.title', 'Visits')
  const visitsTitleMobile = translate('visitsPage.titleMobile', 'Visits')
  const visitsDescription = translate(
    'visitsPage.description',
    'Monitor guest traffic, scheduled arrivals, and kiosk approvals in real-time.',
  )
  const siteAlertPrefix = translate('visitsPage.alerts.siteScoped.prefix', 'Visits scoped to')
  const siteAlertSuffix = translate(
    'visitsPage.alerts.siteScoped.suffix',
    'Approvals, guest lists, and badges will prefill for this property.',
  )
  const enterpriseAlert = translate(
    'visitsPage.alerts.enterprise',
    'Switch to a specific site to pre-filter kiosk traffic or stay at enterprise level to audit all communities.',
  )
  const enterpriseChipLabel = translate('visitsPage.chip.enterprise', 'Enterprise')
  const searchPlaceholder = translate(
    'visitsPage.search.placeholder',
    'Search by visitor, host, badge, or ID',
  )
  const createPassLabel = translate('visitsPage.actions.createPass', 'Create pass')
  const downloadBadgeLabel = translate('visitsPage.actions.downloadBadge', 'Download badge')
  const moreActionsLabel = translate('visitsPage.actions.moreActions', 'More actions')
  const resendEmailLabel = translate(
    'visitsPage.actions.resendConfirmation',
    'Resend confirmation email',
  )
  const cancelVisitLabel = translate('visitsPage.actions.cancelVisit', 'Cancel visit')
  const noPlateLabel = translate('visitsPage.vehicle.noPlate', 'No plate on file')
  const emptyStateTitle = translate('visitsPage.table.empty.title', 'No visits found')
  const emptyStateDescription = translate(
    'visitsPage.table.empty.description',
    'Adjust your filters or create a pass to get started.',
  )

  const isSiteContext = Boolean(derivedSiteSlug)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<VisitFilter>('all')
  const [timeFilterAnchor, setTimeFilterAnchor] = useState<HTMLElement | null>(null)
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'upcoming' | 'past'>('all')
  const [rowMenu, setRowMenu] = useState<{ anchor: HTMLElement | null; visit?: VisitRecord }>({
    anchor: null,
    visit: undefined,
  })
  const [downloading, setDownloading] = useState(false)
  const [selectedVisit, setSelectedVisit] = useState<VisitRecord | null>(null)
  const [feedback, setFeedback] = useState<{ open: boolean; message: string } | null>(null)
  const [statusOverrides, setStatusOverrides] = useState<Map<string, VisitStatus>>(new Map())
  const [arrivedIds, setArrivedIds] = useState<Set<string>>(new Set())

  const filterButtonLabel = useMemo(() => {
    return (
      filterOptions.find((option) => option.value === filter)?.label ??
      filterOptions[0]?.label ??
      translate('visitsPage.filters.all', 'All visits')
    )
  }, [filter, filterOptions, translate])

  const timeFilterLabel = useMemo(() => {
    return (
      timeFilterOptions.find((option) => option.value === timeFilter)?.label ??
      timeFilterOptions[0]?.label ??
      translate('visitsPage.timeFilters.all', 'Any date')
    )
  }, [timeFilter, timeFilterOptions, translate])

  const filteredVisits = useMemo(() => {
    const lower = search.trim().toLowerCase()
    const now = new Date()
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)
    const endOfToday = new Date(now)
    endOfToday.setHours(23, 59, 59, 999)
    return MOCK_VISITS.filter((visit) => {
      const scheduledAt = new Date(visit.scheduledFor)
      if (derivedSiteSlug && visit.siteSlug !== derivedSiteSlug) {
        return false
      }
      if (filter === 'approved' || filter === 'pending' || filter === 'denied') {
        if (visit.status !== filter) return false
      } else if (filter === 'guest' || filter === 'delivery' || filter === 'event') {
        if (visit.type !== filter) return false
      }
      if (timeFilter === 'today') {
        if (scheduledAt < startOfToday || scheduledAt > endOfToday) return false
      } else if (timeFilter === 'upcoming') {
        if (scheduledAt <= endOfToday) return false
      } else if (timeFilter === 'past') {
        if (scheduledAt >= startOfToday) return false
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
  }, [derivedSiteSlug, filter, search, timeFilter])

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
      setFeedback({
        open: true,
        message:
          translate('visitsPage.actions.downloadBadge', 'Download badge') +
          ' • ' +
          translate('common.saveChanges', 'Save changes'),
      })
    }, 1200)
  }, [])

  const handleResendConfirmation = useCallback(
    (visit?: VisitRecord) => {
      const message =
        translate('visitsPage.actions.resendConfirmation', 'Resend confirmation email') +
        (visit ? ` • ${visit.visitorName}` : '')
      setFeedback({ open: true, message })
    },
    [translate],
  )

  const handleCancelVisitAction = useCallback(
    (visit?: VisitRecord) => {
      const message =
        translate('visitsPage.actions.cancelVisit', 'Cancel visit') +
        (visit ? ` • ${visit.visitorName}` : '')
      setFeedback({ open: true, message })
    },
    [translate],
  )

  const handleCopyToClipboard = useCallback(
    (value?: string) => {
      if (!value) return
      try {
        void navigator.clipboard.writeText(value)
        setFeedback({ open: true, message: translate('common.apply', 'Apply') + ' • ' + value })
      } catch {
        /* noop */
      }
    },
    [translate],
  )

  const handleOpenDetails = useCallback((visit: VisitRecord) => {
    setSelectedVisit(visit)
  }, [])

  const handleApprove = useCallback(
    (visit: VisitRecord) => {
      setStatusOverrides((prev) => {
        const next = new Map(prev)
        next.set(visit.id, 'approved')
        return next
      })
      setFeedback({ open: true, message: statusMeta.approved.label + ' • ' + visit.visitorName })
    },
    [statusMeta],
  )

  const handleDeny = useCallback(
    (visit: VisitRecord) => {
      setStatusOverrides((prev) => {
        const next = new Map(prev)
        next.set(visit.id, 'denied')
        return next
      })
      setFeedback({ open: true, message: statusMeta.denied.label + ' • ' + visit.visitorName })
    },
    [statusMeta],
  )

  const handleMarkArrived = useCallback(
    (visit: VisitRecord) => {
      setArrivedIds((prev) => new Set(prev).add(visit.id))
      setFeedback({
        open: true,
        message: translate('visitsPage.pdf.arrived', 'Arrived') + ' • ' + visit.visitorName,
      })
    },
    [translate],
  )

  const columnDefs = useMemo<ColumnDefinition<VisitRecord>[]>(() => {
    const currentSlug = derivedSiteSlug ?? null
    return [
      {
        id: 'id',
        label: columnLabels.id,
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
        label: columnLabels.visitor,
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
        label: columnLabels.host,
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
        label: columnLabels.vehicle,
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
              {visit.vehiclePlate ?? noPlateLabel}
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'site',
        label: columnLabels.site,
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
        label: columnLabels.schedule,
        minWidth: 160,
        render: (visit) => (
          <Stack spacing={0.2}>
            <Typography variant="body2" fontWeight={600}>
              {dateFormatter.format(new Date(visit.scheduledFor))}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {timeFormatter.format(new Date(visit.scheduledFor))}
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'status',
        label: columnLabels.status,
        minWidth: 140,
        render: (visit) => {
          const effective = statusOverrides.get(visit.id) ?? visit.status
          const meta = statusMeta[effective]
          return (
            <Chip
              size="small"
              color={meta.color}
              icon={<meta.Icon fontSize="small" />}
              label={meta.label}
              variant={effective === 'pending' ? 'outlined' : 'filled'}
            />
          )
        },
      },
      {
        id: 'type',
        label: columnLabels.type,
        minWidth: 140,
        render: (visit) => {
          const meta = typeMeta[visit.type]
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
        label: columnLabels.badge,
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
        label: columnLabels.actions,
        disableToggle: true,
        align: 'right',
        minWidth: 160,
        render: (visit) => (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Tooltip title={downloadBadgeLabel}>
              <span>
                <IconButton size="small" onClick={handleDownloadBadge} disabled={downloading}>
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={moreActionsLabel}>
              <IconButton size="small" onClick={(event) => handleOpenRowMenu(event, visit)}>
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
    downloading,
    handleDownloadBadge,
    handleOpenRowMenu,
    moreActionsLabel,
    noPlateLabel,
    statusMeta,
    timeFormatter,
    typeMeta,
    downloadBadgeLabel,
  ])

  const activeSiteName = activeSite?.name ?? derivedSiteSlug ?? null

  // PageHeader configuration
  const badges = activeSiteName
    ? [{ label: activeSiteName, color: 'secondary' as const }]
    : [{ label: enterpriseChipLabel, color: 'primary' as const }]

  const mobileBackButton = (
    <IconButton size="small" onClick={() => navigate(-1)}>
      <ArrowBackIcon fontSize="small" />
    </IconButton>
  )

  const rightActions = (
    <Button variant="contained" startIcon={<PersonAddAltIcon />}>
      {createPassLabel}
    </Button>
  )

  const mobileActions = (
    <IconButton size="small" color="primary" aria-label={createPassLabel}>
      <PersonAddAltIcon fontSize="small" />
    </IconButton>
  )

  return (
    <Stack spacing={3}>
      {isSiteContext && activeSiteName ? (
        <Alert
          severity="info"
          icon={<AddBusinessIcon fontSize="inherit" />}
          sx={{ alignItems: 'center', borderRadius: 2 }}
        >
          <Typography variant="body2">
            {siteAlertPrefix} <strong>{activeSiteName}</strong>. {siteAlertSuffix}
          </Typography>
        </Alert>
      ) : (
        <Alert
          severity="info"
          icon={<AddBusinessIcon fontSize="inherit" />}
          sx={{ alignItems: 'center', borderRadius: 2 }}
        >
          <Typography variant="body2">{enterpriseAlert}</Typography>
        </Alert>
      )}

      <PageHeader
        title={visitsTitle}
        mobileTitle={visitsTitleMobile}
        subtitle={visitsDescription}
        badges={badges}
        rightActions={rightActions}
        mobileBackButton={mobileBackButton}
        mobileActions={mobileActions}
      />

      <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, minHeight: { xs: 340, sm: 380 } }}>
        {isMobile ? (
          <Stack spacing={2}>
            <Stack direction="column" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<AccessTimeIcon />}
                onClick={(event) => setTimeFilterAnchor(event.currentTarget)}
                color={timeFilter === 'all' ? 'inherit' : 'primary'}
                fullWidth
              >
                {timeFilterLabel}
              </Button>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={(event) => setRowMenu({ anchor: event.currentTarget, visit: undefined })}
                color={filter === 'all' ? 'inherit' : 'primary'}
                fullWidth
              >
                {filterButtonLabel}
              </Button>
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

            {filteredVisits.length === 0 ? (
              <Stack spacing={2} alignItems="center" sx={{ py: 5 }}>
                <Typography variant="subtitle1">{emptyStateTitle}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {emptyStateDescription}
                </Typography>
                <Button variant="contained" startIcon={<PersonAddAltIcon />}>
                  {createPassLabel}
                </Button>
              </Stack>
            ) : (
              <Stack spacing={2}>
                {filteredVisits.map((visit) => (
                  <VisitCard
                    key={visit.id}
                    visit={visit}
                    statusMeta={statusMeta}
                    typeMeta={typeMeta}
                    translate={translate}
                    dateFormatter={dateFormatter}
                    timeFormatter={timeFormatter}
                    noPlateLabel={noPlateLabel}
                    onOpenRowMenu={handleOpenRowMenu}
                    onDownloadBadge={handleDownloadBadge}
                    downloading={downloading}
                    onClick={() => setSelectedVisit(visit)}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        ) : (
          <ConfigurableTable<VisitRecord>
            storageKey="hex:columns:visits"
            columns={columnDefs}
            rows={filteredVisits}
            getRowId={(visit) => visit.id}
            size="small"
            initialSkeletonMs={1000}
            skeletonPadding={{ xs: 2, sm: 3 }}
            skeletonMinHeight={300}
            skeletonRows={4}
            onRowClick={(visit) => setSelectedVisit(visit)}
            emptyState={{
              title: emptyStateTitle,
              description: emptyStateDescription,
              action: (
                <Button variant="contained" startIcon={<PersonAddAltIcon />}>
                  {createPassLabel}
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
                  {ColumnPreferencesTrigger}
                  <Button
                    variant="outlined"
                    startIcon={<AccessTimeIcon />}
                    onClick={(event) => setTimeFilterAnchor(event.currentTarget)}
                    color={timeFilter === 'all' ? 'inherit' : 'primary'}
                  >
                    {timeFilterLabel}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<FilterListIcon />}
                    onClick={(event) =>
                      setRowMenu({ anchor: event.currentTarget, visit: undefined })
                    }
                    color={filter === 'all' ? 'inherit' : 'primary'}
                  >
                    {filterButtonLabel}
                  </Button>
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

      <Menu
        anchorEl={timeFilterAnchor}
        open={Boolean(timeFilterAnchor)}
        onClose={() => setTimeFilterAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {timeFilterOptions.map((option) => (
          <MenuItem
            key={option.value}
            selected={timeFilter === option.value}
            onClick={() => {
              setTimeFilter(option.value)
              setTimeFilterAnchor(null)
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>

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
                if (rowMenu.visit) handleOpenDetails(rowMenu.visit)
                handleCloseRowMenu()
              }}
            >
              <ListItemIcon>
                <VisibilityIcon fontSize="small" />
              </ListItemIcon>
              {translate('visitDetails.modal.title', 'Visit Details')}
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleDownloadBadge()
                handleCloseRowMenu()
              }}
              disabled={downloading}
            >
              <ListItemIcon>
                <DownloadIcon fontSize="small" />
              </ListItemIcon>
              {downloadBadgeLabel}
            </MenuItem>
            <MenuItem
              onClick={() => {
                if (rowMenu.visit) handleResendConfirmation(rowMenu.visit)
                handleCloseRowMenu()
              }}
            >
              <ListItemIcon>
                <MarkEmailUnreadIcon fontSize="small" />
              </ListItemIcon>
              {resendEmailLabel}
            </MenuItem>
            <MenuItem
              onClick={() => {
                if (rowMenu.visit) handleCancelVisitAction(rowMenu.visit)
                handleCloseRowMenu()
              }}
            >
              <ListItemIcon>
                <ErrorOutlineIcon fontSize="small" />
              </ListItemIcon>
              {cancelVisitLabel}
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem
              onClick={() => {
                if (rowMenu.visit) handleCopyToClipboard(rowMenu.visit.badgeCode)
                handleCloseRowMenu()
              }}
            >
              <ListItemIcon>
                <ContentCopyIcon fontSize="small" />
              </ListItemIcon>
              {translate('visitsPage.table.columns.badge', 'Badge')} •{' '}
              {translate('usersPage.rowMenu.copyId', 'Copy user ID')}
            </MenuItem>
            <MenuItem
              disabled={!rowMenu.visit?.visitorEmail}
              onClick={() => {
                if (rowMenu.visit?.visitorEmail) handleCopyToClipboard(rowMenu.visit.visitorEmail)
                handleCloseRowMenu()
              }}
            >
              <ListItemIcon>
                <MarkEmailUnreadIcon fontSize="small" />
              </ListItemIcon>
              {translate('usersPage.rowMenu.copyEmail', 'Copy email')}
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem
              disabled={
                (statusOverrides.get(rowMenu.visit.id) ?? rowMenu.visit.status) === 'approved'
              }
              onClick={() => {
                handleApprove(rowMenu.visit as VisitRecord)
                handleCloseRowMenu()
              }}
            >
              <ListItemIcon>
                <CheckCircleOutlineIcon fontSize="small" />
              </ListItemIcon>
              {statusMeta.approved.label}
            </MenuItem>
            <MenuItem
              disabled={
                (statusOverrides.get(rowMenu.visit.id) ?? rowMenu.visit.status) === 'denied'
              }
              onClick={() => {
                handleDeny(rowMenu.visit as VisitRecord)
                handleCloseRowMenu()
              }}
            >
              <ListItemIcon>
                <ErrorOutlineIcon fontSize="small" />
              </ListItemIcon>
              {statusMeta.denied.label}
            </MenuItem>
            <MenuItem
              disabled={arrivedIds.has(rowMenu.visit.id)}
              onClick={() => {
                handleMarkArrived(rowMenu.visit as VisitRecord)
                handleCloseRowMenu()
              }}
            >
              <ListItemIcon>
                <AccessTimeIcon fontSize="small" />
              </ListItemIcon>
              {translate('visitsPage.pdf.arrived', 'Arrived')}
            </MenuItem>
          </>
        ) : (
          filterOptions.map((option) => (
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

      <VisitDetailsModal
        open={selectedVisit !== null}
        onClose={() => setSelectedVisit(null)}
        visit={selectedVisit}
        statusLabels={{
          approved: statusMeta.approved.label,
          pending: statusMeta.pending.label,
          denied: statusMeta.denied.label,
        }}
        statusColors={{
          approved: statusMeta.approved.color,
          pending: statusMeta.pending.color,
          denied: statusMeta.denied.color,
        }}
        statusIcons={{
          approved: CheckCircleOutlineIcon,
          pending: PendingIcon,
          denied: ErrorOutlineIcon,
        }}
        typeLabels={{
          guest: typeMeta.guest.label,
          delivery: typeMeta.delivery.label,
          event: typeMeta.event.label,
        }}
        downloadBadgeLabel={downloadBadgeLabel}
        resendEmailLabel={resendEmailLabel}
        cancelVisitLabel={cancelVisitLabel}
        onDownloadBadge={handleDownloadBadge}
        onResendEmail={() => handleResendConfirmation(selectedVisit ?? undefined)}
        onCancelVisit={() => handleCancelVisitAction(selectedVisit ?? undefined)}
      />

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

function VisitCard({
  visit,
  statusMeta,
  typeMeta,
  translate,
  dateFormatter,
  timeFormatter,
  noPlateLabel,
  onOpenRowMenu,
  onDownloadBadge,
  downloading,
  onClick,
}: {
  visit: VisitRecord
  statusMeta: Record<
    VisitStatus,
    { label: string; color: 'success' | 'warning' | 'error'; Icon: typeof CheckCircleOutlineIcon }
  >
  typeMeta: Record<VisitType, { label: string; Icon: typeof PersonAddAltIcon }>
  translate: (key: string, defaultValue: string, options?: Record<string, unknown>) => string
  dateFormatter: Intl.DateTimeFormat
  timeFormatter: Intl.DateTimeFormat
  noPlateLabel: string
  onOpenRowMenu: (event: React.MouseEvent<HTMLButtonElement>, visit: VisitRecord) => void
  onDownloadBadge: () => void
  downloading: boolean
  onClick: () => void
}) {
  const statusChip = statusMeta[visit.status]
  const typeChip = typeMeta[visit.type]
  const StatusIcon = statusChip.Icon
  const TypeIcon = typeChip.Icon

  return (
    <Paper
      onClick={onClick}
      sx={(theme) => ({
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        transition: theme.transitions.create(['box-shadow', 'transform'], { duration: 180 }),
        '&:hover': {
          boxShadow: theme.shadows[4],
          transform: 'translateY(-2px)',
        },
      })}
    >
      <Stack spacing={2}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
          <Stack spacing={0.3}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              {visit.id}
            </Typography>
            <Typography variant="subtitle2" fontWeight={600}>
              {visit.visitorName}
            </Typography>
            {visit.visitorEmail ? (
              <Typography variant="caption" color="text.secondary">
                {visit.visitorEmail}
              </Typography>
            ) : null}
          </Stack>
          <IconButton
            size="small"
            onClick={(event) => onOpenRowMenu(event, visit)}
            sx={{ flexShrink: 0 }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Divider />

        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              size="small"
              color={statusChip.color}
              icon={<StatusIcon fontSize="small" />}
              label={statusChip.label}
              variant={visit.status === 'pending' ? 'outlined' : 'filled'}
            />
            <Chip
              size="small"
              icon={<TypeIcon fontSize="small" />}
              label={typeChip.label}
              color={
                visit.type === 'delivery'
                  ? 'info'
                  : visit.type === 'event'
                    ? 'secondary'
                    : 'default'
              }
            />
          </Stack>

          <Stack spacing={0.75}>
            <Typography variant="caption" color="text.secondary">
              {translate('visitsPage.table.columns.host', 'Host')}
            </Typography>
            <Typography variant="subtitle2">{visit.hostName}</Typography>
            <Typography variant="caption" color="text.secondary">
              {visit.hostUnit}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.75} alignItems="center">
            <DirectionsCarFilledIcon
              fontSize="small"
              color={visit.vehiclePlate ? 'action' : 'disabled'}
            />
            <Typography
              variant="body2"
              color={visit.vehiclePlate ? 'text.primary' : 'text.secondary'}
            >
              {visit.vehiclePlate ?? noPlateLabel}
            </Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                {translate('visitsPage.table.columns.schedule', 'Scheduled')}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {dateFormatter.format(new Date(visit.scheduledFor))}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {timeFormatter.format(new Date(visit.scheduledFor))}
              </Typography>
            </Stack>
            <Stack spacing={0.5} alignItems="flex-end">
              <Typography variant="caption" color="text.secondary">
                {translate('visitsPage.table.columns.badge', 'Badge')}
              </Typography>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <QrCode2Icon fontSize="small" color="action" />
                <Typography variant="body2" fontWeight={600}>
                  {visit.badgeCode}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          justifyContent="flex-end"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon fontSize="small" />}
            disabled={downloading}
            onClick={onDownloadBadge}
          >
            {translate('visitsPage.actions.downloadBadge', 'Download badge')}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  )
}
