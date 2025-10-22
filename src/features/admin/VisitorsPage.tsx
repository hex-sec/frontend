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

import { useTranslate } from '@i18n/useTranslate'
import { useI18nStore } from '@store/i18n.store'

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
import visitorsSeed from '../../mocks/visitors.json'

const MOCK_VISITORS: VisitorRecord[] = (visitorsSeed as Array<Record<string, unknown>>).map(
  (v) => ({
    id: String(v.id),
    name: String(v.name),
    email: String(v.email),
    phone: v.phone as string | undefined,
    siteSlug: String(v.siteSlug),
    siteName: String(v.siteName),
    primaryHost: String(v.primaryHost),
    preferredNotes: v.preferredNotes as string | undefined,
    lastVisit: String(v.lastVisit),
    totalVisits: Number(v.totalVisits),
    category: v.category as VisitorRecord['category'],
    status: v.status as VisitorRecord['status'],
  }),
)

const CATEGORY_META_BASE: Record<
  VisitorCategory,
  { defaultLabel: string; Icon: typeof FamilyRestroomIcon; color: 'primary' | 'secondary' | 'info' }
> = {
  family: { defaultLabel: 'Family & friends', Icon: FamilyRestroomIcon, color: 'secondary' },
  vendor: { defaultLabel: 'Vendor', Icon: HandshakeIcon, color: 'primary' },
  staff: { defaultLabel: 'Staff', Icon: BusinessCenterIcon, color: 'info' },
}

const STATUS_META_BASE: Record<
  VisitorStatus,
  {
    defaultLabel: string
    color: 'success' | 'warning' | 'error'
    Icon: typeof CheckCircleOutlineIcon
    variant?: 'outlined' | 'filled'
  }
> = {
  active: { defaultLabel: 'Active', color: 'success', Icon: CheckCircleOutlineIcon },
  blocked: { defaultLabel: 'Blocked', color: 'error', Icon: ReportGmailerrorredIcon },
  pending: {
    defaultLabel: 'Pending review',
    color: 'warning',
    Icon: HourglassTopIcon,
    variant: 'outlined',
  },
}

type VisitorFilter = 'all' | VisitorStatus | VisitorCategory

export default function VisitorsPage() {
  const { activeSite, slug: derivedSiteSlug } = useSiteBackNavigation()
  const { t } = useTranslate()
  const language = useI18nStore((state) => state.language) ?? 'en'
  const isSiteContext = Boolean(derivedSiteSlug)

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

  const categoryMeta = useMemo(
    () => ({
      family: {
        label: translate('visitorsPage.categories.family', CATEGORY_META_BASE.family.defaultLabel),
        Icon: CATEGORY_META_BASE.family.Icon,
        color: CATEGORY_META_BASE.family.color,
      },
      vendor: {
        label: translate('visitorsPage.categories.vendor', CATEGORY_META_BASE.vendor.defaultLabel),
        Icon: CATEGORY_META_BASE.vendor.Icon,
        color: CATEGORY_META_BASE.vendor.color,
      },
      staff: {
        label: translate('visitorsPage.categories.staff', CATEGORY_META_BASE.staff.defaultLabel),
        Icon: CATEGORY_META_BASE.staff.Icon,
        color: CATEGORY_META_BASE.staff.color,
      },
    }),
    [translate],
  )

  const statusMeta = useMemo(
    () => ({
      active: {
        label: translate('visitorsPage.statuses.active', STATUS_META_BASE.active.defaultLabel),
        color: STATUS_META_BASE.active.color,
        Icon: STATUS_META_BASE.active.Icon,
        variant: STATUS_META_BASE.active.variant,
      },
      blocked: {
        label: translate('visitorsPage.statuses.blocked', STATUS_META_BASE.blocked.defaultLabel),
        color: STATUS_META_BASE.blocked.color,
        Icon: STATUS_META_BASE.blocked.Icon,
        variant: STATUS_META_BASE.blocked.variant,
      },
      pending: {
        label: translate('visitorsPage.statuses.pending', STATUS_META_BASE.pending.defaultLabel),
        color: STATUS_META_BASE.pending.color,
        Icon: STATUS_META_BASE.pending.Icon,
        variant: STATUS_META_BASE.pending.variant,
      },
    }),
    [translate],
  )

  const filterOptions = useMemo<Array<{ value: VisitorFilter; label: string }>>(
    () => [
      { value: 'all', label: translate('visitorsPage.filters.all', 'All visitors') },
      { value: 'active', label: translate('visitorsPage.filters.active', 'Active') },
      {
        value: 'pending',
        label: translate('visitorsPage.filters.pending', 'Pending review'),
      },
      { value: 'blocked', label: translate('visitorsPage.filters.blocked', 'Blocked') },
      {
        value: 'family',
        label: translate('visitorsPage.filters.family', 'Family & friends'),
      },
      { value: 'vendor', label: translate('visitorsPage.filters.vendor', 'Vendors') },
      {
        value: 'staff',
        label: translate('visitorsPage.filters.staff', 'Staff & contractors'),
      },
    ],
    [translate],
  )

  const columnLabels = useMemo(
    () => ({
      visitor: translate('visitorsPage.table.columns.visitor', 'Visitor'),
      category: translate('visitorsPage.table.columns.category', 'Category'),
      host: translate('visitorsPage.table.columns.host', 'Primary host'),
      site: translate('visitorsPage.table.columns.site', 'Site'),
      lastVisit: translate('visitorsPage.table.columns.lastVisit', 'Last visit'),
      totalVisits: translate('visitorsPage.table.columns.totalVisits', 'Visits logged'),
      status: translate('visitorsPage.table.columns.status', 'Status'),
      actions: translate('visitorsPage.table.columns.actions', 'Actions'),
    }),
    [translate],
  )

  const visitorsTitle = translate('visitorsPage.title', 'Recurring visitors')
  const visitorsDescription = translate(
    'visitorsPage.description',
    'Store frequent visitor profiles for faster gate processing and audit trails.',
  )
  const siteAlertPrefix = translate('visitorsPage.alerts.siteScoped.prefix', 'Visitors scoped to')
  const siteAlertSuffix = translate(
    'visitorsPage.alerts.siteScoped.suffix',
    'Recurring approvals, notes, and expedited kiosk settings will stay in sync for this property.',
  )
  const enterpriseAlert = translate(
    'visitorsPage.alerts.enterprise',
    'Track frequent guests across the portfolio and move to site mode to tune access rules for a single community.',
  )
  const enterpriseChipLabel = translate('visitorsPage.chip.enterprise', 'Enterprise')
  const searchPlaceholder = translate(
    'visitorsPage.search.placeholder',
    'Search by visitor, email, or host',
  )
  const addVisitorLabel = translate(
    'visitorsPage.actions.addRecurringVisitor',
    'Add recurring visitor',
  )
  const issuePassLabel = translate('visitorsPage.actions.issuePass', 'Create pass')
  const moreActionsLabel = translate('visitorsPage.actions.moreActions', 'More actions')
  const blockVisitorLabel = translate('visitorsPage.actions.blockVisitor', 'Block visitor')
  const deleteProfileLabel = translate('visitorsPage.actions.deleteProfile', 'Delete profile')
  const issueVisitPassLabel = translate('visitorsPage.actions.issueVisitPass', 'Issue visit pass')
  const emptyTitle = translate('visitorsPage.table.empty.title', 'No visitors found')
  const emptyDescription = translate(
    'visitorsPage.table.empty.description',
    'Adjust filters or add a recurring visitor profile.',
  )

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<VisitorFilter>('all')
  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null)
  const [rowMenu, setRowMenu] = useState<{ anchor: HTMLElement | null; visitor?: VisitorRecord }>({
    anchor: null,
    visitor: undefined,
  })

  const filterButtonLabel = useMemo(() => {
    return (
      filterOptions.find((option) => option.value === filter)?.label ??
      filterOptions[0]?.label ??
      translate('visitorsPage.filters.all', 'All visitors')
    )
  }, [filter, filterOptions, translate])

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
        label: columnLabels.visitor,
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
        label: columnLabels.category,
        minWidth: 160,
        render: (visitor) => {
          const meta = categoryMeta[visitor.category]
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
        label: columnLabels.host,
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
        label: columnLabels.site,
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
        label: columnLabels.lastVisit,
        minWidth: 160,
        render: (visitor) => (
          <Stack spacing={0.2}>
            <Typography variant="body2">
              {dateFormatter.format(new Date(visitor.lastVisit))}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {timeFormatter.format(new Date(visitor.lastVisit))}
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'totalVisits',
        label: columnLabels.totalVisits,
        minWidth: 140,
        render: (visitor) => (
          <Chip
            size="small"
            label={translate('visitorsPage.table.totalVisitsChip', '{{count}} visits', {
              count: visitor.totalVisits,
            })}
            color="default"
          />
        ),
      },
      {
        id: 'status',
        label: columnLabels.status,
        minWidth: 140,
        render: (visitor) => {
          const meta = statusMeta[visitor.status]
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
        label: columnLabels.actions,
        disableToggle: true,
        align: 'right',
        minWidth: 160,
        render: (visitor) => (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Tooltip title={issueVisitPassLabel}>
              <Button size="small" variant="outlined" onClick={handlePromoteToPass}>
                {issuePassLabel}
              </Button>
            </Tooltip>
            <Tooltip title={moreActionsLabel}>
              <IconButton size="small" onClick={(event) => handleOpenRowMenu(event, visitor)}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ]
  }, [
    categoryMeta,
    columnLabels,
    dateFormatter,
    derivedSiteSlug,
    handleOpenRowMenu,
    handlePromoteToPass,
    issuePassLabel,
    issueVisitPassLabel,
    statusMeta,
    timeFormatter,
    translate,
    moreActionsLabel,
  ])

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
          <Typography variant="body2">
            {siteAlertPrefix} <strong>{activeSiteName}</strong>. {siteAlertSuffix}
          </Typography>
        </Alert>
      ) : (
        <Alert
          severity="info"
          icon={<BadgeIcon fontSize="inherit" />}
          sx={{ alignItems: 'center', borderRadius: 2 }}
        >
          <Typography variant="body2">{enterpriseAlert}</Typography>
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
                  {visitorsTitle}
                </Typography>
                {isSiteContext && activeSiteName ? (
                  <Chip label={activeSiteName} size="small" color="secondary" />
                ) : (
                  <Chip label={enterpriseChipLabel} size="small" color="primary" />
                )}
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {visitorsDescription}
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
                {filterButtonLabel}
              </Button>
              <Button variant="contained" startIcon={<PersonAddAlt1Icon />}>
                {addVisitorLabel}
              </Button>
            </Stack>
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
                        <Typography variant="subtitle1">{emptyTitle}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {emptyDescription}
                        </Typography>
                        <Button variant="contained" startIcon={<PersonAddAlt1Icon />}>
                          {addVisitorLabel}
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
        open={Boolean(rowMenu.anchor && rowMenu.visitor)}
        onClose={handleCloseRowMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handlePromoteToPass}>{issueVisitPassLabel}</MenuItem>
        <MenuItem onClick={handleBlockVisitor}>{blockVisitorLabel}</MenuItem>
        <MenuItem
          onClick={() => {
            handleCloseRowMenu()
          }}
        >
          {deleteProfileLabel}
        </MenuItem>
      </Menu>
    </Stack>
  )
}
