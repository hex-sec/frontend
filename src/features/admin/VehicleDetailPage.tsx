import { useState, useEffect } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Typography,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  Select,
  Switch,
  FormControlLabel,
  Skeleton,
  Fade,
  useTheme,
  Divider,
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import PersonIcon from '@mui/icons-material/Person'
import HomeIcon from '@mui/icons-material/Home'
import ColorLensIcon from '@mui/icons-material/ColorLens'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import VerifiedIcon from '@mui/icons-material/Verified'
import WarningIcon from '@mui/icons-material/Warning'
import BlockIcon from '@mui/icons-material/Block'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import BadgeIcon from '@mui/icons-material/Badge'
import LocalParkingIcon from '@mui/icons-material/LocalParking'
import SecurityIcon from '@mui/icons-material/Security'
import InfoIcon from '@mui/icons-material/Info'
import BuildCircleIcon from '@mui/icons-material/BuildCircle'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import DescriptionIcon from '@mui/icons-material/Description'

import { alpha } from '@mui/material/styles'
import PageHeader from './components/PageHeader'
import { useBreadcrumbBackAction } from '@app/layout/useBreadcrumbBackAction'
// import buildEntityUrl from '@app/utils/contextPaths'
import { useTranslate } from '@i18n/useTranslate'
import { useI18nStore } from '@store/i18n.store'
// import { formatBackLabel } from '@app/layout/backNavigation'

// Vehicle data types
type VehicleStatus = 'active' | 'blocked' | 'pending'
type VehicleType = 'car' | 'motorcycle' | 'suv' | 'truck' | 'van'

type Vehicle = {
  id: string
  plate: string
  brand: string
  model: string
  year: string
  color: string
  type: VehicleType
  status: VehicleStatus
  ownerName: string
  ownerPhone: string
  ownerEmail: string
  ownerUnit: string
  registrationDate: string
  lastSeen?: string
  isResident: boolean
  parkingSpot?: string
  notes?: string
  securityNotes?: string
  verified: boolean
}

// Mock data - in real app this would come from API
const MOCK_VEHICLE: Vehicle = {
  id: 'vehicle-456',
  plate: 'ABC-123',
  brand: 'Toyota',
  model: 'Camry',
  year: '2022',
  color: 'Silver',
  type: 'car',
  status: 'active',
  ownerName: 'Maria Santos',
  ownerPhone: '+1-555-0456',
  ownerEmail: 'maria.santos@email.com',
  ownerUnit: 'Tower A - Apt 1205',
  registrationDate: '2025-01-15',
  lastSeen: '2025-10-27 08:30',
  isResident: true,
  parkingSpot: 'A-105',
  notes: 'Primary family vehicle',
  securityNotes: 'Verified ownership documents',
  verified: true,
}

const STATUS_CONFIG = {
  active: { color: 'success', icon: VerifiedIcon, label: 'Active' },
  blocked: { color: 'error', icon: BlockIcon, label: 'Blocked' },
  pending: { color: 'warning', icon: WarningIcon, label: 'Pending Approval' },
} as const

const VEHICLE_TYPE_CONFIG = {
  car: { color: 'primary', label: 'Car' },
  motorcycle: { color: 'secondary', label: 'Motorcycle' },
  suv: { color: 'info', label: 'SUV' },
  truck: { color: 'warning', label: 'Truck' },
  van: { color: 'success', label: 'Van' },
} as const

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function VehicleDetailPage() {
  // const { vehicleId } = useParams()
  const location = useLocation()
  const { t } = useTranslate()
  const language = useI18nStore((s) => s.language)
  const theme = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [editedVehicle, setEditedVehicle] = useState<Vehicle>(MOCK_VEHICLE)
  const [isLoading, setIsLoading] = useState(false)

  // In real app, this would fetch data based on vehicleId
  const vehicle = MOCK_VEHICLE

  // Show loading state when navigation between vehicles
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 400) // Small delay to simulate data loading

    return () => clearTimeout(timer)
  }, [location.pathname])

  const statusConfig = STATUS_CONFIG[vehicle.status]
  const typeConfig = VEHICLE_TYPE_CONFIG[vehicle.type]
  const StatusIcon = statusConfig.icon

  // Color scheme based on status
  const statusColorMap = {
    active: '#4caf50',
    blocked: '#f44336',
    pending: '#ff9800',
  }
  const statusColor = statusColorMap[vehicle.status]

  // Back navigation
  useBreadcrumbBackAction({
    label: t('common.back', { lng: language, defaultValue: 'Back' }),
    to: '/admin/vehicles',
    variant: 'outlined',
    color: 'inherit',
  })

  const mobileBackButton = (
    <IconButton
      size="small"
      edge="start"
      component={RouterLink}
      to="/admin/vehicles"
      aria-label={t('common.back', { lng: language, defaultValue: 'Back' })}
    >
      <ArrowBackIcon />
    </IconButton>
  )

  // Actions
  const handleEdit = () => setIsEditing(true)
  const handleCancel = () => {
    setIsEditing(false)
    setEditedVehicle(vehicle)
  }
  const handleSave = () => {
    // In real app, this would save to API
    console.log('Saving vehicle:', editedVehicle)
    setIsEditing(false)
  }

  const rightActions = (
    <Stack direction="row" spacing={1} alignItems="center">
      {isEditing ? (
        <>
          <Button startIcon={<CancelIcon />} onClick={handleCancel}>
            {t('common.cancel', { lng: language, defaultValue: 'Cancel' })}
          </Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
            {t('common.save', { lng: language, defaultValue: 'Save' })}
          </Button>
        </>
      ) : (
        <Button startIcon={<EditIcon />} variant="contained" onClick={handleEdit}>
          {t('common.edit', { lng: language, defaultValue: 'Edit' })}
        </Button>
      )}
    </Stack>
  )

  const mobileActions = (
    <Stack direction="row" spacing={0.5} alignItems="center">
      {isEditing ? (
        <>
          <IconButton size="small" onClick={handleCancel}>
            <CancelIcon />
          </IconButton>
          <IconButton size="small" color="primary" onClick={handleSave}>
            <SaveIcon />
          </IconButton>
        </>
      ) : (
        <IconButton size="small" color="primary" onClick={handleEdit}>
          <EditIcon />
        </IconButton>
      )}
    </Stack>
  )

  const badges = [
    {
      label: t(`admin.vehicleDetail.status.${vehicle.status}`, {
        lng: language,
        defaultValue: statusConfig.label,
      }),
      color: statusConfig.color as
        | 'default'
        | 'primary'
        | 'secondary'
        | 'error'
        | 'info'
        | 'success'
        | 'warning',
    },
    {
      label: t(`admin.vehicleDetail.type.${vehicle.type}`, {
        lng: language,
        defaultValue: typeConfig.label,
      }),
      color: typeConfig.color as
        | 'default'
        | 'primary'
        | 'secondary'
        | 'error'
        | 'info'
        | 'success'
        | 'warning',
    },
    ...(vehicle.verified
      ? [
          {
            label: t('admin.vehicleDetail.verified', { lng: language, defaultValue: 'Verified' }),
            color: 'success' as
              | 'default'
              | 'primary'
              | 'secondary'
              | 'error'
              | 'info'
              | 'success'
              | 'warning',
          },
        ]
      : []),
    ...(vehicle.isResident
      ? [
          {
            label: t('admin.vehicleDetail.resident', { lng: language, defaultValue: 'Resident' }),
            color: 'info' as
              | 'default'
              | 'primary'
              | 'secondary'
              | 'error'
              | 'info'
              | 'success'
              | 'warning',
          },
        ]
      : []),
  ]

  const headerAvatar = (
    <Avatar
      sx={{
        bgcolor: alpha(
          statusConfig.color === 'warning'
            ? '#ff9800'
            : statusConfig.color === 'success'
              ? '#4caf50'
              : statusConfig.color === 'error'
                ? '#f44336'
                : '#2196f3',
          0.1,
        ),
        color:
          statusConfig.color === 'warning'
            ? '#ff9800'
            : statusConfig.color === 'success'
              ? '#4caf50'
              : statusConfig.color === 'error'
                ? '#f44336'
                : '#2196f3',
        width: { xs: 48, md: 56 },
        height: { xs: 48, md: 56 },
      }}
    >
      <DirectionsCarIcon />
    </Avatar>
  )

  const InfoField = ({
    icon,
    label,
    value,
    editable = false,
    field,
    type = 'text',
    options,
  }: {
    icon: React.ReactNode
    label: string
    value: string
    editable?: boolean
    field?: keyof Vehicle
    type?: 'text' | 'select' | 'date'
    options?: { value: string; label: string }[]
  }) => (
    <Stack direction="row" spacing={2} alignItems="center">
      <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>{icon}</Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {label}
        </Typography>
        {isEditing && editable && field ? (
          type === 'select' ? (
            <FormControl size="small" fullWidth>
              <Select
                value={editedVehicle[field] as string}
                onChange={(e) => setEditedVehicle((prev) => ({ ...prev, [field]: e.target.value }))}
              >
                {options?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <TextField
              size="small"
              type={type}
              value={editedVehicle[field]}
              onChange={(e) => setEditedVehicle((prev) => ({ ...prev, [field]: e.target.value }))}
              fullWidth
            />
          )
        ) : (
          <Typography variant="body2" fontWeight={500}>
            {value}
          </Typography>
        )}
      </Box>
    </Stack>
  )

  // Skeleton loader component
  const renderSkeleton = () => (
    <Stack spacing={3}>
      {/* Page Header Skeleton */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Skeleton variant="circular" width={64} height={64} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="50%" height={32} />
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
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="50%" height={20} />
                    <Skeleton variant="text" width="30%" height={28} sx={{ mt: 0.5 }} />
                  </Box>
                </Stack>
              </Stack>
            </Paper>

            {/* Vehicle Info Skeleton */}
            <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Skeleton variant="text" width="40%" height={24} />
                </Stack>
                <Stack spacing={1.5}>
                  {[1, 2, 3, 4].map((i) => (
                    <Stack key={i} direction="row" spacing={1.5} alignItems="center">
                      <Skeleton variant="circular" width={32} height={32} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="30%" height={16} />
                        <Skeleton variant="text" width="60%" height={20} sx={{ mt: 0.5 }} />
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Paper>

            {/* Owner Info Skeleton */}
            <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Skeleton variant="text" width="40%" height={24} />
                </Stack>
                <Stack spacing={1.5}>
                  {[1, 2, 3].map((i) => (
                    <Stack key={i} direction="row" spacing={1.5} alignItems="center">
                      <Skeleton variant="circular" width={32} height={32} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="30%" height={16} />
                        <Skeleton variant="text" width="70%" height={20} sx={{ mt: 0.5 }} />
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        {/* Right Column Skeleton */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={{ xs: 2, md: 3 }}>
            {/* Vehicle Details Skeleton */}
            <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Skeleton variant="text" width="50%" height={24} />
                </Stack>
                <Skeleton variant="rectangular" width="100%" height={1} />
                <Stack spacing={2}>
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={80}
                    sx={{ borderRadius: 2 }}
                  />
                  <Stack spacing={1}>
                    {[1, 2].map((i) => (
                      <Stack key={i} direction="row" spacing={1.5} sx={{ p: 1 }}>
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
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Stack>
            </Paper>

            {/* Last Visit Skeleton */}
            <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="40%" height={24} />
                    <Skeleton variant="text" width="50%" height={20} sx={{ mt: 0.5 }} />
                  </Box>
                </Stack>
                <Skeleton variant="rectangular" width="100%" height={1} />
                <Skeleton variant="rectangular" width="100%" height={80} sx={{ borderRadius: 2 }} />
              </Stack>
            </Paper>

            {/* Settings Skeleton */}
            <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Skeleton variant="text" width="40%" height={24} />
                </Stack>
                <Skeleton variant="rectangular" width="100%" height={1} />
                <Stack spacing={2}>
                  {[1, 2, 3].map((i) => (
                    <Box key={i}>
                      <Skeleton variant="text" width="40%" height={16} sx={{ mb: 1 }} />
                      <Skeleton
                        variant="rectangular"
                        width="100%"
                        height={36}
                        sx={{ borderRadius: 1 }}
                      />
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  )

  return (
    <Box sx={{ position: 'relative', minHeight: 200 }}>
      {/* Skeleton with fade out */}
      <Fade in={isLoading} timeout={{ enter: 0, exit: 300 }} unmountOnExit>
        <Box sx={{ position: 'absolute', inset: 0, zIndex: 1, bgcolor: 'background.default' }}>
          {renderSkeleton()}
        </Box>
      </Fade>

      {/* Real content with fade in */}
      <Fade in={!isLoading} timeout={{ enter: 400, exit: 0 }} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: isLoading ? 'absolute' : 'static',
            top: 0,
            left: 0,
            right: 0,
            opacity: isLoading ? 0 : 1,
          }}
        >
          <Box sx={{ width: '100%', py: { xs: 2, md: 3 } }}>
            <Stack
              spacing={3}
              sx={{
                width: '100%',
                maxWidth: { xs: '100%', xl: 1200 },
                mx: 'auto',
                px: { xs: 1.5, sm: 2, xl: 0 },
              }}
            >
              <PageHeader
                title={`${vehicle.brand} ${vehicle.model} (${vehicle.plate})`}
                subtitle={t('admin.vehicleDetail.subtitle', {
                  lng: language,
                  defaultValue: 'Vehicle Details',
                })}
                badges={badges}
                rightActions={rightActions}
                mobileBackButton={mobileBackButton}
                mobileActions={mobileActions}
                avatar={headerAvatar}
              />

              <Grid container spacing={{ xs: 2, md: 3 }}>
                {/* Left Column - Main Details */}
                <Grid size={{ xs: 12, lg: 8 }}>
                  <Stack spacing={{ xs: 2, md: 3 }}>
                    {/* Status Overview Card */}
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
                                {t('admin.vehicleDetail.currentStatus', {
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

                    {/* Vehicle Information */}
                    <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
                      <Stack spacing={{ xs: 2, md: 2.5 }}>
                        <Stack spacing={0.75}>
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
                              <DirectionsCarIcon />
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
                              {t('admin.vehicleDetail.sections.vehicleInfo', {
                                lng: language,
                                defaultValue: 'Vehicle Information',
                              })}
                            </Typography>
                          </Stack>
                        </Stack>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <InfoField
                              icon={<BadgeIcon fontSize="small" />}
                              label={t('admin.vehicleDetail.fields.plate', {
                                lng: language,
                                defaultValue: 'License Plate',
                              })}
                              value={vehicle.plate}
                              editable
                              field="plate"
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <InfoField
                              icon={<DirectionsCarIcon fontSize="small" />}
                              label={t('admin.vehicleDetail.fields.brand', {
                                lng: language,
                                defaultValue: 'Brand',
                              })}
                              value={vehicle.brand}
                              editable
                              field="brand"
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <InfoField
                              icon={<DirectionsCarIcon fontSize="small" />}
                              label={t('admin.vehicleDetail.fields.model', {
                                lng: language,
                                defaultValue: 'Model',
                              })}
                              value={vehicle.model}
                              editable
                              field="model"
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <InfoField
                              icon={<CalendarMonthIcon fontSize="small" />}
                              label={t('admin.vehicleDetail.fields.year', {
                                lng: language,
                                defaultValue: 'Year',
                              })}
                              value={vehicle.year}
                              editable
                              field="year"
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <InfoField
                              icon={<ColorLensIcon fontSize="small" />}
                              label={t('admin.vehicleDetail.fields.color', {
                                lng: language,
                                defaultValue: 'Color',
                              })}
                              value={vehicle.color}
                              editable
                              field="color"
                            />
                          </Grid>
                          {vehicle.lastSeen && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <InfoField
                                icon={<SecurityIcon fontSize="small" />}
                                label={t('admin.vehicleDetail.fields.lastSeen', {
                                  lng: language,
                                  defaultValue: 'Last Seen',
                                })}
                                value={new Date(vehicle.lastSeen).toLocaleString()}
                              />
                            </Grid>
                          )}
                        </Grid>
                      </Stack>
                    </Paper>

                    {/* Owner Information */}
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
                              {t('admin.vehicleDetail.sections.ownerInfo', {
                                lng: language,
                                defaultValue: 'Owner Information',
                              })}
                            </Typography>
                          </Stack>
                        </Stack>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <InfoField
                              icon={<PersonIcon fontSize="small" />}
                              label={t('admin.vehicleDetail.fields.ownerName', {
                                lng: language,
                                defaultValue: 'Owner Name',
                              })}
                              value={vehicle.ownerName}
                              editable
                              field="ownerName"
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <InfoField
                              icon={<PhoneIcon fontSize="small" />}
                              label={t('admin.vehicleDetail.fields.phone', {
                                lng: language,
                                defaultValue: 'Phone',
                              })}
                              value={vehicle.ownerPhone}
                              editable
                              field="ownerPhone"
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <InfoField
                              icon={<EmailIcon fontSize="small" />}
                              label={t('admin.vehicleDetail.fields.email', {
                                lng: language,
                                defaultValue: 'Email',
                              })}
                              value={vehicle.ownerEmail}
                              editable
                              field="ownerEmail"
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <InfoField
                              icon={<HomeIcon fontSize="small" />}
                              label={t('admin.vehicleDetail.fields.unit', {
                                lng: language,
                                defaultValue: 'Unit',
                              })}
                              value={vehicle.ownerUnit}
                              editable
                              field="ownerUnit"
                            />
                          </Grid>
                          {vehicle.parkingSpot && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <InfoField
                                icon={<LocalParkingIcon fontSize="small" />}
                                label={t('admin.vehicleDetail.fields.parkingSpot', {
                                  lng: language,
                                  defaultValue: 'Parking Spot',
                                })}
                                value={vehicle.parkingSpot}
                                editable
                                field="parkingSpot"
                              />
                            </Grid>
                          )}
                        </Grid>
                      </Stack>
                    </Paper>

                    {/* Notes */}
                    {(vehicle.notes || vehicle.securityNotes || isEditing) && (
                      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
                        <Stack spacing={{ xs: 2, md: 2.5 }}>
                          <Stack direction="row" alignItems="center" spacing={{ xs: 1, md: 1.5 }}>
                            <Box
                              sx={{
                                p: { xs: 0.75, md: 1 },
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                color: 'secondary.main',
                              }}
                            >
                              <DescriptionIcon fontSize="small" />
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
                              {t('admin.vehicleDetail.sections.notes', {
                                lng: language,
                                defaultValue: 'Notes',
                              })}
                            </Typography>
                          </Stack>
                          <Stack spacing={2}>
                            {(vehicle.notes || isEditing) && (
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ display: 'block', mb: 1 }}
                                >
                                  {t('admin.vehicleDetail.fields.notes', {
                                    lng: language,
                                    defaultValue: 'General Notes',
                                  })}
                                </Typography>
                                {isEditing ? (
                                  <TextField
                                    multiline
                                    rows={3}
                                    value={editedVehicle.notes || ''}
                                    onChange={(e) =>
                                      setEditedVehicle((prev) => ({
                                        ...prev,
                                        notes: e.target.value,
                                      }))
                                    }
                                    fullWidth
                                    placeholder={t('admin.vehicleDetail.fields.notesPlaceholder', {
                                      lng: language,
                                      defaultValue: 'Add general notes...',
                                    })}
                                  />
                                ) : (
                                  <Typography variant="body2">
                                    {vehicle.notes ||
                                      t('common.none', { lng: language, defaultValue: 'None' })}
                                  </Typography>
                                )}
                              </Box>
                            )}
                            {(vehicle.securityNotes || isEditing) && (
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ display: 'block', mb: 1 }}
                                >
                                  {t('admin.vehicleDetail.fields.securityNotes', {
                                    lng: language,
                                    defaultValue: 'Security Notes',
                                  })}
                                </Typography>
                                {isEditing ? (
                                  <TextField
                                    multiline
                                    rows={3}
                                    value={editedVehicle.securityNotes || ''}
                                    onChange={(e) =>
                                      setEditedVehicle((prev) => ({
                                        ...prev,
                                        securityNotes: e.target.value,
                                      }))
                                    }
                                    fullWidth
                                    placeholder={t(
                                      'admin.vehicleDetail.fields.securityNotesPlaceholder',
                                      {
                                        lng: language,
                                        defaultValue: 'Add security notes...',
                                      },
                                    )}
                                  />
                                ) : (
                                  <Typography variant="body2">
                                    {vehicle.securityNotes ||
                                      t('common.none', { lng: language, defaultValue: 'None' })}
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </Stack>
                        </Stack>
                      </Paper>
                    )}
                  </Stack>
                </Grid>

                {/* Right Column - Vehicle Details */}
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
                            {t('admin.vehicleDetail.sections.vehicleDetails', {
                              lng: language,
                              defaultValue: 'Vehicle Details',
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
                                {t('admin.vehicleDetail.fields.vehicleId', {
                                  lng: language,
                                  defaultValue: 'Vehicle ID',
                                })}
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{ fontFamily: 'monospace' }}
                              >
                                {vehicle.id}
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
                                <CalendarMonthIcon fontSize="small" />
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  {t('admin.vehicleDetail.fields.registrationDate', {
                                    lng: language,
                                    defaultValue: 'Registration Date',
                                  })}
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                  {formatDate(vehicle.registrationDate)}
                                </Typography>
                              </Box>
                            </Stack>

                            {vehicle.parkingSpot && (
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={{ xs: 1, md: 1.5 }}
                                sx={{
                                  p: { xs: 1, md: 1.5 },
                                  borderRadius: 2,
                                  bgcolor: alpha(theme.palette.success.main, 0.03),
                                }}
                              >
                                <Box
                                  sx={{
                                    p: { xs: 0.75, md: 1 },
                                    borderRadius: 1.5,
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    color: 'success.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <LocalParkingIcon fontSize="small" />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    {t('admin.vehicleDetail.fields.parkingSpot', {
                                      lng: language,
                                      defaultValue: 'Parking Spot',
                                    })}
                                  </Typography>
                                  <Typography variant="body2" fontWeight={500}>
                                    {vehicle.parkingSpot}
                                  </Typography>
                                </Box>
                              </Stack>
                            )}
                          </Stack>
                        </Stack>
                      </Stack>
                    </Paper>

                    {/* Last Visit Card */}
                    {vehicle.lastSeen && (
                      <Paper
                        sx={{
                          p: { xs: 2, md: 3 },
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.02)} 100%)`,
                          border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                        }}
                      >
                        <Stack spacing={2}>
                          <Stack spacing={0.75}>
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
                                <AccessTimeIcon />
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
                                {t('admin.vehicleDetail.lastVisit', { defaultValue: 'Last Visit' })}
                              </Typography>
                            </Stack>
                          </Stack>
                          <Divider />
                          <Box
                            sx={{
                              p: { xs: 1.5, md: 2 },
                              borderRadius: 2,
                              bgcolor: 'background.paper',
                              border: '1px solid',
                              borderColor: alpha(theme.palette.info.main, 0.2),
                            }}
                          >
                            <Typography
                              variant="h6"
                              fontWeight={700}
                              color="info.main"
                              sx={{
                                mb: 0.5,
                                fontSize: {
                                  xs: theme.typography.h6.fontSize,
                                  md: theme.typography.h5.fontSize,
                                },
                              }}
                            >
                              {new Date(vehicle.lastSeen).toLocaleString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t('admin.vehicleDetail.lastVisitDescription', {
                                defaultValue: 'Last vehicle access recorded',
                              })}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    )}

                    {/* Status Management */}
                    <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
                      <Stack spacing={{ xs: 2, md: 2.5 }}>
                        <Stack direction="row" alignItems="center" spacing={{ xs: 1, md: 1.5 }}>
                          <Box
                            sx={{
                              p: { xs: 0.75, md: 1 },
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.warning.main, 0.1),
                              color: 'warning.main',
                            }}
                          >
                            <BuildCircleIcon />
                          </Box>
                          <Typography variant="h6" fontWeight={600}>
                            {t('admin.vehicleDetail.sections.settings', {
                              lng: language,
                              defaultValue: 'Settings',
                            })}
                          </Typography>
                        </Stack>
                        <Divider />
                        <Stack spacing={2}>
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'block', mb: 1 }}
                            >
                              {t('admin.vehicleDetail.fields.status', {
                                lng: language,
                                defaultValue: 'Status',
                              })}
                            </Typography>
                            {isEditing ? (
                              <FormControl size="small" fullWidth>
                                <Select
                                  value={editedVehicle.status}
                                  onChange={(e) =>
                                    setEditedVehicle((prev) => ({
                                      ...prev,
                                      status: e.target.value as VehicleStatus,
                                    }))
                                  }
                                >
                                  <MenuItem value="active">
                                    {t('admin.vehicleDetail.status.active', {
                                      lng: language,
                                      defaultValue: 'Active',
                                    })}
                                  </MenuItem>
                                  <MenuItem value="pending">
                                    {t('admin.vehicleDetail.status.pending', {
                                      lng: language,
                                      defaultValue: 'Pending Approval',
                                    })}
                                  </MenuItem>
                                  <MenuItem value="blocked">
                                    {t('admin.vehicleDetail.status.blocked', {
                                      lng: language,
                                      defaultValue: 'Blocked',
                                    })}
                                  </MenuItem>
                                </Select>
                              </FormControl>
                            ) : (
                              <Chip
                                icon={<StatusIcon />}
                                label={statusConfig.label}
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
                                size="small"
                              />
                            )}
                          </Box>

                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'block', mb: 1 }}
                            >
                              {t('admin.vehicleDetail.fields.type', {
                                lng: language,
                                defaultValue: 'Vehicle Type',
                              })}
                            </Typography>
                            {isEditing ? (
                              <FormControl size="small" fullWidth>
                                <Select
                                  value={editedVehicle.type}
                                  onChange={(e) =>
                                    setEditedVehicle((prev) => ({
                                      ...prev,
                                      type: e.target.value as VehicleType,
                                    }))
                                  }
                                >
                                  <MenuItem value="car">
                                    {t('admin.vehicleDetail.type.car', {
                                      lng: language,
                                      defaultValue: 'Car',
                                    })}
                                  </MenuItem>
                                  <MenuItem value="suv">
                                    {t('admin.vehicleDetail.type.suv', {
                                      lng: language,
                                      defaultValue: 'SUV',
                                    })}
                                  </MenuItem>
                                  <MenuItem value="motorcycle">
                                    {t('admin.vehicleDetail.type.motorcycle', {
                                      lng: language,
                                      defaultValue: 'Motorcycle',
                                    })}
                                  </MenuItem>
                                  <MenuItem value="truck">
                                    {t('admin.vehicleDetail.type.truck', {
                                      lng: language,
                                      defaultValue: 'Truck',
                                    })}
                                  </MenuItem>
                                  <MenuItem value="van">
                                    {t('admin.vehicleDetail.type.van', {
                                      lng: language,
                                      defaultValue: 'Van',
                                    })}
                                  </MenuItem>
                                </Select>
                              </FormControl>
                            ) : (
                              <Chip
                                label={typeConfig.label}
                                color={
                                  typeConfig.color as
                                    | 'default'
                                    | 'primary'
                                    | 'secondary'
                                    | 'error'
                                    | 'info'
                                    | 'success'
                                    | 'warning'
                                }
                                size="small"
                              />
                            )}
                          </Box>

                          <FormControlLabel
                            control={
                              <Switch
                                checked={isEditing ? editedVehicle.verified : vehicle.verified}
                                onChange={
                                  isEditing
                                    ? (e) =>
                                        setEditedVehicle((prev) => ({
                                          ...prev,
                                          verified: e.target.checked,
                                        }))
                                    : () => {}
                                }
                                disabled={!isEditing}
                              />
                            }
                            label={t('admin.vehicleDetail.fields.verified', {
                              lng: language,
                              defaultValue: 'Verified',
                            })}
                          />

                          <FormControlLabel
                            control={
                              <Switch
                                checked={isEditing ? editedVehicle.isResident : vehicle.isResident}
                                onChange={
                                  isEditing
                                    ? (e) =>
                                        setEditedVehicle((prev) => ({
                                          ...prev,
                                          isResident: e.target.checked,
                                        }))
                                    : () => {}
                                }
                                disabled={!isEditing}
                              />
                            }
                            label={t('admin.vehicleDetail.fields.isResident', {
                              lng: language,
                              defaultValue: 'Resident Vehicle',
                            })}
                          />
                        </Stack>
                      </Stack>
                    </Paper>
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          </Box>
        </Box>
      </Fade>
    </Box>
  )
}
