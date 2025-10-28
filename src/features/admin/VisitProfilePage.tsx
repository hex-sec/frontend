// import { useMemo } from 'react'
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
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import PersonIcon from '@mui/icons-material/Person'
import HomeIcon from '@mui/icons-material/Home'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import EventIcon from '@mui/icons-material/Event'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PendingIcon from '@mui/icons-material/Pending'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import QrCodeIcon from '@mui/icons-material/QrCode'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import BadgeIcon from '@mui/icons-material/Badge'

import { alpha } from '@mui/material/styles'
import PageHeader from './components/PageHeader'
import { useBreadcrumbBackAction } from '@app/layout/useBreadcrumbBackAction'
// import buildEntityUrl from '@app/utils/contextPaths'
import { useTranslate } from '@i18n/useTranslate'
import { useI18nStore } from '@store/i18n.store'
// import { formatBackLabel } from '@app/layout/backNavigation'
import { useState } from 'react'

// Mock visit data structure
type VisitStatus = 'scheduled' | 'admitted' | 'completed' | 'cancelled'
type VisitType = 'guest' | 'delivery' | 'maintenance' | 'business'

type Visit = {
  id: string
  visitorName: string
  visitorPhone: string
  visitorEmail: string
  visitorId?: string
  hostName: string
  hostUnit: string
  vehiclePlate?: string
  visitType: VisitType
  status: VisitStatus
  scheduledDate: string
  scheduledTime: string
  entryTime?: string
  exitTime?: string
  notes?: string
  qrCode: string
  guardNotes?: string
}

// Mock data - in real app this would come from API
const MOCK_VISIT: Visit = {
  id: 'visit-123',
  visitorName: 'Carlos Rodriguez',
  visitorPhone: '+1-555-0123',
  visitorEmail: 'carlos.rodriguez@email.com',
  visitorId: 'V-123456',
  hostName: 'Maria Santos',
  hostUnit: 'Tower A - Apt 1205',
  vehiclePlate: 'ABC-123',
  visitType: 'guest',
  status: 'admitted',
  scheduledDate: '2025-10-28',
  scheduledTime: '14:30',
  entryTime: '14:35',
  notes: 'Birthday celebration visit',
  qrCode: 'QR123456789',
  guardNotes: 'Visitor verified with ID',
}

const STATUS_CONFIG = {
  scheduled: { color: 'warning', icon: PendingIcon, label: 'Scheduled' },
  admitted: { color: 'info', icon: CheckCircleIcon, label: 'Admitted' },
  completed: { color: 'success', icon: CheckCircleIcon, label: 'Completed' },
  cancelled: { color: 'error', icon: CancelOutlinedIcon, label: 'Cancelled' },
} as const

const VISIT_TYPE_CONFIG = {
  guest: { color: 'primary', label: 'Guest Visit' },
  delivery: { color: 'info', label: 'Delivery' },
  maintenance: { color: 'warning', label: 'Maintenance' },
  business: { color: 'secondary', label: 'Business' },
} as const

function formatDateTime(date: string, time?: string) {
  const dateObj = new Date(date)
  const formatted = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  return time ? `${formatted} at ${time}` : formatted
}

export default function VisitProfilePage() {
  // const { visitId } = useParams()
  const { t } = useTranslate()
  const language = useI18nStore((s) => s.language)
  const [isEditing, setIsEditing] = useState(false)
  const [editedVisit, setEditedVisit] = useState<Visit>(MOCK_VISIT)

  // In real app, this would fetch data based on visitId
  const visit = MOCK_VISIT

  const statusConfig = STATUS_CONFIG[visit.status]
  const typeConfig = VISIT_TYPE_CONFIG[visit.visitType]
  const StatusIcon = statusConfig.icon

  // Back navigation
  useBreadcrumbBackAction({
    label: t('common.back', { lng: language, defaultValue: 'Back' }),
    to: '/admin/visits',
    variant: 'outlined',
    color: 'inherit',
  })

  const mobileBackButton = (
    <IconButton
      size="small"
      edge="start"
      component={RouterLink}
      to="/admin/visits"
      aria-label={t('common.back', { lng: language, defaultValue: 'Back' })}
    >
      <ArrowBackIcon />
    </IconButton>
  )

  // Actions
  const handleEdit = () => setIsEditing(true)
  const handleCancel = () => {
    setIsEditing(false)
    setEditedVisit(visit)
  }
  const handleSave = () => {
    // In real app, this would save to API
    console.log('Saving visit:', editedVisit)
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
      label: t(`admin.visitProfile.status.${visit.status}`, {
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
      label: t(`admin.visitProfile.type.${visit.visitType}`, {
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
      <StatusIcon />
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
    field?: keyof Visit
    type?: 'text' | 'select' | 'datetime-local'
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
                value={editedVisit[field] as string}
                onChange={(e) => setEditedVisit((prev) => ({ ...prev, [field]: e.target.value }))}
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
              value={editedVisit[field]}
              onChange={(e) => setEditedVisit((prev) => ({ ...prev, [field]: e.target.value }))}
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
          title={visit.visitorName}
          subtitle={t('admin.visitProfile.subtitle', {
            lng: language,
            defaultValue: 'Visit Details',
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
              {/* Visitor Information */}
              <Paper sx={{ p: 3, borderRadius: 3, width: '100%' }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  {t('admin.visitProfile.sections.visitorInfo', {
                    lng: language,
                    defaultValue: 'Visitor Information',
                  })}
                </Typography>
                <Stack spacing={2}>
                  <InfoField
                    icon={<PersonIcon fontSize="small" />}
                    label={t('admin.visitProfile.fields.visitorName', {
                      lng: language,
                      defaultValue: 'Visitor Name',
                    })}
                    value={visit.visitorName}
                    editable
                    field="visitorName"
                  />
                  <InfoField
                    icon={<PhoneIcon fontSize="small" />}
                    label={t('admin.visitProfile.fields.phone', {
                      lng: language,
                      defaultValue: 'Phone',
                    })}
                    value={visit.visitorPhone}
                    editable
                    field="visitorPhone"
                  />
                  <InfoField
                    icon={<EmailIcon fontSize="small" />}
                    label={t('admin.visitProfile.fields.email', {
                      lng: language,
                      defaultValue: 'Email',
                    })}
                    value={visit.visitorEmail}
                    editable
                    field="visitorEmail"
                  />
                  {visit.visitorId && (
                    <InfoField
                      icon={<BadgeIcon fontSize="small" />}
                      label={t('admin.visitProfile.fields.visitorId', {
                        lng: language,
                        defaultValue: 'Visitor ID',
                      })}
                      value={visit.visitorId}
                      editable
                      field="visitorId"
                    />
                  )}
                </Stack>
              </Paper>

              {/* Visit Details */}
              <Paper sx={{ p: 3, borderRadius: 3, width: '100%' }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  {t('admin.visitProfile.sections.visitDetails', {
                    lng: language,
                    defaultValue: 'Visit Details',
                  })}
                </Typography>
                <Stack spacing={2}>
                  <InfoField
                    icon={<HomeIcon fontSize="small" />}
                    label={t('admin.visitProfile.fields.host', {
                      lng: language,
                      defaultValue: 'Host',
                    })}
                    value={`${visit.hostName} - ${visit.hostUnit}`}
                    editable
                    field="hostName"
                  />
                  <InfoField
                    icon={<EventIcon fontSize="small" />}
                    label={t('admin.visitProfile.fields.scheduled', {
                      lng: language,
                      defaultValue: 'Scheduled',
                    })}
                    value={formatDateTime(visit.scheduledDate, visit.scheduledTime)}
                  />
                  {visit.entryTime && (
                    <InfoField
                      icon={<AccessTimeIcon fontSize="small" />}
                      label={t('admin.visitProfile.fields.entryTime', {
                        lng: language,
                        defaultValue: 'Entry Time',
                      })}
                      value={visit.entryTime}
                    />
                  )}
                  {visit.exitTime && (
                    <InfoField
                      icon={<AccessTimeIcon fontSize="small" />}
                      label={t('admin.visitProfile.fields.exitTime', {
                        lng: language,
                        defaultValue: 'Exit Time',
                      })}
                      value={visit.exitTime}
                    />
                  )}
                  {visit.vehiclePlate && (
                    <InfoField
                      icon={<DirectionsCarIcon fontSize="small" />}
                      label={t('admin.visitProfile.fields.vehicle', {
                        lng: language,
                        defaultValue: 'Vehicle',
                      })}
                      value={visit.vehiclePlate}
                      editable
                      field="vehiclePlate"
                    />
                  )}
                </Stack>
              </Paper>

              {/* Notes */}
              {(visit.notes || visit.guardNotes || isEditing) && (
                <Paper sx={{ p: 3, borderRadius: 3, width: '100%' }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                    {t('admin.visitProfile.sections.notes', {
                      lng: language,
                      defaultValue: 'Notes',
                    })}
                  </Typography>
                  <Stack spacing={2}>
                    {(visit.notes || isEditing) && (
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mb: 1 }}
                        >
                          {t('admin.visitProfile.fields.visitNotes', {
                            lng: language,
                            defaultValue: 'Visit Notes',
                          })}
                        </Typography>
                        {isEditing ? (
                          <TextField
                            multiline
                            rows={3}
                            value={editedVisit.notes || ''}
                            onChange={(e) =>
                              setEditedVisit((prev) => ({ ...prev, notes: e.target.value }))
                            }
                            fullWidth
                            placeholder={t('admin.visitProfile.fields.visitNotesPlaceholder', {
                              lng: language,
                              defaultValue: 'Add visit notes...',
                            })}
                          />
                        ) : (
                          <Typography variant="body2">
                            {visit.notes ||
                              t('common.none', { lng: language, defaultValue: 'None' })}
                          </Typography>
                        )}
                      </Box>
                    )}
                    {(visit.guardNotes || isEditing) && (
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mb: 1 }}
                        >
                          {t('admin.visitProfile.fields.guardNotes', {
                            lng: language,
                            defaultValue: 'Guard Notes',
                          })}
                        </Typography>
                        {isEditing ? (
                          <TextField
                            multiline
                            rows={3}
                            value={editedVisit.guardNotes || ''}
                            onChange={(e) =>
                              setEditedVisit((prev) => ({ ...prev, guardNotes: e.target.value }))
                            }
                            fullWidth
                            placeholder={t('admin.visitProfile.fields.guardNotesPlaceholder', {
                              lng: language,
                              defaultValue: 'Add guard notes...',
                            })}
                          />
                        ) : (
                          <Typography variant="body2">
                            {visit.guardNotes ||
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

          {/* Right Column - Status & Actions */}
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
            <Stack spacing={3} sx={{ width: '100%' }}>
              {/* Status Management */}
              <Paper sx={{ p: 3, borderRadius: 3, width: '100%' }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  {t('admin.visitProfile.sections.status', {
                    lng: language,
                    defaultValue: 'Status Management',
                  })}
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 1 }}
                    >
                      {t('admin.visitProfile.fields.currentStatus', {
                        lng: language,
                        defaultValue: 'Current Status',
                      })}
                    </Typography>
                    {isEditing ? (
                      <FormControl size="small" fullWidth>
                        <Select
                          value={editedVisit.status}
                          onChange={(e) =>
                            setEditedVisit((prev) => ({
                              ...prev,
                              status: e.target.value as VisitStatus,
                            }))
                          }
                        >
                          <MenuItem value="scheduled">
                            {t('admin.visitProfile.status.scheduled', {
                              lng: language,
                              defaultValue: 'Scheduled',
                            })}
                          </MenuItem>
                          <MenuItem value="admitted">
                            {t('admin.visitProfile.status.admitted', {
                              lng: language,
                              defaultValue: 'Admitted',
                            })}
                          </MenuItem>
                          <MenuItem value="completed">
                            {t('admin.visitProfile.status.completed', {
                              lng: language,
                              defaultValue: 'Completed',
                            })}
                          </MenuItem>
                          <MenuItem value="cancelled">
                            {t('admin.visitProfile.status.cancelled', {
                              lng: language,
                              defaultValue: 'Cancelled',
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
                      {t('admin.visitProfile.fields.visitType', {
                        lng: language,
                        defaultValue: 'Visit Type',
                      })}
                    </Typography>
                    {isEditing ? (
                      <FormControl size="small" fullWidth>
                        <Select
                          value={editedVisit.visitType}
                          onChange={(e) =>
                            setEditedVisit((prev) => ({
                              ...prev,
                              visitType: e.target.value as VisitType,
                            }))
                          }
                        >
                          <MenuItem value="guest">
                            {t('admin.visitProfile.type.guest', {
                              lng: language,
                              defaultValue: 'Guest Visit',
                            })}
                          </MenuItem>
                          <MenuItem value="delivery">
                            {t('admin.visitProfile.type.delivery', {
                              lng: language,
                              defaultValue: 'Delivery',
                            })}
                          </MenuItem>
                          <MenuItem value="maintenance">
                            {t('admin.visitProfile.type.maintenance', {
                              lng: language,
                              defaultValue: 'Maintenance',
                            })}
                          </MenuItem>
                          <MenuItem value="business">
                            {t('admin.visitProfile.type.business', {
                              lng: language,
                              defaultValue: 'Business',
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
                </Stack>
              </Paper>

              {/* QR Code */}
              <Paper sx={{ p: 3, borderRadius: 3, width: '100%', textAlign: 'center' }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  {t('admin.visitProfile.sections.qrCode', {
                    lng: language,
                    defaultValue: 'QR Code',
                  })}
                </Typography>
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: 'grey.100',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <QrCodeIcon sx={{ fontSize: 60, color: 'grey.400' }} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {visit.qrCode}
                </Typography>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  )
}
