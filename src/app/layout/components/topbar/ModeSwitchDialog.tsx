import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Radio,
  RadioGroup,
  TextField,
  FormControlLabel,
  Box,
  Autocomplete,
  Typography,
  Chip,
  InputAdornment,
  CircularProgress,
  Avatar,
  Badge,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import DomainIcon from '@mui/icons-material/Domain'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import VerifiedIcon from '@mui/icons-material/Verified'
import { useState, useMemo } from 'react'
import { useTranslate } from '../../../../i18n/useTranslate'
import type { SiteMode } from '@store/site.store'
import type { Site } from '@store/site.store'

interface ModeSwitchDialogProps {
  open: boolean
  onClose: () => void
  selectedMode: SiteMode
  onModeChange: (mode: SiteMode) => void
  selectedSiteSlug: string
  onSiteChange: (slug: string) => void
  onConfirm: () => void
  canSelectSite: boolean
  disableConfirm: boolean
  sites: Site[]
}

export function ModeSwitchDialog({
  open,
  onClose,
  selectedMode,
  onModeChange,
  selectedSiteSlug,
  onSiteChange,
  onConfirm,
  canSelectSite,
  disableConfirm,
  sites,
}: ModeSwitchDialogProps) {
  const { t } = useTranslate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const showSiteSelect = selectedMode === 'site'

  // Mock admin data for each site - in real app this would come from API
  const siteAdminData = useMemo(() => {
    const adminNames = [
      'Sarah Johnson',
      'Mike Chen',
      'Elena Rodriguez',
      'David Park',
      'Anna Williams',
    ]
    const statusOptions = ['active', 'verified', 'premium']

    return sites.reduce(
      (acc, site, index) => {
        acc[site.slug] = {
          adminName: adminNames[index % adminNames.length],
          adminInitials: adminNames[index % adminNames.length]
            .split(' ')
            .map((n) => n[0])
            .join(''),
          status: statusOptions[index % statusOptions.length],
          userCount: Math.floor(Math.random() * 500) + 50,
          isOnline: Math.random() > 0.3, // 70% chance of being online
        }
        return acc
      },
      {} as Record<
        string,
        {
          adminName: string
          adminInitials: string
          status: string
          userCount: number
          isOnline: boolean
        }
      >,
    )
  }, [sites])

  // Find the currently selected site object
  const selectedSite = useMemo(() => {
    return sites.find((site) => site.slug === selectedSiteSlug) || null
  }, [sites, selectedSiteSlug])

  // Get admin data for selected site
  const selectedSiteAdmin = selectedSite ? siteAdminData[selectedSite.slug] : null

  // Handle site selection from autocomplete
  const handleSiteChange = (_event: React.SyntheticEvent, newValue: Site | null) => {
    if (newValue) {
      onSiteChange(newValue.slug)
    } else {
      onSiteChange('')
    }
  }

  // Simulate search loading for better UX
  const handleSearchOpen = () => {
    setSearchOpen(true)
    if (sites.length > 0) {
      setSearchLoading(true)
      setTimeout(() => setSearchLoading(false), 300)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DomainIcon fontSize="small" />
          {t('topnav.modeDialog.title')}
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <RadioGroup
          value={selectedMode}
          onChange={(event) => onModeChange(event.target.value as SiteMode)}
        >
          <FormControlLabel
            value="enterprise"
            control={<Radio />}
            label={
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  {t('topnav.modeDialog.enterpriseOption')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('topnav.modeDialog.enterpriseDescription', {
                    defaultValue: 'Portfolio-wide insights and management',
                  })}
                </Typography>
              </Box>
            }
          />
          <FormControlLabel
            value="site"
            control={<Radio />}
            disabled={!canSelectSite}
            label={
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  {t('topnav.modeDialog.siteOption')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('topnav.modeDialog.siteDescription', {
                    defaultValue: "Focus on a specific site's operations",
                  })}
                </Typography>
              </Box>
            }
          />
        </RadioGroup>

        {showSiteSelect && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              {t('topnav.modeDialog.chooseSite', { defaultValue: 'Choose Site' })}
            </Typography>

            {!canSelectSite ? (
              <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 1, textAlign: 'center' }}>
                <Typography variant="body2" color="warning.dark">
                  {t('topnav.modeDialog.noSites')}
                </Typography>
              </Box>
            ) : (
              <Autocomplete
                options={sites}
                value={selectedSite}
                onChange={handleSiteChange}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.slug === value.slug}
                open={searchOpen}
                onOpen={handleSearchOpen}
                onClose={() => setSearchOpen(false)}
                loading={searchLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('topnav.modeDialog.searchSites', { defaultValue: 'Search sites...' })}
                    placeholder={t('topnav.modeDialog.searchPlaceholder', {
                      defaultValue: 'Type to search sites',
                    })}
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <>
                          {searchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => {
                  const adminData = siteAdminData[option.slug]
                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case 'verified':
                        return 'success'
                      case 'premium':
                        return 'warning'
                      default:
                        return 'default'
                    }
                  }
                  const getStatusLabel = (status: string) => {
                    switch (status) {
                      case 'verified':
                        return t('topnav.modeDialog.verified', { defaultValue: 'Verified' })
                      case 'premium':
                        return t('topnav.modeDialog.premium', { defaultValue: 'Premium' })
                      default:
                        return t('topnav.modeDialog.active', { defaultValue: 'Active' })
                    }
                  }

                  return (
                    <li {...props} key={option.slug}>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', width: '100%', py: 1, px: 1 }}
                      >
                        <Box sx={{ position: 'relative', mr: 2 }}>
                          <Badge
                            variant="dot"
                            color={adminData?.isOnline ? 'success' : 'default'}
                            anchorOrigin={{
                              vertical: 'bottom',
                              horizontal: 'right',
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: 'primary.main',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                              }}
                            >
                              {adminData?.adminInitials}
                            </Avatar>
                          </Badge>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="body2" fontWeight={500} noWrap>
                              {option.name}
                            </Typography>
                            <Chip
                              size="small"
                              label={getStatusLabel(adminData?.status || 'active')}
                              color={
                                getStatusColor(adminData?.status || 'active') as
                                  | 'default'
                                  | 'success'
                                  | 'warning'
                              }
                              icon={
                                adminData?.status === 'verified' ? (
                                  <VerifiedIcon fontSize="small" />
                                ) : undefined
                              }
                              sx={{ height: 18, fontSize: '0.625rem' }}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AdminPanelSettingsIcon
                                fontSize="small"
                                sx={{ color: 'text.secondary', fontSize: '0.875rem' }}
                              />
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {adminData?.adminName}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              • {adminData?.userCount} users
                            </Typography>
                          </Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: '0.65rem' }}
                          >
                            {option.slug}
                          </Typography>
                        </Box>
                        {option.slug === selectedSiteSlug && (
                          <Chip
                            size="small"
                            label={t('topnav.modeDialog.selected', { defaultValue: 'Selected' })}
                            color="primary"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    </li>
                  )
                }}
                filterOptions={(options, { inputValue }) => {
                  const filtered = options.filter(
                    (option) =>
                      option.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                      option.slug.toLowerCase().includes(inputValue.toLowerCase()),
                  )
                  return filtered
                }}
                noOptionsText={
                  <Box sx={{ py: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('topnav.modeDialog.noResults', { defaultValue: 'No sites found' })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('topnav.modeDialog.tryDifferentSearch', {
                        defaultValue: 'Try a different search term',
                      })}
                    </Typography>
                  </Box>
                }
                sx={{
                  '& .MuiAutocomplete-listbox': {
                    maxHeight: 300,
                  },
                }}
              />
            )}

            {selectedSite && selectedSiteAdmin && (
              <Box
                sx={{
                  mt: 2,
                  p: 3,
                  bgcolor: 'primary.light',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'primary.main',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <DomainIcon fontSize="small" />
                  <Typography variant="subtitle2" fontWeight={600}>
                    {t('topnav.modeDialog.selectedSite', { defaultValue: 'Selected Site' })}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Badge
                      variant="dot"
                      color={selectedSiteAdmin.isOnline ? 'success' : 'default'}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: 'primary.main',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                        }}
                      >
                        {selectedSiteAdmin.adminInitials}
                      </Avatar>
                    </Badge>
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="body1" fontWeight={600} noWrap>
                        {selectedSite.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={
                          selectedSiteAdmin.status === 'verified'
                            ? t('topnav.modeDialog.verified', { defaultValue: 'Verified' })
                            : selectedSiteAdmin.status === 'premium'
                              ? t('topnav.modeDialog.premium', { defaultValue: 'Premium' })
                              : t('topnav.modeDialog.active', { defaultValue: 'Active' })
                        }
                        color={
                          selectedSiteAdmin.status === 'verified'
                            ? 'success'
                            : selectedSiteAdmin.status === 'premium'
                              ? 'warning'
                              : 'default'
                        }
                        icon={
                          selectedSiteAdmin.status === 'verified' ? (
                            <VerifiedIcon fontSize="small" />
                          ) : undefined
                        }
                        sx={{ height: 20 }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <AdminPanelSettingsIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight={500}>
                        {selectedSiteAdmin.adminName}
                      </Typography>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: selectedSiteAdmin.isOnline ? 'success.main' : 'text.disabled',
                          ml: 0.5,
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {selectedSiteAdmin.isOnline
                          ? t('topnav.modeDialog.online', { defaultValue: 'Online' })
                          : t('topnav.modeDialog.offline', { defaultValue: 'Offline' })}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        {selectedSiteAdmin.userCount}{' '}
                        {t('topnav.modeDialog.users', { defaultValue: 'users' })}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedSite.slug}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button variant="contained" onClick={onConfirm} disabled={disableConfirm}>
          {t('common.apply')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
