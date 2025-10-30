import { useState } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Typography,
  TextField,
  Divider,
  FormControlLabel,
  Switch,
  Skeleton,
  Fade,
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import PersonIcon from '@mui/icons-material/Person'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import BadgeIcon from '@mui/icons-material/Badge'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'

import { alpha, useTheme } from '@mui/material/styles'
import PageHeader from './components/PageHeader'
import { useBreadcrumbBackAction } from '@app/layout/useBreadcrumbBackAction'
import { useTranslate } from '@i18n/useTranslate'
import { useI18nStore } from '@store/i18n.store'
import { useEffect } from 'react'

type Visitor = {
  id: string
  name: string
  phone: string
  email: string
  verified: boolean
  preferredVehicle?: string
  notes?: string
}

const MOCK_VISITOR: Visitor = {
  id: 'V-123456',
  name: 'Carlos Rodriguez',
  phone: '+1-555-0123',
  email: 'carlos.rodriguez@email.com',
  verified: true,
  preferredVehicle: 'ABC-123',
  notes: 'Frequent visitor. Requires access on weekends.',
}

export default function VisitorProfilePage() {
  // const { visitorId } = useParams()
  const { t } = useTranslate()
  const language = useI18nStore((s) => s.language)
  const theme = useTheme()
  const location = useLocation()
  const [isEditing, setIsEditing] = useState(false)
  const [editedVisitor, setEditedVisitor] = useState<Visitor>(MOCK_VISITOR)
  const [isLoading, setIsLoading] = useState(false)

  const visitor = MOCK_VISITOR

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 400)
    return () => clearTimeout(timer)
  }, [location.pathname])

  useBreadcrumbBackAction({
    label: t('common.back', { lng: language, defaultValue: 'Back' }),
    to: '/admin/visitors',
    variant: 'outlined',
    color: 'inherit',
  })

  const mobileBackButton = (
    <IconButton
      size="small"
      edge="start"
      component={RouterLink}
      to="/admin/visitors"
      aria-label={t('common.back', { lng: language, defaultValue: 'Back' })}
    >
      <ArrowBackIcon />
    </IconButton>
  )

  const handleEdit = () => setIsEditing(true)
  const handleCancel = () => {
    setIsEditing(false)
    setEditedVisitor(visitor)
  }
  const handleSave = () => {
    // In real app, this would save to API
    console.log('Saving visitor:', editedVisitor)
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

  const headerAvatar = (
    <Avatar
      sx={{
        bgcolor: alpha(theme.palette.info.main, 0.1),
        color: 'info.main',
        width: { xs: 48, md: 56 },
        height: { xs: 48, md: 56 },
      }}
    >
      <PersonIcon />
    </Avatar>
  )

  const InfoField = ({
    icon,
    label,
    value,
    editable = false,
    field,
    type = 'text',
  }: {
    icon: React.ReactNode
    label: string
    value: string
    editable?: boolean
    field?: keyof Visitor
    type?: 'text' | 'email' | 'tel'
  }) => (
    <Stack direction="row" spacing={2} alignItems="center">
      <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>{icon}</Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {label}
        </Typography>
        {isEditing && editable && field ? (
          <TextField
            size="small"
            type={type}
            value={editedVisitor[field] as string}
            onChange={(e) =>
              setEditedVisitor((prev) => ({ ...prev, [field]: e.target.value as never }))
            }
            fullWidth
          />
        ) : (
          <Typography variant="body2" fontWeight={500}>
            {value}
          </Typography>
        )}
      </Box>
    </Stack>
  )

  return (
    <Box sx={{ position: 'relative', minHeight: 200 }}>
      <Fade in={isLoading} timeout={{ enter: 0, exit: 300 }} unmountOnExit>
        <Box sx={{ position: 'absolute', inset: 0, zIndex: 1, bgcolor: 'background.default' }}>
          <Stack
            spacing={3}
            sx={{
              px: { xs: 1.5, sm: 2, xl: 0 },
              py: { xs: 2, md: 3 },
              maxWidth: { xs: '100%', xl: 1200 },
              mx: 'auto',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Skeleton variant="circular" width={64} height={64} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="50%" height={32} />
                <Skeleton variant="text" width="30%" height={24} sx={{ mt: 1 }} />
              </Box>
              <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
            </Box>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Stack spacing={{ xs: 2, md: 3 }}>
                  <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
                    <Skeleton variant="text" width="40%" height={24} />
                    <Stack spacing={1.5} sx={{ mt: 1 }}>
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
                  </Paper>
                  <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
                    <Skeleton variant="text" width="40%" height={24} />
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={80}
                      sx={{ borderRadius: 2, mt: 1 }}
                    />
                  </Paper>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={{ xs: 2, md: 3 }}>
                  <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
                    <Skeleton variant="text" width="50%" height={24} />
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={80}
                      sx={{ borderRadius: 2, mt: 1 }}
                    />
                  </Paper>
                  <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
                    <Skeleton variant="text" width="40%" height={24} />
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={36}
                      sx={{ borderRadius: 1, mt: 1 }}
                    />
                  </Paper>
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </Box>
      </Fade>

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
                title={visitor.name}
                subtitle={t('admin.visitorProfile.subtitle', {
                  lng: language,
                  defaultValue: 'Visitor Details',
                })}
                badges={
                  [
                    visitor.verified
                      ? {
                          label: t('admin.visitorProfile.verified', {
                            lng: language,
                            defaultValue: 'Verified',
                          }),
                          color: 'success' as const,
                        }
                      : {
                          label: t('admin.visitorProfile.unverified', {
                            lng: language,
                            defaultValue: 'Unverified',
                          }),
                          color: 'warning' as const,
                        },
                    editedVisitor.preferredVehicle
                      ? {
                          label: t('admin.visitorProfile.badges.hasVehicle', {
                            lng: language,
                            defaultValue: 'Has vehicle',
                          }),
                          color: 'info' as const,
                        }
                      : undefined,
                  ].filter(Boolean) as Array<{
                    label: string
                    color:
                      | 'default'
                      | 'primary'
                      | 'secondary'
                      | 'error'
                      | 'info'
                      | 'success'
                      | 'warning'
                  }>
                }
                rightActions={rightActions}
                mobileBackButton={mobileBackButton}
                mobileActions={mobileActions}
                avatar={headerAvatar}
              />

              <Grid container spacing={{ xs: 2, md: 3 }}>
                {/* Left Column - Main Details */}
                <Grid size={{ xs: 12, md: 8 }}>
                  <Stack spacing={{ xs: 2, md: 3 }}>
                    {/* Status Overview Card */}
                    <Paper
                      sx={{
                        p: { xs: 2, md: 3 },
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${alpha(
                          visitor.verified
                            ? theme.palette.success.main
                            : theme.palette.warning.main,
                          0.05,
                        )} 0%, ${alpha(
                          visitor.verified
                            ? theme.palette.success.main
                            : theme.palette.warning.main,
                          0.02,
                        )} 100%)`,
                        border: `1px solid ${alpha(
                          visitor.verified
                            ? theme.palette.success.main
                            : theme.palette.warning.main,
                          0.2,
                        )}`,
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
                                bgcolor: alpha(
                                  visitor.verified
                                    ? theme.palette.success.main
                                    : theme.palette.warning.main,
                                  0.1,
                                ),
                                color: visitor.verified ? 'success.main' : 'warning.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {visitor.verified ? <CheckCircleIcon /> : <WarningAmberIcon />}
                            </Box>
                            <Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block' }}
                              >
                                {t('admin.visitorProfile.currentStatus', {
                                  lng: language,
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
                                {visitor.verified
                                  ? t('admin.visitorProfile.verified', {
                                      lng: language,
                                      defaultValue: 'Verified',
                                    })
                                  : t('admin.visitorProfile.unverified', {
                                      lng: language,
                                      defaultValue: 'Unverified',
                                    })}
                              </Typography>
                            </Box>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Paper>

                    {/* Visitor Information */}
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
                              {t('admin.visitorProfile.sections.basicInfo', {
                                lng: language,
                                defaultValue: 'Basic Information',
                              })}
                            </Typography>
                          </Stack>
                        </Stack>
                        <Stack spacing={2}>
                          <InfoField
                            icon={<PersonIcon fontSize="small" />}
                            label={t('admin.visitorProfile.fields.name', {
                              lng: language,
                              defaultValue: 'Name',
                            })}
                            value={visitor.name}
                            editable
                            field="name"
                          />
                          <InfoField
                            icon={<PhoneIcon fontSize="small" />}
                            label={t('admin.visitorProfile.fields.phone', {
                              lng: language,
                              defaultValue: 'Phone',
                            })}
                            value={visitor.phone}
                            editable
                            field="phone"
                            type="tel"
                          />
                          <InfoField
                            icon={<EmailIcon fontSize="small" />}
                            label={t('admin.visitorProfile.fields.email', {
                              lng: language,
                              defaultValue: 'Email',
                            })}
                            value={visitor.email}
                            editable
                            field="email"
                            type="email"
                          />
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Box
                              sx={{
                                color: 'text.secondary',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              <BadgeIcon fontSize="small" />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block' }}
                              >
                                {t('admin.visitorProfile.fields.visitorId', {
                                  lng: language,
                                  defaultValue: 'Visitor ID',
                                })}
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{ fontFamily: 'monospace' }}
                              >
                                {visitor.id}
                              </Typography>
                            </Box>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Paper>

                    {/* Notes */}
                    {(visitor.notes || isEditing) && (
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
                              <BadgeIcon fontSize="small" />
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
                              {t('admin.visitorProfile.sections.notes', {
                                lng: language,
                                defaultValue: 'Notes',
                              })}
                            </Typography>
                          </Stack>
                          <Stack spacing={2}>
                            <Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block', mb: 1 }}
                              >
                                {t('admin.visitorProfile.fields.notes', {
                                  lng: language,
                                  defaultValue: 'Notes',
                                })}
                              </Typography>
                              {isEditing ? (
                                <TextField
                                  multiline
                                  rows={3}
                                  value={editedVisitor.notes || ''}
                                  onChange={(e) =>
                                    setEditedVisitor((prev) => ({ ...prev, notes: e.target.value }))
                                  }
                                  fullWidth
                                />
                              ) : (
                                <Typography variant="body2">
                                  {visitor.notes ||
                                    t('common.none', { lng: language, defaultValue: 'None' })}
                                </Typography>
                              )}
                            </Box>
                          </Stack>
                        </Stack>
                      </Paper>
                    )}
                  </Stack>
                </Grid>

                {/* Right Column - Quick Info & Settings */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack spacing={{ xs: 2, md: 3 }}>
                    {/* Quick Info */}
                    <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
                      <Stack spacing={{ xs: 2, md: 2.5 }}>
                        <Stack direction="row" alignItems="center" spacing={{ xs: 1, md: 1.5 }}>
                          <Box
                            sx={{
                              p: { xs: 0.75, md: 1 },
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.info.main, 0.1),
                              color: 'info.main',
                            }}
                          >
                            <DirectionsCarIcon />
                          </Box>
                          <Typography variant="h6" fontWeight={600}>
                            {t('admin.visitorProfile.sections.quickInfo', {
                              lng: language,
                              defaultValue: 'Quick Info',
                            })}
                          </Typography>
                        </Stack>
                        <Divider />
                        <Stack spacing={1.5}>
                          {visitor.preferredVehicle ? (
                            <Stack direction="row" alignItems="center" spacing={{ xs: 1, md: 1.5 }}>
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
                                <DirectionsCarIcon fontSize="small" />
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  {t('admin.visitorProfile.fields.preferredVehicle', {
                                    lng: language,
                                    defaultValue: 'Preferred Vehicle',
                                  })}
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                  {visitor.preferredVehicle}
                                </Typography>
                              </Box>
                            </Stack>
                          ) : null}
                        </Stack>
                      </Stack>
                    </Paper>

                    {/* Settings */}
                    <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
                      <Stack spacing={{ xs: 2, md: 2.5 }}>
                        <Stack direction="row" alignItems="center" spacing={{ xs: 1, md: 1.5 }}>
                          <Box
                            sx={{
                              p: { xs: 0.75, md: 1 },
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.success.main, 0.1),
                              color: 'success.main',
                            }}
                          >
                            <BadgeIcon />
                          </Box>
                          <Typography variant="h6" fontWeight={600}>
                            {t('admin.visitorProfile.sections.settings', {
                              lng: language,
                              defaultValue: 'Settings',
                            })}
                          </Typography>
                        </Stack>
                        <Divider />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={isEditing ? editedVisitor.verified : visitor.verified}
                              onChange={
                                isEditing
                                  ? (e) =>
                                      setEditedVisitor((prev) => ({
                                        ...prev,
                                        verified: e.target.checked,
                                      }))
                                  : () => {}
                              }
                              disabled={!isEditing}
                            />
                          }
                          label={t('admin.visitorProfile.fields.verified', {
                            lng: language,
                            defaultValue: 'Verified Profile',
                          })}
                        />
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
