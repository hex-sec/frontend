import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
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
  const { t } = useTranslate()
  const language = useI18nStore((s) => s.language)
  const [isEditing, setIsEditing] = useState(false)
  const [editedVehicle, setEditedVehicle] = useState<Vehicle>(MOCK_VEHICLE)

  // In real app, this would fetch data based on vehicleId
  const vehicle = MOCK_VEHICLE

  const statusConfig = STATUS_CONFIG[vehicle.status]
  const typeConfig = VEHICLE_TYPE_CONFIG[vehicle.type]
  const StatusIcon = statusConfig.icon

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

  return (
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

        <Grid container spacing={3} alignItems="stretch">
          {/* Left Column - Main Details */}
          <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex' }}>
            <Stack spacing={3} sx={{ width: '100%' }}>
              {/* Vehicle Information */}
              <Paper sx={{ p: 3, borderRadius: 3, width: '100%' }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  {t('admin.vehicleDetail.sections.vehicleInfo', {
                    lng: language,
                    defaultValue: 'Vehicle Information',
                  })}
                </Typography>
                <Stack spacing={2}>
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
                  {vehicle.lastSeen && (
                    <InfoField
                      icon={<SecurityIcon fontSize="small" />}
                      label={t('admin.vehicleDetail.fields.lastSeen', {
                        lng: language,
                        defaultValue: 'Last Seen',
                      })}
                      value={new Date(vehicle.lastSeen).toLocaleString()}
                    />
                  )}
                </Stack>
              </Paper>

              {/* Owner Information */}
              <Paper sx={{ p: 3, borderRadius: 3, width: '100%' }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  {t('admin.vehicleDetail.sections.ownerInfo', {
                    lng: language,
                    defaultValue: 'Owner Information',
                  })}
                </Typography>
                <Stack spacing={2}>
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
                  {vehicle.parkingSpot && (
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
                  )}
                </Stack>
              </Paper>

              {/* Notes */}
              {(vehicle.notes || vehicle.securityNotes || isEditing) && (
                <Paper sx={{ p: 3, borderRadius: 3, width: '100%' }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                    {t('admin.vehicleDetail.sections.notes', {
                      lng: language,
                      defaultValue: 'Notes',
                    })}
                  </Typography>
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
                              setEditedVehicle((prev) => ({ ...prev, notes: e.target.value }))
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
                            placeholder={t('admin.vehicleDetail.fields.securityNotesPlaceholder', {
                              lng: language,
                              defaultValue: 'Add security notes...',
                            })}
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
                </Paper>
              )}
            </Stack>
          </Grid>

          {/* Right Column - Status & Settings */}
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
            <Stack spacing={3} sx={{ width: '100%' }}>
              {/* Status Management */}
              <Paper sx={{ p: 3, borderRadius: 3, width: '100%' }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  {t('admin.vehicleDetail.sections.status', {
                    lng: language,
                    defaultValue: 'Status & Settings',
                  })}
                </Typography>
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
              </Paper>

              {/* Registration Info */}
              <Paper sx={{ p: 3, borderRadius: 3, width: '100%' }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  {t('admin.vehicleDetail.sections.registration', {
                    lng: language,
                    defaultValue: 'Registration Info',
                  })}
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 1 }}
                    >
                      {t('admin.vehicleDetail.fields.registrationDate', {
                        lng: language,
                        defaultValue: 'Registration Date',
                      })}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formatDate(vehicle.registrationDate)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 1 }}
                    >
                      {t('admin.vehicleDetail.fields.vehicleId', {
                        lng: language,
                        defaultValue: 'Vehicle ID',
                      })}
                    </Typography>
                    <Typography variant="body2" fontWeight={500} sx={{ fontFamily: 'monospace' }}>
                      {vehicle.id}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  )
}
