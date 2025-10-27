import {
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
  Chip,
  Divider,
  Box,
  Avatar,
  Paper,
  Tooltip,
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import QRCode from 'qrcode'
import CloseIcon from '@mui/icons-material/Close'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt'
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled'
import HomeIcon from '@mui/icons-material/Home'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import DownloadIcon from '@mui/icons-material/Download'
import EmailIcon from '@mui/icons-material/Email'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import DomainIcon from '@mui/icons-material/Domain'
import PersonIcon from '@mui/icons-material/Person'
import ShieldIcon from '@mui/icons-material/Shield'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import SettingsIcon from '@mui/icons-material/Settings'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { useMediaQuery, useTheme } from '@mui/material'
import { type ReactNode, useEffect, useState } from 'react'
import { useTranslate } from '@i18n/useTranslate'
import { useI18nStore } from '@store/i18n.store'
import { useThemeStore } from '@store/theme.store'
import { useAuthStore } from '@app/auth/auth.store'
import { generateVisitBadgePdf } from '../utils/visitBadgePdf'

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

type VisitDetailsModalProps = {
  open: boolean
  onClose: () => void
  visit: VisitRecord | null
  statusLabels: Record<VisitStatus, string>
  statusColors: Record<VisitStatus, 'success' | 'warning' | 'error'>
  statusIcons: Record<VisitStatus, typeof CheckCircleOutlineIcon>
  typeLabels: Record<VisitType, string>
  downloadBadgeLabel: string
  resendEmailLabel: string
  cancelVisitLabel: string
  onDownloadBadge?: () => void
  onResendEmail?: () => void
  onCancelVisit?: () => void
}

export function VisitDetailsModal({
  open,
  onClose,
  visit,
  statusLabels,
  statusColors,
  statusIcons,
  typeLabels,
  resendEmailLabel,
  cancelVisitLabel,
  onResendEmail,
  onCancelVisit,
}: VisitDetailsModalProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const { t } = useTranslate()
  const language = useI18nStore((state) => state.language)
  const themeMode = useThemeStore((state) => state.currentPreset()?.palette.mode || 'light')
  const currentUser = useAuthStore((state) => state.user)

  useEffect(() => {
    if (visit?.badgeCode) {
      // Generate QR code with badge code only
      QRCode.toDataURL(visit.badgeCode, { errorCorrectionLevel: 'H' })
        .then((url) => {
          setQrCodeDataUrl(url)
        })
        .catch((err) => {
          console.error('Failed to generate QR code:', err)
        })
    }
  }, [visit?.badgeCode])

  const handleDownloadQR = () => {
    if (!qrCodeDataUrl || !visit) return

    generateVisitBadgePdf({
      visit,
      qrCodeDataUrl,
      typeLabels,
      language,
      themeMode,
      currentUser,
      t,
    })
  }

  if (!visit) return null

  const StatusIcon = statusIcons[visit.status]
  const statusLabel = statusLabels[visit.status]
  const statusColor = statusColors[visit.status]

  const InfoRow = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
    <Stack direction="row" spacing={2} alignItems="center">
      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 40 }}>{icon}</Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          {value}
        </Typography>
      </Box>
    </Stack>
  )

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          sx: {
            height: isMobile ? '100vh' : 'auto',
            maxHeight: isMobile ? '100vh' : '90vh',
          },
        },
      }}
    >
      <DialogContent sx={{ p: 0, position: 'relative' }}>
        {/* Mobile Header with back button */}
        {isMobile && (
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 1,
              bgcolor: 'background.paper',
              borderBottom: '1px solid',
              borderColor: 'divider',
              px: 2,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <IconButton onClick={onClose} size="small">
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
              {t('visitDetails.modal.title', { lng: language, defaultValue: 'Visit Details' })}
            </Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        )}

        {/* Desktop Header */}
        {!isMobile && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
            }}
          >
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        )}

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={3}>
            {/* Header Section */}
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Avatar
                  sx={{
                    width: { xs: 48, sm: 64 },
                    height: { xs: 48, sm: 64 },
                    bgcolor: 'primary.main',
                  }}
                >
                  {visit.visitorName
                    .split(' ')
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </Avatar>
                <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={600} noWrap>
                    {visit.visitorName}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={1}>
                    <Chip
                      size="small"
                      icon={<StatusIcon fontSize="small" />}
                      label={statusLabel}
                      color={statusColor}
                      variant={visit.status === 'pending' ? 'outlined' : 'filled'}
                    />
                    <Chip size="small" label={typeLabels[visit.type]} variant="outlined" />
                  </Stack>
                </Stack>
              </Stack>
            </Stack>

            <Divider />

            {/* Content Grid - Responsive layout */}
            <Grid container spacing={2} alignItems="stretch">
              {/* Row 1: Visit Details - full width on sm, 6/12 on md+ */}
              <Grid size={{ xs: 12, sm: 12, md: 6 }} sx={{ display: 'flex' }}>
                <Paper sx={{ p: 2.5, width: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    {t('visitDetails.modal.visitDetails', {
                      lng: language,
                      defaultValue: 'Visit Details',
                    })}
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack spacing={2}>
                        <InfoRow
                          icon={<DomainIcon fontSize="small" />}
                          label={t('visitDetails.modal.field.site', {
                            lng: language,
                            defaultValue: 'Site',
                          })}
                          value={visit.siteName}
                        />
                        <InfoRow
                          icon={<CalendarTodayIcon fontSize="small" />}
                          label={t('visitDetails.modal.field.scheduledFor', {
                            lng: language,
                            defaultValue: 'Scheduled For',
                          })}
                          value={new Date(visit.scheduledFor).toLocaleString()}
                        />
                        {visit.requestedByRole && visit.requestedByName && (
                          <InfoRow
                            icon={
                              visit.requestedByRole === 'resident' ? (
                                <PersonIcon fontSize="small" />
                              ) : visit.requestedByRole === 'guard' ? (
                                <ShieldIcon fontSize="small" />
                              ) : visit.requestedByRole === 'admin' ? (
                                <AdminPanelSettingsIcon fontSize="small" />
                              ) : (
                                <SettingsIcon fontSize="small" />
                              )
                            }
                            label={t('visitDetails.modal.field.requestedBy', {
                              lng: language,
                              defaultValue: 'Requested By',
                            })}
                            value={`${visit.requestedByName || visit.requestedByEmail}${visit.requestedByRole ? ` (${visit.requestedByRole})` : ''}`}
                          />
                        )}
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack spacing={2}>
                        {visit.requestedAt && (
                          <InfoRow
                            icon={<AccessTimeIcon fontSize="small" />}
                            label={t('visitDetails.modal.field.requestedAt', {
                              lng: language,
                              defaultValue: 'Requested At',
                            })}
                            value={new Date(visit.requestedAt).toLocaleString()}
                          />
                        )}
                        {visit.expiresAt && (
                          <InfoRow
                            icon={<CalendarTodayIcon fontSize="small" />}
                            label={t('visitDetails.modal.field.expiresAt', {
                              lng: language,
                              defaultValue: 'Expires At',
                            })}
                            value={new Date(visit.expiresAt).toLocaleString()}
                          />
                        )}
                        {visit.approvedByName && (
                          <InfoRow
                            icon={<CheckCircleOutlineIcon fontSize="small" />}
                            label={t('visitDetails.modal.field.approvedBy', {
                              lng: language,
                              defaultValue: 'Approved By',
                            })}
                            value={`${visit.approvedByName || visit.approvedByEmail}${visit.approvedByRole ? ` (${visit.approvedByRole.charAt(0).toUpperCase() + visit.approvedByRole.slice(1)})` : ''}`}
                          />
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Row 1: Visitor Information - full width on sm, 6/12 on md+ */}
              <Grid size={{ xs: 12, sm: 12, md: 6 }} sx={{ display: 'flex' }}>
                <Paper sx={{ p: 2.5, width: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    {t('visitDetails.modal.visitorInformation', {
                      lng: language,
                      defaultValue: 'Visitor Information',
                    })}
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    {/* Email - Full width on desktop */}
                    {visit.visitorEmail && (
                      <InfoRow
                        icon={<EmailIcon fontSize="small" />}
                        label={t('visitDetails.modal.field.email', {
                          lng: language,
                          defaultValue: 'Email',
                        })}
                        value={visit.visitorEmail}
                      />
                    )}

                    {/* Two-column layout for Name and Vehicle Plate */}
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoRow
                          icon={<PersonAddAltIcon fontSize="small" />}
                          label={t('visitDetails.modal.field.name', {
                            lng: language,
                            defaultValue: 'Name',
                          })}
                          value={visit.visitorName}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        {visit.vehiclePlate && (
                          <InfoRow
                            icon={<DirectionsCarFilledIcon fontSize="small" />}
                            label={t('visitDetails.modal.field.vehiclePlate', {
                              lng: language,
                              defaultValue: 'Vehicle Plate',
                            })}
                            value={visit.vehiclePlate}
                          />
                        )}
                      </Grid>
                    </Grid>

                    {/* Two-column layout for other fields */}
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Stack spacing={2}>
                          {visit.requestedByRole && visit.requestedByName && (
                            <InfoRow
                              icon={
                                visit.requestedByRole === 'resident' ? (
                                  <PersonIcon fontSize="small" />
                                ) : visit.requestedByRole === 'guard' ? (
                                  <ShieldIcon fontSize="small" />
                                ) : visit.requestedByRole === 'admin' ? (
                                  <AdminPanelSettingsIcon fontSize="small" />
                                ) : (
                                  <SettingsIcon fontSize="small" />
                                )
                              }
                              label={t('visitDetails.modal.field.requestedBy', {
                                lng: language,
                                defaultValue: 'Requested By',
                              })}
                              value={`${visit.requestedByName || visit.requestedByEmail}${visit.requestedByRole ? ` (${visit.requestedByRole.charAt(0).toUpperCase() + visit.requestedByRole.slice(1)})` : ''}`}
                            />
                          )}
                          {visit.approvedByName && (
                            <InfoRow
                              icon={<CheckCircleOutlineIcon fontSize="small" />}
                              label={t('visitDetails.modal.field.approvedBy', {
                                lng: language,
                                defaultValue: 'Approved By',
                              })}
                              value={`${visit.approvedByName || visit.approvedByEmail}${visit.approvedByRole ? ` (${visit.approvedByRole.charAt(0).toUpperCase() + visit.approvedByRole.slice(1)})` : ''}`}
                            />
                          )}
                        </Stack>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        {visit.lastVisitAt && (
                          <InfoRow
                            icon={<CalendarTodayIcon fontSize="small" />}
                            label={t('visitDetails.modal.field.lastVisit', {
                              lng: language,
                              defaultValue: 'Last Visit',
                            })}
                            value={new Date(visit.lastVisitAt).toLocaleDateString()}
                          />
                        )}
                      </Grid>
                    </Grid>
                  </Stack>
                </Paper>
              </Grid>

              {/* Row 2: Host Information - full width on sm, 6/12 on md+ */}
              <Grid size={{ xs: 12, sm: 12, md: 6 }} sx={{ display: 'flex' }}>
                <Paper sx={{ p: 2.5, width: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    {t('visitDetails.modal.hostInformation', {
                      lng: language,
                      defaultValue: 'Host Information',
                    })}
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    <InfoRow
                      icon={<HomeIcon fontSize="small" />}
                      label={t('visitDetails.modal.field.hostName', {
                        lng: language,
                        defaultValue: 'Host Name',
                      })}
                      value={visit.hostName}
                    />
                    <InfoRow
                      icon={<HomeIcon fontSize="small" />}
                      label={t('visitDetails.modal.field.unit', {
                        lng: language,
                        defaultValue: 'Unit',
                      })}
                      value={visit.hostUnit}
                    />
                  </Stack>
                </Paper>
              </Grid>

              {/* Row 2: QR Code - full width on sm, 6/12 on md+ */}
              <Grid size={{ xs: 12, sm: 12, md: 6 }} sx={{ display: 'flex' }}>
                <Paper sx={{ p: 2.5, width: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    {t('visitDetails.modal.badgeQrCode', {
                      lng: language,
                      defaultValue: 'Badge QR Code',
                    })}
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 2, alignItems: 'center' }}>
                    {qrCodeDataUrl && (
                      <Box
                        component="img"
                        src={qrCodeDataUrl}
                        alt="QR Code"
                        sx={{
                          width: { xs: 200, sm: 150 },
                          height: { xs: 200, sm: 150 },
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                        }}
                      />
                    )}
                    <Typography variant="caption" color="text.secondary" align="center">
                      {t('visitDetails.modal.qrInstructions', {
                        lng: language,
                        defaultValue: isMobile
                          ? 'Scan this QR code to validate the badge'
                          : 'Scan to validate',
                      })}
                    </Typography>
                    {qrCodeDataUrl && (
                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ width: '100%', p: 1.5 }}
                      >
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {t('visitDetails.modal.badgeCode', {
                              lng: language,
                              defaultValue: 'Badge Code',
                            })}
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {visit.badgeCode}
                          </Typography>
                        </Box>
                        <Tooltip
                          title={t('visitDetails.modal.downloadTooltip', {
                            lng: language,
                            defaultValue: 'Download Badge PDF',
                          })}
                          arrow
                        >
                          <IconButton
                            size="small"
                            onClick={handleDownloadQR}
                            sx={{
                              bgcolor: 'background.paper',
                              '&:hover': { bgcolor: 'action.hover' },
                            }}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    )}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>

            {/* Actions - Mobile */}
            {isMobile && (
              <Stack spacing={1}>
                <Tooltip title={resendEmailLabel} arrow>
                  <Paper
                    component="button"
                    onClick={onResendEmail}
                    sx={{
                      p: 2,
                      border: 'none',
                      bgcolor: 'background.paper',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <EmailIcon />
                    <Typography>{resendEmailLabel}</Typography>
                  </Paper>
                </Tooltip>
                <Tooltip title={cancelVisitLabel} arrow>
                  <Paper
                    component="button"
                    onClick={onCancelVisit}
                    sx={{
                      p: 2,
                      border: 'none',
                      bgcolor: 'error.light',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'error.main' },
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <ErrorOutlineIcon />
                    <Typography>{cancelVisitLabel}</Typography>
                  </Paper>
                </Tooltip>
              </Stack>
            )}
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
