import { useCallback, useMemo, useState, type MouseEvent } from 'react'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import AddIcon from '@mui/icons-material/Add'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import SearchIcon from '@mui/icons-material/Search'
import ReportProblemIcon from '@mui/icons-material/ReportProblem'
import SecurityIcon from '@mui/icons-material/Security'
import BuildCircleIcon from '@mui/icons-material/BuildCircle'
import PersonOffIcon from '@mui/icons-material/PersonOff'
import LocalParkingIcon from '@mui/icons-material/LocalParking'
import PlumbingIcon from '@mui/icons-material/Plumbing'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import MedicalServicesIcon from '@mui/icons-material/MedicalServices'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ScheduleIcon from '@mui/icons-material/Schedule'

import PageHeader from './components/PageHeader'
import { useTranslate } from '@i18n/useTranslate'
import { useI18nStore } from '@store/i18n.store'
import { useSiteStore } from '@store/site.store'

// Incident types and status
type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical'
type IncidentStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
type IncidentCategory =
  | 'security'
  | 'maintenance'
  | 'parking'
  | 'noise'
  | 'utilities'
  | 'medical'
  | 'fire'
  | 'other'

type Incident = {
  id: string
  title: string
  description: string
  category: IncidentCategory
  severity: IncidentSeverity
  status: IncidentStatus
  reportedBy: string
  reportedAt: string
  assignedTo?: string
  resolvedAt?: string
  unit?: string
  location: string
  images?: string[]
  notes?: string
}

// Mock data
const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'inc-001',
    title: 'Suspicious activity in parking garage',
    description: 'Unknown person attempting to access multiple vehicles in level B2',
    category: 'security',
    severity: 'high',
    status: 'in_progress',
    reportedBy: 'Guard Station',
    reportedAt: '2025-10-28T10:30:00Z',
    assignedTo: 'Security Team',
    location: 'Parking Level B2',
    notes: 'Security footage being reviewed',
  },
  {
    id: 'inc-002',
    title: 'Elevator maintenance required',
    description: 'Elevator in Tower A making unusual noises and stopping between floors',
    category: 'maintenance',
    severity: 'medium',
    status: 'open',
    reportedBy: 'Maria Santos',
    reportedAt: '2025-10-28T08:15:00Z',
    unit: 'Tower A - Apt 1205',
    location: 'Tower A - Main Elevator',
  },
  {
    id: 'inc-003',
    title: 'Water leakage in common area',
    description: 'Water leaking from ceiling in main lobby, creating puddles near entrance',
    category: 'utilities',
    severity: 'high',
    status: 'resolved',
    reportedBy: 'Maintenance Staff',
    reportedAt: '2025-10-27T16:45:00Z',
    resolvedAt: '2025-10-28T09:30:00Z',
    assignedTo: 'Plumbing Team',
    location: 'Main Lobby',
    notes: 'Pipe replacement completed, area cleaned',
  },
  {
    id: 'inc-004',
    title: 'Loud music complaint',
    description: 'Resident playing loud music late at night, disturbing neighbors',
    category: 'noise',
    severity: 'low',
    status: 'closed',
    reportedBy: 'Carlos Rodriguez',
    reportedAt: '2025-10-27T23:30:00Z',
    resolvedAt: '2025-10-28T00:15:00Z',
    unit: 'Tower B - Apt 805',
    location: 'Tower B - 8th Floor',
    notes: 'Resident contacted, music turned down, no further complaints',
  },
  {
    id: 'inc-005',
    title: 'Fire alarm system malfunction',
    description: 'False fire alarms triggering repeatedly in Tower C',
    category: 'fire',
    severity: 'critical',
    status: 'in_progress',
    reportedBy: 'Building Management',
    reportedAt: '2025-10-28T11:00:00Z',
    assignedTo: 'Fire Safety Team',
    location: 'Tower C - All Floors',
    notes: 'Fire department notified, system inspection underway',
  },
]

const SEVERITY_CONFIG = {
  low: { color: 'success', label: 'Low', bgColor: '#e8f5e8' },
  medium: { color: 'warning', label: 'Medium', bgColor: '#fff4e6' },
  high: { color: 'error', label: 'High', bgColor: '#ffebee' },
  critical: { color: 'error', label: 'Critical', bgColor: '#ffcdd2' },
} as const

const STATUS_CONFIG = {
  open: { color: 'error', icon: ErrorOutlineIcon, label: 'Open' },
  in_progress: { color: 'warning', icon: ScheduleIcon, label: 'In Progress' },
  resolved: { color: 'success', icon: CheckCircleOutlineIcon, label: 'Resolved' },
  closed: { color: 'default', icon: CheckCircleOutlineIcon, label: 'Closed' },
} as const

const CATEGORY_CONFIG = {
  security: { color: 'error', icon: SecurityIcon, label: 'Security' },
  maintenance: { color: 'warning', icon: BuildCircleIcon, label: 'Maintenance' },
  parking: { color: 'info', icon: LocalParkingIcon, label: 'Parking' },
  noise: { color: 'secondary', icon: PersonOffIcon, label: 'Noise' },
  utilities: { color: 'primary', icon: PlumbingIcon, label: 'Utilities' },
  medical: { color: 'error', icon: MedicalServicesIcon, label: 'Medical' },
  fire: { color: 'error', icon: LocalFireDepartmentIcon, label: 'Fire Safety' },
  other: { color: 'default', icon: ReportProblemIcon, label: 'Other' },
} as const

export default function IncidentsPage() {
  const { t } = useTranslate()
  const language = useI18nStore((s) => s.language)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const currentSite = useSiteStore((s) => s.current)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'all'>('all')
  const [severityFilter, setSeverityFilter] = useState<IncidentSeverity | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<IncidentCategory | 'all'>('all')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [, setSelectedIncident] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Filter incidents
  const filteredIncidents = useMemo(() => {
    return MOCK_INCIDENTS.filter((incident) => {
      if (
        searchTerm &&
        !incident.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !incident.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !incident.location.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false
      }
      if (statusFilter !== 'all' && incident.status !== statusFilter) return false
      if (severityFilter !== 'all' && incident.severity !== severityFilter) return false
      if (categoryFilter !== 'all' && incident.category !== categoryFilter) return false
      return true
    })
  }, [searchTerm, statusFilter, severityFilter, categoryFilter])

  const handleMenuOpen = useCallback((event: MouseEvent<HTMLElement>, incidentId: string) => {
    setAnchorEl(event.currentTarget)
    setSelectedIncident(incidentId)
  }, [])

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null)
    setSelectedIncident(null)
  }, [])

  // const formatDateTime = (dateString: string) => {
  //   return new Date(dateString).toLocaleString('en-US', {
  //     month: 'short',
  //     day: 'numeric',
  //     hour: '2-digit',
  //     minute: '2-digit'
  //   })
  // }

  const getTimeSince = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    return 'Just now'
  }

  const IncidentCard = ({ incident }: { incident: Incident }) => {
    const severityConfig = SEVERITY_CONFIG[incident.severity]
    const statusConfig = STATUS_CONFIG[incident.status]
    const categoryConfig = CATEGORY_CONFIG[incident.category]
    const StatusIcon = statusConfig.icon
    const CategoryIcon = categoryConfig.icon

    return (
      <Paper
        sx={{
          p: 3,
          borderRadius: 2,
          borderLeft: `4px solid ${theme.palette[severityConfig.color].main}`,
          '&:hover': {
            boxShadow: theme.shadows[4],
          },
        }}
      >
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight={600} noWrap sx={{ mb: 0.5 }}>
                {incident.title}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 1 }}>
                <Chip
                  icon={<CategoryIcon />}
                  label={categoryConfig.label}
                  size="small"
                  color={
                    categoryConfig.color as
                      | 'default'
                      | 'primary'
                      | 'secondary'
                      | 'error'
                      | 'info'
                      | 'success'
                      | 'warning'
                  }
                  variant="outlined"
                />
                <Chip
                  label={severityConfig.label}
                  size="small"
                  color={
                    severityConfig.color as
                      | 'default'
                      | 'primary'
                      | 'secondary'
                      | 'error'
                      | 'info'
                      | 'success'
                      | 'warning'
                  }
                  sx={{
                    bgcolor: severityConfig.bgColor,
                    color: theme.palette[severityConfig.color].main,
                    fontWeight: 600,
                  }}
                />
                <Chip
                  icon={<StatusIcon />}
                  label={statusConfig.label}
                  size="small"
                  color={
                    statusConfig.color as
                      | 'default'
                      | 'primary'
                      | 'secondary'
                      | 'error'
                      | 'info'
                      | 'success'
                      | 'warning'
                  }
                />
              </Stack>
            </Box>
            <IconButton size="small" onClick={(e) => handleMenuOpen(e, incident.id)}>
              <MoreVertIcon />
            </IconButton>
          </Stack>

          {/* Description */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {incident.description}
          </Typography>

          {/* Details */}
          <Stack spacing={1}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="caption" color="text.secondary">
                <strong>
                  {t('admin.incidents.fields.location', {
                    lng: language,
                    defaultValue: 'Location',
                  })}
                  :
                </strong>{' '}
                {incident.location}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="caption" color="text.secondary">
                <strong>
                  {t('admin.incidents.fields.reportedBy', {
                    lng: language,
                    defaultValue: 'Reported by',
                  })}
                  :
                </strong>{' '}
                {incident.reportedBy}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {getTimeSince(incident.reportedAt)}
              </Typography>
            </Stack>
            {incident.assignedTo && (
              <Typography variant="caption" color="text.secondary">
                <strong>
                  {t('admin.incidents.fields.assignedTo', {
                    lng: language,
                    defaultValue: 'Assigned to',
                  })}
                  :
                </strong>{' '}
                {incident.assignedTo}
              </Typography>
            )}
            {incident.unit && (
              <Typography variant="caption" color="text.secondary">
                <strong>
                  {t('admin.incidents.fields.unit', { lng: language, defaultValue: 'Unit' })}:
                </strong>{' '}
                {incident.unit}
              </Typography>
            )}
          </Stack>
        </Stack>
      </Paper>
    )
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title={t('admin.incidents.title', { lng: language, defaultValue: 'Incidents' })}
        subtitle={t('admin.incidents.subtitle', {
          lng: language,
          defaultValue: 'Track and manage incidents for ' + (currentSite?.name || 'the site'),
        })}
        rightActions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            {t('admin.incidents.actions.create', {
              lng: language,
              defaultValue: 'Report Incident',
            })}
          </Button>
        }
      />

      {/* Filters */}
      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <TextField
            placeholder={t('admin.incidents.search.placeholder', {
              lng: language,
              defaultValue: 'Search incidents...',
            })}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <Stack
            direction={isMobile ? 'column' : 'row'}
            spacing={2}
            alignItems={isMobile ? 'stretch' : 'center'}
          >
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>
                {t('admin.incidents.filters.status', { lng: language, defaultValue: 'Status' })}
              </InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as IncidentStatus | 'all')}
                label={t('admin.incidents.filters.status', {
                  lng: language,
                  defaultValue: 'Status',
                })}
              >
                <MenuItem value="all">
                  {t('admin.incidents.filters.allStatuses', {
                    lng: language,
                    defaultValue: 'All Statuses',
                  })}
                </MenuItem>
                <MenuItem value="open">
                  {t('admin.incidents.status.open', { lng: language, defaultValue: 'Open' })}
                </MenuItem>
                <MenuItem value="in_progress">
                  {t('admin.incidents.status.in_progress', {
                    lng: language,
                    defaultValue: 'In Progress',
                  })}
                </MenuItem>
                <MenuItem value="resolved">
                  {t('admin.incidents.status.resolved', {
                    lng: language,
                    defaultValue: 'Resolved',
                  })}
                </MenuItem>
                <MenuItem value="closed">
                  {t('admin.incidents.status.closed', { lng: language, defaultValue: 'Closed' })}
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>
                {t('admin.incidents.filters.severity', { lng: language, defaultValue: 'Severity' })}
              </InputLabel>
              <Select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value as IncidentSeverity | 'all')}
                label={t('admin.incidents.filters.severity', {
                  lng: language,
                  defaultValue: 'Severity',
                })}
              >
                <MenuItem value="all">
                  {t('admin.incidents.filters.allSeverities', {
                    lng: language,
                    defaultValue: 'All Severities',
                  })}
                </MenuItem>
                <MenuItem value="low">
                  {t('admin.incidents.severity.low', { lng: language, defaultValue: 'Low' })}
                </MenuItem>
                <MenuItem value="medium">
                  {t('admin.incidents.severity.medium', { lng: language, defaultValue: 'Medium' })}
                </MenuItem>
                <MenuItem value="high">
                  {t('admin.incidents.severity.high', { lng: language, defaultValue: 'High' })}
                </MenuItem>
                <MenuItem value="critical">
                  {t('admin.incidents.severity.critical', {
                    lng: language,
                    defaultValue: 'Critical',
                  })}
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>
                {t('admin.incidents.filters.category', { lng: language, defaultValue: 'Category' })}
              </InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as IncidentCategory | 'all')}
                label={t('admin.incidents.filters.category', {
                  lng: language,
                  defaultValue: 'Category',
                })}
              >
                <MenuItem value="all">
                  {t('admin.incidents.filters.allCategories', {
                    lng: language,
                    defaultValue: 'All Categories',
                  })}
                </MenuItem>
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                  <MenuItem key={key} value={key}>
                    {t(`admin.incidents.category.${key}`, {
                      lng: language,
                      defaultValue: config.label,
                    })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </Paper>

      {/* Results */}
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('admin.incidents.resultsCount', {
            lng: language,
            defaultValue: 'Showing {count} incidents',
            count: filteredIncidents.length,
          })}
        </Typography>

        <Grid container spacing={2}>
          {filteredIncidents.map((incident) => (
            <Grid key={incident.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <IncidentCard incident={incident} />
            </Grid>
          ))}
        </Grid>

        {filteredIncidents.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <ReportProblemIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              {t('admin.incidents.empty.title', {
                lng: language,
                defaultValue: 'No incidents found',
              })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('admin.incidents.empty.description', {
                lng: language,
                defaultValue: 'Try adjusting your filters or report a new incident.',
              })}
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleMenuClose}>
          {t('common.view', { lng: language, defaultValue: 'View Details' })}
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          {t('common.edit', { lng: language, defaultValue: 'Edit' })}
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          {t('admin.incidents.actions.assign', { lng: language, defaultValue: 'Assign' })}
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          {t('admin.incidents.actions.resolve', {
            lng: language,
            defaultValue: 'Mark as Resolved',
          })}
        </MenuItem>
      </Menu>

      {/* Create Dialog Placeholder */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {t('admin.incidents.create.title', {
            lng: language,
            defaultValue: 'Report New Incident',
          })}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {t('admin.incidents.create.placeholder', {
              lng: language,
              defaultValue: 'Incident reporting form would be implemented here.',
            })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            {t('common.cancel', { lng: language, defaultValue: 'Cancel' })}
          </Button>
          <Button variant="contained" onClick={() => setCreateDialogOpen(false)}>
            {t('admin.incidents.create.submit', { lng: language, defaultValue: 'Report Incident' })}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
