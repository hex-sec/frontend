import { useState, useMemo } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Alert,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import EditIcon from '@mui/icons-material/Edit'
// import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import PolicyIcon from '@mui/icons-material/Policy'
import AddBusinessIcon from '@mui/icons-material/AddBusiness'
import SecurityIcon from '@mui/icons-material/Security'
import HomeIcon from '@mui/icons-material/Home'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import PetsIcon from '@mui/icons-material/Pets'
import CelebrationIcon from '@mui/icons-material/Celebration'
import BusinessIcon from '@mui/icons-material/Business'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PersonIcon from '@mui/icons-material/Person'

import PageHeader from './components/PageHeader'
import { useTranslate } from '@i18n/useTranslate'
import { useI18nStore } from '@store/i18n.store'
import { useSiteBackNavigation } from '@app/layout/useSiteBackNavigation'

type PolicyStatus = 'active' | 'draft' | 'archived'
type PolicySection =
  | 'security'
  | 'residential'
  | 'parking'
  | 'pets'
  | 'events'
  | 'commercial'
  | 'general'

type Policy = {
  id: string
  title: string
  description: string
  section: PolicySection
  status: PolicyStatus
  version: string
  effectiveDate: string
  lastUpdated: string
  updatedBy: string
  content: string
  rules: string[]
  consequences?: string[]
  siteSlugs?: string[]
}

// Mock policies data
const MOCK_POLICIES: Policy[] = [
  {
    id: 'pol-001',
    title: 'Visitor Access & Security Guidelines',
    description:
      'Comprehensive guidelines for visitor registration, escort requirements, and security protocols.',
    section: 'security',
    status: 'active',
    version: '2.1',
    effectiveDate: '2025-01-01',
    lastUpdated: '2025-10-15',
    updatedBy: 'Admin Team',
    content:
      'All visitors must be registered by residents and accompanied by an escort at all times within the premises.',
    rules: [
      'All visitors must register at the main reception',
      'Valid ID required for all visitors',
      'Visitors must be escorted by residents at all times',
      'Maximum 4 visitors per unit at any time',
      'Visiting hours: 6:00 AM - 10:00 PM daily',
    ],
    consequences: [
      'First violation: Written warning',
      'Second violation: $50 fine',
      'Third violation: Visitor privileges suspended for 30 days',
    ],
    siteSlugs: ['vista-azul'],
  },
  {
    id: 'pol-002',
    title: 'Pet Ownership and Management',
    description:
      'Rules and regulations for pet ownership, registration, and behavior within residential areas.',
    section: 'pets',
    status: 'active',
    version: '1.8',
    effectiveDate: '2025-02-01',
    lastUpdated: '2025-09-20',
    updatedBy: 'Property Management',
    content:
      'Pet ownership is permitted with proper registration and adherence to community guidelines.',
    rules: [
      'Maximum 2 pets per residential unit',
      'All pets must be registered with management',
      'Dogs must be leashed in common areas',
      'Pet waste must be cleaned immediately',
      'Pets must not cause noise disturbances',
      'Aggressive breeds restricted (see appendix)',
    ],
    consequences: [
      'First violation: $25 fine and written warning',
      'Repeated violations: $100 fine',
      'Severe violations: Pet removal required',
    ],
    siteSlugs: ['vista-azul', 'los-olivos'],
  },
  {
    id: 'pol-003',
    title: 'Parking Regulations and Enforcement',
    description:
      'Parking space allocation, visitor parking, and enforcement procedures for unauthorized parking.',
    section: 'parking',
    status: 'active',
    version: '3.0',
    effectiveDate: '2025-03-01',
    lastUpdated: '2025-10-01',
    updatedBy: 'Security Department',
    content:
      'Parking spaces are allocated per unit with specific rules for visitor and emergency parking.',
    rules: [
      'One parking space per unit',
      'Additional spaces available for rent',
      'Visitor parking limited to 4 hours',
      'No parking in fire lanes or handicap spaces',
      'Vehicle registration required',
      'Commercial vehicles prohibited overnight',
    ],
    consequences: [
      'Unauthorized parking: $75 fine',
      'Blocking fire lanes: $150 fine + towing',
      'Repeated violations: Parking privileges revoked',
    ],
    siteSlugs: ['los-olivos'],
  },
  {
    id: 'pol-004',
    title: 'Community Events and Gatherings',
    description:
      'Guidelines for organizing and hosting events in common areas and residential units.',
    section: 'events',
    status: 'active',
    version: '1.5',
    effectiveDate: '2025-04-01',
    lastUpdated: '2025-08-10',
    updatedBy: 'Community Board',
    content:
      'Community events enhance resident life but must be organized with proper approval and safety measures.',
    rules: [
      'Events in common areas require 7-day notice',
      'Maximum 50 attendees for private events',
      'Music and noise restrictions apply after 9 PM',
      'Event organizer responsible for cleanup',
      'Security deposit required for large events',
      'Outside catering requires health permits',
    ],
    siteSlugs: ['vista-azul'],
  },
  {
    id: 'pol-005',
    title: 'Noise Control and Quiet Hours',
    description: 'Noise regulations, quiet hours, and procedures for handling noise complaints.',
    section: 'residential',
    status: 'draft',
    version: '2.0-draft',
    effectiveDate: '2025-12-01',
    lastUpdated: '2025-10-25',
    updatedBy: 'Resident Committee',
    content:
      'Maintaining a peaceful living environment through noise control and community consideration.',
    rules: [
      'Quiet hours: 10 PM - 7 AM daily',
      'Construction activities: 8 AM - 6 PM weekdays',
      'No construction on weekends or holidays',
      'Television and music at reasonable levels',
      'Children must be supervised in common areas',
    ],
    consequences: [
      'First complaint: Verbal warning',
      'Second complaint: Written notice and $25 fine',
      'Continued violations: Lease violation notice',
    ],
    siteSlugs: ['los-olivos'],
  },
]

const SECTION_CONFIG = {
  security: { color: 'error', icon: SecurityIcon, label: 'Security' },
  residential: { color: 'primary', icon: HomeIcon, label: 'Residential' },
  parking: { color: 'info', icon: DirectionsCarIcon, label: 'Parking' },
  pets: { color: 'success', icon: PetsIcon, label: 'Pets' },
  events: { color: 'secondary', icon: CelebrationIcon, label: 'Events' },
  commercial: { color: 'warning', icon: BusinessIcon, label: 'Commercial' },
  general: { color: 'default', icon: PolicyIcon, label: 'General' },
} as const

const STATUS_CONFIG = {
  active: { color: 'success', label: 'Active' },
  draft: { color: 'warning', label: 'Draft' },
  archived: { color: 'default', label: 'Archived' },
} as const

export default function PoliciesPage() {
  const { t } = useTranslate()
  const language = useI18nStore((s) => s.language)
  const { activeSite, slug: derivedSlug } = useSiteBackNavigation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSection, setSelectedSection] = useState<PolicySection | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<PolicyStatus | 'all'>('all')
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null)

  // Filter policies
  const filteredPolicies = useMemo(() => {
    return MOCK_POLICIES.filter((policy) => {
      if (derivedSlug && policy.siteSlugs && !policy.siteSlugs.includes(derivedSlug)) {
        return false
      }
      if (
        searchTerm &&
        !policy.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !policy.description.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false
      }
      if (selectedSection !== 'all' && policy.section !== selectedSection) return false
      if (selectedStatus !== 'all' && policy.status !== selectedStatus) return false
      return true
    })
  }, [derivedSlug, searchTerm, selectedSection, selectedStatus])

  const handleViewPolicy = (policy: Policy) => {
    setSelectedPolicy(policy)
    setViewDialogOpen(true)
  }

  const PolicyCard = ({ policy }: { policy: Policy }) => {
    const sectionConfig = SECTION_CONFIG[policy.section]
    const statusConfig = STATUS_CONFIG[policy.status]
    const SectionIcon = sectionConfig.icon

    return (
      <Card
        sx={{
          height: '100%',
          '&:hover': {
            boxShadow: theme.shadows[4],
          },
        }}
      >
        <CardHeader
          avatar={
            <SectionIcon
              sx={{
                color:
                  sectionConfig.color === 'default'
                    ? theme.palette.text.primary
                    : (
                        theme.palette[
                          sectionConfig.color as
                            | 'primary'
                            | 'secondary'
                            | 'error'
                            | 'info'
                            | 'success'
                            | 'warning'
                        ] as { main: string }
                      )?.main || theme.palette.text.primary,
                fontSize: 24,
              }}
            />
          }
          title={
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              {policy.title}
            </Typography>
          }
          subheader={
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
              <Chip
                label={sectionConfig.label}
                size="small"
                color={
                  sectionConfig.color as
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
              <Typography variant="caption" color="text.secondary">
                v{policy.version}
              </Typography>
            </Stack>
          }
          action={
            <IconButton onClick={() => handleViewPolicy(policy)}>
              <VisibilityIcon />
            </IconButton>
          }
        />
        <CardContent sx={{ pt: 0 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {policy.description}
          </Typography>

          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <AccessTimeIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                <strong>
                  {t('admin.policies.fields.effectiveDate', {
                    lng: language,
                    defaultValue: 'Effective',
                  })}
                  :
                </strong>{' '}
                {new Date(policy.effectiveDate).toLocaleDateString()}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <PersonIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                <strong>
                  {t('admin.policies.fields.updatedBy', {
                    lng: language,
                    defaultValue: 'Updated by',
                  })}
                  :
                </strong>{' '}
                {policy.updatedBy}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    )
  }

  return (
    <Stack spacing={3}>
      {/* Site-scoped alert */}
      {activeSite ? (
        <Alert
          severity="info"
          icon={<AddBusinessIcon fontSize="inherit" />}
          sx={{ alignItems: 'center', borderRadius: 2 }}
        >
          <Typography variant="body2">
            {t('admin.policies.alerts.siteScoped', {
              lng: language,
              defaultValue: 'Policies shown are scoped to',
            })}{' '}
            <strong>{activeSite.name}</strong>.
          </Typography>
        </Alert>
      ) : null}
      <PageHeader
        title={t('admin.policies.title', { lng: language, defaultValue: 'Policies & Regulations' })}
        subtitle={t('admin.policies.subtitle', {
          lng: language,
          defaultValue: 'Manage community policies, rules, and guidelines',
        })}
        rightActions={
          <Button variant="contained" startIcon={<AddIcon />}>
            {t('admin.policies.actions.create', { lng: language, defaultValue: 'New Policy' })}
          </Button>
        }
      />

      {/* Search and Filters */}
      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <TextField
            placeholder={t('admin.policies.search.placeholder', {
              lng: language,
              defaultValue: 'Search policies...',
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

          <Grid container spacing={2} alignItems="flex-start">
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  {t('admin.policies.filters.allSections', {
                    lng: language,
                    defaultValue: 'All Sections',
                  })}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    rowGap: 1,
                    columnGap: 1,
                    overflowX: { xs: 'auto', md: 'visible' },
                    pb: { xs: 0.5, md: 0 },
                  }}
                >
                  <Chip
                    label={t('admin.policies.filters.allSections', {
                      lng: language,
                      defaultValue: 'All Sections',
                    })}
                    onClick={() => setSelectedSection('all')}
                    color={selectedSection === 'all' ? 'primary' : 'default'}
                    variant={selectedSection === 'all' ? 'filled' : 'outlined'}
                  />
                  {Object.entries(SECTION_CONFIG).map(([key, config]) => {
                    const IconComponent = config.icon
                    return (
                      <Chip
                        key={key}
                        icon={<IconComponent />}
                        label={config.label}
                        onClick={() => setSelectedSection(key as PolicySection)}
                        color={
                          selectedSection === key
                            ? (config.color as
                                | 'default'
                                | 'primary'
                                | 'secondary'
                                | 'error'
                                | 'info'
                                | 'success'
                                | 'warning')
                            : 'default'
                        }
                        variant={selectedSection === key ? 'filled' : 'outlined'}
                      />
                    )
                  })}
                </Box>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  {t('admin.policies.filters.allStatuses', {
                    lng: language,
                    defaultValue: 'All Status',
                  })}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', rowGap: 1, columnGap: 1 }}>
                  <Chip
                    label={t('admin.policies.filters.allStatuses', {
                      lng: language,
                      defaultValue: 'All Status',
                    })}
                    onClick={() => setSelectedStatus('all')}
                    color={selectedStatus === 'all' ? 'primary' : 'default'}
                    variant={selectedStatus === 'all' ? 'filled' : 'outlined'}
                  />
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <Chip
                      key={key}
                      label={config.label}
                      onClick={() => setSelectedStatus(key as PolicyStatus)}
                      color={
                        selectedStatus === key
                          ? (config.color as
                              | 'default'
                              | 'primary'
                              | 'secondary'
                              | 'error'
                              | 'info'
                              | 'success'
                              | 'warning')
                          : 'default'
                      }
                      variant={selectedStatus === key ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Paper>

      {/* Results */}
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('admin.policies.resultsCount', {
            lng: language,
            defaultValue: 'Showing {count} policies',
            count: filteredPolicies.length,
          })}
        </Typography>

        <Grid container spacing={3}>
          {filteredPolicies.map((policy) => (
            <Grid key={policy.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <PolicyCard policy={policy} />
            </Grid>
          ))}
        </Grid>

        {filteredPolicies.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <PolicyIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              {t('admin.policies.empty.title', {
                lng: language,
                defaultValue: 'No policies found',
              })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('admin.policies.empty.description', {
                lng: language,
                defaultValue: 'Try adjusting your filters or create a new policy.',
              })}
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Policy Detail Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        {selectedPolicy && (
          <>
            <DialogTitle>
              <Stack direction="row" alignItems="center" spacing={2}>
                {(() => {
                  const IconComponent = SECTION_CONFIG[selectedPolicy.section].icon
                  const color = SECTION_CONFIG[selectedPolicy.section].color
                  return (
                    <IconComponent
                      sx={{
                        color:
                          color === 'default'
                            ? theme.palette.text.primary
                            : (
                                theme.palette[
                                  color as
                                    | 'primary'
                                    | 'secondary'
                                    | 'error'
                                    | 'info'
                                    | 'success'
                                    | 'warning'
                                ] as { main: string }
                              )?.main || theme.palette.text.primary,
                      }}
                    />
                  )
                })()}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={600}>
                    {selectedPolicy.title}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                    <Chip
                      label={SECTION_CONFIG[selectedPolicy.section].label}
                      size="small"
                      color={
                        SECTION_CONFIG[selectedPolicy.section].color as
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
                      label={STATUS_CONFIG[selectedPolicy.status].label}
                      size="small"
                      color={
                        STATUS_CONFIG[selectedPolicy.status].color as
                          | 'default'
                          | 'primary'
                          | 'secondary'
                          | 'error'
                          | 'info'
                          | 'success'
                          | 'warning'
                      }
                    />
                    <Typography variant="caption" color="text.secondary">
                      Version {selectedPolicy.version}
                    </Typography>
                  </Stack>
                </Box>
                <IconButton onClick={() => setViewDialogOpen(false)}>
                  <VisibilityIcon />
                </IconButton>
              </Stack>
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={3}>
                {/* Policy Info */}
                <Box>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedPolicy.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedPolicy.content}
                  </Typography>
                </Box>

                <Divider />

                {/* Rules */}
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {t('admin.policies.sections.rules', {
                        lng: language,
                        defaultValue: 'Rules & Guidelines',
                      })}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={1}>
                      {selectedPolicy.rules.map((rule, index) => (
                        <Typography key={index} variant="body2" sx={{ pl: 2 }}>
                          • {rule}
                        </Typography>
                      ))}
                    </Stack>
                  </AccordionDetails>
                </Accordion>

                {/* Consequences */}
                {selectedPolicy.consequences && (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {t('admin.policies.sections.consequences', {
                          lng: language,
                          defaultValue: 'Violations & Consequences',
                        })}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={1}>
                        {selectedPolicy.consequences.map((consequence, index) => (
                          <Typography key={index} variant="body2" sx={{ pl: 2 }}>
                            • {consequence}
                          </Typography>
                        ))}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                )}

                {/* Policy Details */}
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    {t('admin.policies.sections.details', {
                      lng: language,
                      defaultValue: 'Policy Details',
                    })}
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="caption">
                      <strong>
                        {t('admin.policies.fields.effectiveDate', {
                          lng: language,
                          defaultValue: 'Effective Date',
                        })}
                        :
                      </strong>{' '}
                      {new Date(selectedPolicy.effectiveDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption">
                      <strong>
                        {t('admin.policies.fields.lastUpdated', {
                          lng: language,
                          defaultValue: 'Last Updated',
                        })}
                        :
                      </strong>{' '}
                      {new Date(selectedPolicy.lastUpdated).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption">
                      <strong>
                        {t('admin.policies.fields.updatedBy', {
                          lng: language,
                          defaultValue: 'Updated By',
                        })}
                        :
                      </strong>{' '}
                      {selectedPolicy.updatedBy}
                    </Typography>
                  </Stack>
                </Paper>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialogOpen(false)}>
                {t('common.close', { lng: language, defaultValue: 'Close' })}
              </Button>
              <Button startIcon={<EditIcon />} variant="contained">
                {t('common.edit', { lng: language, defaultValue: 'Edit Policy' })}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Stack>
  )
}
