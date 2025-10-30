import { useState, useEffect } from 'react'
import { Link as RouterLink, useParams, useLocation } from 'react-router-dom'
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Typography,
  Divider,
  Card,
  CardContent,
  useTheme,
  Skeleton,
  Fade,
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import { alpha } from '@mui/material/styles'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWork'
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'
import SubjectIcon from '@mui/icons-material/Subject'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn'
import BuildCircleIcon from '@mui/icons-material/BuildCircle'
import PersonIcon from '@mui/icons-material/Person'
import BedIcon from '@mui/icons-material/Bed'
import SquareFootIcon from '@mui/icons-material/SquareFoot'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import DomainIcon from '@mui/icons-material/Domain'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import InfoIcon from '@mui/icons-material/Info'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PageHeader from './components/PageHeader'
import { useBreadcrumbBackAction } from '@app/layout/useBreadcrumbBackAction'
import buildEntityUrl from '@app/utils/contextPaths'
import { useTranslate } from '@i18n/useTranslate'
import { useI18nStore } from '@store/i18n.store'
import { useSiteBackNavigation } from '@app/layout/useSiteBackNavigation'
import residencesSeed from '../../mocks/residences.json'
import vehiclesSeed from '../../mocks/vehicles.json'

type ResidenceStatus = 'occupied' | 'vacant' | 'maintenance'
type ResidenceType = 'tower' | 'villa' | 'amenity' | 'parcel'

type Vehicle = {
  id: string
  plate: string
  makeModel: string
  color: string
  lastSeen: string
}

type Residence = {
  id: string
  label: string
  type: ResidenceType
  status: ResidenceStatus
  residents: string[]
  mainResident?: string
  vehicles?: Vehicle[]
  bedrooms: number
  areaSqFt: number
  siteSlug: string
  siteName: string
  lastInspection: string
}

const MOCK_RESIDENCES: Residence[] = (residencesSeed as Array<Record<string, unknown>>).map((r) => {
  const residents = (r.residents as string[]) ?? []
  const residenceId = String(r.id)

  // Find vehicles assigned to this residence
  const assignedVehicles = (vehiclesSeed as Array<Record<string, unknown>>)
    .filter((v) => String(v.assignedTo) === residenceId)
    .map(
      (v): Vehicle => ({
        id: String(v.id),
        plate: String(v.plate),
        makeModel: String(v.makeModel),
        color: String(v.color),
        lastSeen: String(v.lastSeen),
      }),
    )

  return {
    id: residenceId,
    label: String(r.label),
    type: r.type as ResidenceType,
    status: r.status as ResidenceStatus,
    residents,
    mainResident: residents.length > 0 ? residents[0] : undefined,
    vehicles: assignedVehicles.length > 0 ? assignedVehicles : undefined,
    bedrooms: Number(r.bedrooms),
    areaSqFt: Number(r.areaSqFt),
    siteSlug: String(r.siteSlug),
    siteName: String(r.siteName),
    lastInspection: String(r.lastInspection),
  }
})

const STATUS_CONFIG = {
  occupied: { color: 'success', icon: CheckCircleOutlineIcon, label: 'Occupied' },
  vacant: { color: 'default', icon: DoNotDisturbOnIcon, label: 'Vacant' },
  maintenance: { color: 'warning', icon: BuildCircleIcon, label: 'Maintenance' },
} as const

const TYPE_CONFIG = {
  tower: { icon: MapsHomeWorkIcon, label: 'High-rise' },
  villa: { icon: HomeWorkIcon, label: 'Villa' },
  amenity: { icon: MeetingRoomIcon, label: 'Amenity' },
  parcel: { icon: SubjectIcon, label: 'Parcel' },
} as const

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function ResidenceDetailPage() {
  const { residenceId } = useParams<{ residenceId: string }>()
  const location = useLocation()
  const { t } = useTranslate()
  const language = useI18nStore((s) => s.language)
  const { slug: derivedSiteSlug } = useSiteBackNavigation()
  const theme = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [, setIsEditing] = useState(false)

  // In real app, this would fetch data based on residenceId
  const residence = MOCK_RESIDENCES.find((r) => r.id === residenceId)

  // Show loading state when navigation between residences
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 400) // Small delay to simulate data loading

    return () => clearTimeout(timer)
  }, [location.pathname])

  // Skeleton loader component
  const renderSkeleton = () => (
    <Stack spacing={3}>
      {/* Page Header Skeleton */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Skeleton variant="circular" width={64} height={64} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="40%" height={32} />
          <Skeleton variant="text" width="30%" height={24} sx={{ mt: 1 }} />
        </Box>
        <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
      </Box>

      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* Left Column Skeleton */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={{ xs: 2, md: 3 }}>
            {/* Status Card Skeleton */}
            <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="50%" height={24} />
                    <Skeleton variant="text" width="30%" height={20} sx={{ mt: 0.5 }} />
                  </Box>
                </Box>
              </Stack>
            </Paper>

            {/* Residents Card Skeleton */}
            <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="30%" height={24} />
                    <Skeleton variant="text" width="40%" height={20} sx={{ mt: 0.5 }} />
                  </Box>
                </Box>
                <Stack spacing={1}>
                  {[1, 2].map((i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5 }}>
                      <Skeleton variant="circular" width={40} height={40} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="60%" height={20} />
                        <Skeleton variant="text" width="40%" height={16} sx={{ mt: 0.5 }} />
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </Paper>

            {/* Vehicles Card Skeleton */}
            <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="30%" height={24} />
                    <Skeleton variant="text" width="40%" height={20} sx={{ mt: 0.5 }} />
                  </Box>
                </Box>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5 }}>
                    <Skeleton
                      variant="rectangular"
                      width={40}
                      height={40}
                      sx={{ borderRadius: 2 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="50%" height={20} />
                      <Skeleton variant="text" width="70%" height={16} sx={{ mt: 0.5 }} />
                    </Box>
                  </Box>
                </Stack>
              </Stack>
            </Paper>

            {/* Layout Card Skeleton */}
            <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="50%" height={24} />
                    <Skeleton variant="text" width="30%" height={20} sx={{ mt: 0.5 }} />
                  </Box>
                </Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Skeleton
                            variant="rectangular"
                            width={48}
                            height={48}
                            sx={{ borderRadius: 2 }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="40%" height={16} />
                            <Skeleton variant="text" width="30%" height={32} sx={{ mt: 0.5 }} />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Skeleton
                            variant="rectangular"
                            width={48}
                            height={48}
                            sx={{ borderRadius: 2 }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="40%" height={16} />
                            <Skeleton variant="text" width="50%" height={28} sx={{ mt: 0.5 }} />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        {/* Right Column Skeleton */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={{ xs: 2, md: 3 }}>
            {/* Property Info Skeleton */}
            <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Skeleton variant="text" width="50%" height={24} />
                </Box>
                <Divider />
                <Skeleton variant="rectangular" width="100%" height={80} sx={{ borderRadius: 2 }} />
                <Stack spacing={1}>
                  {[1, 2].map((i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1 }}>
                      <Skeleton
                        variant="rectangular"
                        width={32}
                        height={32}
                        sx={{ borderRadius: 1.5 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="40%" height={16} />
                        <Skeleton variant="text" width="60%" height={20} sx={{ mt: 0.5 }} />
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </Paper>

            {/* Inspection Card Skeleton */}
            <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="50%" height={24} />
                    <Skeleton variant="text" width="40%" height={20} sx={{ mt: 0.5 }} />
                  </Box>
                </Box>
                <Divider />
                <Skeleton variant="rectangular" width="100%" height={80} sx={{ borderRadius: 2 }} />
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  )

  if (!residence) {
    return (
      <Stack spacing={3} alignItems="center" sx={{ py: 8 }}>
        <Typography variant="h4" color="text.secondary">
          {t('residencesPage.notFound.title', { defaultValue: 'Residence not found' })}
        </Typography>
        <Button
          component={RouterLink}
          to={buildEntityUrl('residences')}
          startIcon={<ArrowBackIcon />}
        >
          {t('residencesPage.notFound.backToResidences', { defaultValue: 'Back to Residences' })}
        </Button>
      </Stack>
    )
  }

  const statusConfig = STATUS_CONFIG[residence.status]
  const typeConfig = TYPE_CONFIG[residence.type]
  const StatusIcon = statusConfig.icon
  const TypeIcon = typeConfig.icon

  // Color scheme based on status
  const statusColorMap = {
    occupied: '#4caf50',
    vacant: '#9e9e9e',
    maintenance: '#ff9800',
  }
  const statusColor = statusColorMap[residence.status]

  // Build back navigation URL
  const backUrl = derivedSiteSlug
    ? `/site/${derivedSiteSlug}/residences`
    : buildEntityUrl('residences')

  // Back navigation
  useBreadcrumbBackAction({
    label: t('layout.breadcrumbs.residences', { lng: language }),
    to: backUrl,
    variant: 'outlined',
    color: 'inherit',
  })

  const mobileBackButton = (
    <IconButton
      size="small"
      edge="start"
      component={RouterLink}
      to={backUrl}
      aria-label={t('common.back', { lng: language, defaultValue: 'Back' })}
    >
      <ArrowBackIcon />
    </IconButton>
  )

  const badges = [
    { label: statusConfig.label, color: statusConfig.color as 'success' | 'default' | 'warning' },
    { label: typeConfig.label, color: 'info' as const },
  ]

  const rightActions = (
    <Button variant="contained" startIcon={<EditIcon />} onClick={() => setIsEditing(true)}>
      {t('common.edit', { lng: language, defaultValue: 'Edit' })}
    </Button>
  )

  const mobileActions = (
    <IconButton
      color="primary"
      aria-label={t('common.edit', { lng: language, defaultValue: 'Edit' })}
      onClick={() => setIsEditing(true)}
    >
      <EditIcon fontSize="small" />
    </IconButton>
  )

  const headerAvatar = (
    <Avatar
      sx={{
        bgcolor: alpha(statusColor, 0.1),
        color: statusColor,
        width: { xs: 56, md: 64 },
        height: { xs: 56, md: 64 },
      }}
    >
      <TypeIcon />
    </Avatar>
  )

  return (
    <Box sx={{ position: 'relative', minHeight: 200 }}>
      {/* Skeleton with fade out */}
      <Fade in={isLoading} timeout={300} unmountOnExit>
        <Box>{renderSkeleton()}</Box>
      </Fade>

      {/* Real content with fade in */}
      <Fade in={!isLoading} timeout={400} unmountOnExit>
        <Box
          sx={{
            position: isLoading ? 'absolute' : 'static',
            top: 0,
            left: 0,
            right: 0,
            opacity: isLoading ? 0 : 1,
          }}
        >
          <Stack spacing={3}>
            <PageHeader
              title={residence.label}
              subtitle={typeConfig.label}
              badges={badges}
              rightActions={rightActions}
              mobileBackButton={mobileBackButton}
              mobileActions={mobileActions}
              avatar={headerAvatar}
            />

            <Grid container spacing={{ xs: 2, md: 3 }}>
              {/* Left Column - Residence Details */}
              <Grid size={{ xs: 12, lg: 8 }}>
                <Stack spacing={{ xs: 2, md: 3 }}>
                  {/* Status Overview Card with Stats */}
                  <Paper
                    sx={{
                      p: { xs: 2, md: 3 },
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${alpha(statusColor, 0.05)} 0%, ${alpha(statusColor, 0.02)} 100%)`,
                      border: `1px solid ${alpha(statusColor, 0.2)}`,
                    }}
                  >
                    <Stack spacing={{ xs: 2, md: 2.5 }}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={2}
                      >
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Box
                            sx={{
                              p: { xs: 0.75, md: 1 },
                              borderRadius: 2,
                              bgcolor: alpha(statusColor, 0.1),
                              color: statusColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <StatusIcon />
                          </Box>
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'block' }}
                            >
                              {t('residencesPage.details.currentStatus', {
                                defaultValue: 'Current Status',
                              })}
                            </Typography>
                            <Typography
                              variant="body1"
                              fontWeight={600}
                              sx={{
                                [theme.breakpoints.up('md')]: {
                                  fontSize: theme.typography.h6.fontSize,
                                  lineHeight: theme.typography.h6.lineHeight,
                                },
                              }}
                            >
                              {statusConfig.label}
                            </Typography>
                          </Box>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Paper>
                  {/* Residents Card */}
                  <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
                    <Stack spacing={{ xs: 2, md: 2.5 }}>
                      <Stack spacing={0.75}>
                        <Stack direction="row" alignItems="center" spacing={{ xs: 1, md: 1.5 }}>
                          <Box
                            sx={{
                              p: { xs: 0.75, md: 1 },
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: 'primary.main',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <PersonIcon />
                          </Box>
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            sx={{
                              fontSize: {
                                xs: theme.typography.subtitle1.fontSize,
                                md: theme.typography.h6.fontSize,
                              },
                            }}
                          >
                            {t('residencesPage.details.residents', { defaultValue: 'Residents' })}
                          </Typography>
                        </Stack>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ pl: { xs: 5, md: 6 } }}
                        >
                          {residence.residents.length === 0
                            ? t('residencesPage.details.noResidentsAssigned', {
                                defaultValue: 'No residents assigned',
                              })
                            : t('residencesPage.details.residentCount', {
                                defaultValue: '{{count}} resident(s)',
                                count: residence.residents.length,
                              })}
                        </Typography>
                      </Stack>
                      {residence.residents.length === 0 ? (
                        <Box
                          sx={{
                            py: { xs: 2.5, md: 3 },
                            px: { xs: 1.5, md: 2 },
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.text.secondary, 0.04),
                            textAlign: 'center',
                          }}
                        >
                          <PersonIcon
                            sx={{ fontSize: { xs: 40, md: 48 }, color: 'text.disabled', mb: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {t('residencesPage.details.noResidents', {
                              defaultValue: 'No residents assigned',
                            })}
                          </Typography>
                        </Box>
                      ) : (
                        <Stack spacing={1.5}>
                          {/* Main Resident */}
                          {residence.mainResident && (
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={{ xs: 1.5, md: 2 }}
                              sx={{
                                p: { xs: 1, md: 1.5 },
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                              }}
                            >
                              <Avatar
                                sx={{
                                  width: { xs: 36, md: 40 },
                                  height: { xs: 36, md: 40 },
                                  bgcolor: 'primary.main',
                                }}
                              >
                                {residence.mainResident
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" fontWeight={600}>
                                  {residence.mainResident}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {t('residencesPage.details.familyHead', {
                                    defaultValue: 'Family head',
                                  })}
                                </Typography>
                              </Box>
                              <VerifiedUserIcon
                                sx={{ fontSize: { xs: 18, md: 20 }, color: 'success.main' }}
                              />
                            </Stack>
                          )}

                          {/* Other Residents */}
                          {residence.residents.filter((name) => name !== residence.mainResident)
                            .length > 0 && (
                            <>
                              {residence.residents
                                .filter((name) => name !== residence.mainResident)
                                .map((name, index) => (
                                  <Stack
                                    key={index}
                                    direction="row"
                                    alignItems="center"
                                    spacing={{ xs: 1.5, md: 2 }}
                                    sx={{
                                      p: { xs: 1, md: 1.5 },
                                      borderRadius: 2,
                                      bgcolor: alpha(theme.palette.primary.main, 0.03),
                                      '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                                      },
                                    }}
                                  >
                                    <Avatar
                                      sx={{
                                        width: { xs: 36, md: 40 },
                                        height: { xs: 36, md: 40 },
                                        bgcolor: 'primary.main',
                                      }}
                                    >
                                      {name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')
                                        .slice(0, 2)
                                        .toUpperCase()}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="body2" fontWeight={500}>
                                        {name}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {t('residencesPage.details.verifiedResident', {
                                          defaultValue: 'Verified resident',
                                        })}
                                      </Typography>
                                    </Box>
                                    <VerifiedUserIcon
                                      sx={{ fontSize: { xs: 18, md: 20 }, color: 'success.main' }}
                                    />
                                  </Stack>
                                ))}
                            </>
                          )}
                        </Stack>
                      )}
                    </Stack>
                  </Paper>

                  {/* Vehicles Card */}
                  <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
                    <Stack spacing={{ xs: 2, md: 2.5 }}>
                      <Stack spacing={0.75}>
                        <Stack direction="row" alignItems="center" spacing={{ xs: 1, md: 1.5 }}>
                          <Box
                            sx={{
                              p: { xs: 0.75, md: 1 },
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.secondary.main, 0.1),
                              color: 'secondary.main',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <DirectionsCarIcon />
                          </Box>
                          <Typography
                            variant={
                              typeof theme.breakpoints.values.xs !== 'undefined' &&
                              theme.breakpoints.values.xs < theme.breakpoints.values.md
                                ? 'subtitle1'
                                : 'h6'
                            }
                            fontWeight={600}
                          >
                            {t('residencesPage.details.vehicles', { defaultValue: 'Vehicles' })}
                          </Typography>
                        </Stack>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ pl: { xs: 5, md: 6 } }}
                        >
                          {!residence.vehicles || residence.vehicles.length === 0
                            ? t('residencesPage.details.noVehiclesRegistered', {
                                defaultValue: 'No vehicles registered',
                              })
                            : t('residencesPage.details.vehicleCount', {
                                defaultValue: '{{count}} vehicle(s)',
                                count: residence.vehicles.length,
                              })}
                        </Typography>
                      </Stack>
                      {!residence.vehicles || residence.vehicles.length === 0 ? (
                        <Box
                          sx={{
                            py: { xs: 2.5, md: 3 },
                            px: { xs: 1.5, md: 2 },
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.text.secondary, 0.04),
                            textAlign: 'center',
                          }}
                        >
                          <DirectionsCarIcon
                            sx={{ fontSize: { xs: 40, md: 48 }, color: 'text.disabled', mb: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {t('residencesPage.details.noVehicles', {
                              defaultValue: 'No vehicles registered',
                            })}
                          </Typography>
                        </Box>
                      ) : (
                        <Stack spacing={1}>
                          {residence.vehicles.map((vehicle) => (
                            <Stack
                              key={vehicle.id}
                              direction="row"
                              alignItems="center"
                              spacing={{ xs: 1.5, md: 2 }}
                              sx={{
                                p: { xs: 1, md: 1.5 },
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.secondary.main, 0.03),
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.secondary.main, 0.05),
                                },
                              }}
                            >
                              <Box
                                sx={{
                                  p: 1,
                                  borderRadius: 2,
                                  bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                  color: 'secondary.main',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <DirectionsCarIcon />
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" fontWeight={600}>
                                  {vehicle.plate}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {vehicle.makeModel} • {vehicle.color}
                                </Typography>
                              </Box>
                              <Box
                                sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}
                              >
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                  <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {new Date(vehicle.lastSeen).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </Typography>
                                </Stack>
                              </Box>
                            </Stack>
                          ))}
                        </Stack>
                      )}
                    </Stack>
                  </Paper>

                  {/* Layout Card */}
                  <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
                    <Stack spacing={{ xs: 2, md: 2.5 }}>
                      <Stack direction="row" alignItems="center" spacing={{ xs: 1, md: 1.5 }}>
                        <Box
                          sx={{
                            p: { xs: 0.75, md: 1 },
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.info.main, 0.1),
                            color: 'info.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <TypeIcon />
                        </Box>
                        <Box>
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            sx={{
                              fontSize: {
                                xs: theme.typography.subtitle1.fontSize,
                                md: theme.typography.h6.fontSize,
                              },
                            }}
                          >
                            {t('residencesPage.details.layout', {
                              defaultValue: 'Layout & Specifications',
                            })}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t('residencesPage.details.unitDetails', {
                              defaultValue: 'Unit details',
                            })}
                          </Typography>
                        </Box>
                      </Stack>
                      <Grid container spacing={{ xs: 1.5, md: 2 }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Card
                            variant="outlined"
                            sx={{
                              height: '100%',
                              bgcolor: alpha(theme.palette.primary.main, 0.02),
                              borderColor: alpha(theme.palette.primary.main, 0.1),
                            }}
                          >
                            <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={{ xs: 1.5, md: 2 }}
                              >
                                <Box
                                  sx={{
                                    p: { xs: 1, md: 1.5 },
                                    borderRadius: 2,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: 'primary.main',
                                  }}
                                >
                                  <BedIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
                                </Box>
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ display: 'block', mb: 0.5 }}
                                  >
                                    {t('residencesPage.details.bedrooms', {
                                      defaultValue: 'Bedrooms',
                                    })}
                                  </Typography>
                                  <Typography
                                    variant="h5"
                                    fontWeight={700}
                                    color="primary.main"
                                    sx={{
                                      fontSize: {
                                        xs: theme.typography.h5.fontSize,
                                        md: theme.typography.h4.fontSize,
                                      },
                                    }}
                                  >
                                    {residence.bedrooms > 0
                                      ? residence.bedrooms
                                      : t('residencesPage.details.na', { defaultValue: 'N/A' })}
                                  </Typography>
                                </Box>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Card
                            variant="outlined"
                            sx={{
                              height: '100%',
                              bgcolor: alpha(theme.palette.success.main, 0.02),
                              borderColor: alpha(theme.palette.success.main, 0.1),
                            }}
                          >
                            <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={{ xs: 1.5, md: 2 }}
                              >
                                <Box
                                  sx={{
                                    p: { xs: 1, md: 1.5 },
                                    borderRadius: 2,
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    color: 'success.main',
                                  }}
                                >
                                  <SquareFootIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
                                </Box>
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ display: 'block', mb: 0.5 }}
                                  >
                                    {t('residencesPage.details.area', { defaultValue: 'Area' })}
                                  </Typography>
                                  <Typography
                                    variant="h6"
                                    fontWeight={700}
                                    color="success.main"
                                    sx={{
                                      fontSize: {
                                        xs: theme.typography.h6.fontSize,
                                        md: theme.typography.h5.fontSize,
                                      },
                                    }}
                                  >
                                    {residence.areaSqFt.toLocaleString()}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    sq ft
                                  </Typography>
                                </Box>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </Stack>
                  </Paper>
                </Stack>
              </Grid>

              {/* Right Column - Property Information */}
              <Grid size={{ xs: 12, lg: 4 }}>
                <Stack spacing={{ xs: 2, md: 3 }}>
                  {/* Quick Info Card */}
                  <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
                    <Stack spacing={{ xs: 2, md: 3 }}>
                      <Stack direction="row" alignItems="center" spacing={{ xs: 1, md: 1.5 }}>
                        <Box
                          sx={{
                            p: { xs: 0.75, md: 1 },
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                            color: 'secondary.main',
                          }}
                        >
                          <InfoIcon />
                        </Box>
                        <Typography variant="h6" fontWeight={600}>
                          {t('residencesPage.details.propertyInfo', {
                            defaultValue: 'Property Information',
                          })}
                        </Typography>
                      </Stack>
                      <Divider />

                      <Stack spacing={2}>
                        <Box
                          sx={{
                            p: { xs: 1.5, md: 2 },
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.text.secondary, 0.04),
                            border: '1px solid',
                            borderColor: alpha(theme.palette.text.secondary, 0.08),
                          }}
                        >
                          <Stack spacing={0.5}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontWeight: 500 }}
                            >
                              {t('residencesPage.details.residenceId', {
                                defaultValue: 'Residence ID',
                              })}
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{ fontFamily: 'monospace' }}
                            >
                              {residence.id}
                            </Typography>
                          </Stack>
                        </Box>

                        <Stack spacing={1}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={{ xs: 1, md: 1.5 }}
                            sx={{
                              p: { xs: 1, md: 1.5 },
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.primary.main, 0.03),
                            }}
                          >
                            <Box
                              sx={{
                                p: { xs: 0.75, md: 1 },
                                borderRadius: 1.5,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <DomainIcon fontSize="small" />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                {t('residencesPage.details.site', { defaultValue: 'Site' })}
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {residence.siteName}
                              </Typography>
                            </Box>
                          </Stack>

                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={{ xs: 1, md: 1.5 }}
                            sx={{
                              p: { xs: 1, md: 1.5 },
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.info.main, 0.03),
                            }}
                          >
                            <Box
                              sx={{
                                p: { xs: 0.75, md: 1 },
                                borderRadius: 1.5,
                                bgcolor: alpha(theme.palette.info.main, 0.1),
                                color: 'info.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <LocationOnIcon fontSize="small" />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                {t('residencesPage.details.siteSlug', {
                                  defaultValue: 'Site Identifier',
                                })}
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight={500}
                                sx={{ fontFamily: 'monospace' }}
                              >
                                {residence.siteSlug}
                              </Typography>
                            </Box>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Paper>

                  {/* Inspection Card */}
                  <Paper
                    sx={{
                      p: { xs: 2, md: 3 },
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.warning.main, 0.02)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                    }}
                  >
                    <Stack spacing={2}>
                      <Stack spacing={0.75}>
                        <Stack direction="row" alignItems="center" spacing={{ xs: 1, md: 1.5 }}>
                          <Box
                            sx={{
                              p: { xs: 0.75, md: 1 },
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.warning.main, 0.1),
                              color: 'warning.main',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <CalendarTodayIcon />
                          </Box>
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            sx={{
                              fontSize: {
                                xs: theme.typography.subtitle1.fontSize,
                                md: theme.typography.h6.fontSize,
                              },
                              lineHeight: {
                                xs: theme.typography.subtitle1.lineHeight,
                                md: theme.typography.h6.lineHeight,
                              },
                              fontWeight: {
                                xs: theme.typography.subtitle1.fontWeight ?? 600,
                                md: 600,
                              },
                            }}
                          >
                            {t('residencesPage.details.inspection', {
                              defaultValue: 'Last Inspection',
                            })}
                          </Typography>
                        </Stack>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ pl: { xs: 5, md: 6 } }}
                        >
                          {t('residencesPage.details.inspectionSubtitle', {
                            defaultValue: 'Compliance status',
                          })}
                        </Typography>
                      </Stack>
                      <Divider />
                      <Box
                        sx={{
                          p: { xs: 1.5, md: 2 },
                          borderRadius: 2,
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: alpha(theme.palette.warning.main, 0.2),
                        }}
                      >
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          color="warning.main"
                          sx={{
                            mb: 0.5,
                            fontSize: {
                              xs: theme.typography.h6.fontSize,
                              md: theme.typography.h5.fontSize,
                            },
                            lineHeight: {
                              xs: theme.typography.h6.lineHeight,
                              md: theme.typography.h5.lineHeight,
                            },
                            fontWeight: {
                              xs: theme.typography.h6.fontWeight ?? 700,
                              md: theme.typography.h5.fontWeight ?? 700,
                            },
                          }}
                        >
                          {formatDate(residence.lastInspection)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {residence.status === 'maintenance'
                            ? t('residencesPage.details.maintenanceRequired', {
                                defaultValue: 'Maintenance required',
                              })
                            : t('residencesPage.details.inCompliance', {
                                defaultValue: 'In compliance',
                              })}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </Box>
      </Fade>
    </Box>
  )
}
