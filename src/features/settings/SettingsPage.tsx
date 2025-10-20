import React, { useEffect, useMemo, useState, startTransition } from 'react'
import { alpha } from '@mui/material/styles'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  MenuItem,
  Box,
  List,
  ListItemIcon,
  ListItemButton,
  ListItemText,
  InputAdornment,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import PersonIcon from '@mui/icons-material/Person'
import LanguageIcon from '@mui/icons-material/Language'
import NotificationsIcon from '@mui/icons-material/Notifications'
import SecurityIcon from '@mui/icons-material/Security'
import PaletteIcon from '@mui/icons-material/Palette'
import LinkIcon from '@mui/icons-material/Link'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { useUserSettings } from '@app/hooks/useUserSettings'
import { useAuthStore } from '@app/auth/auth.store'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '@store/theme.store'
import type { ThemeKind } from '@app/theme.types'
import { useUIStore } from '@store/ui.store'
import { useTranslate } from '../../i18n/useTranslate'
import PatternSelector from './PatternSelector'

type UserSettingsShape = {
  locale?: string
  timezone?: string
  receiveEmails?: boolean
  receiveSms?: boolean
  twoFactorEnabled?: boolean
  themePreference?: 'light' | 'dark' | 'system' | 'brand'
  density?: 'comfortable' | 'compact'
  displayName?: string
  webhookUrl?: string
}

const CATEGORIES = [
  'Account',
  'Preferences',
  'Notifications',
  'Security',
  'Appearance',
  'Integrations',
]

const SETTING_META: Record<string, { short?: string; description?: string; optional?: boolean }> = {
  'Display name': {
    short: 'Your public name',
    description:
      'This is the display name other users will see. Keep it concise; you can use your full name or a nickname. It helps identify you in the app and on generated messages.',
  },
  Email: {
    short: 'Your account email',
    description:
      'Primary email used for account communication, password resets, and notifications. You may not be able to change this frequently for security reasons.',
  },
  Locale: {
    short: 'Language',
    description: 'Select the language used for UI strings, dates and localized content.',
  },
  Timezone: {
    short: 'Time zone',
    description:
      'Choose the timezone used to display timestamps. This affects how dates and times are shown across the app.',
  },
  'Email notifications': {
    short: 'Email alerts',
    description:
      'Toggle whether you receive important event notifications by email. Critical system messages will still be delivered.',
  },
  'SMS notifications': {
    short: 'SMS alerts',
    description:
      'Receive short-text alerts on your phone. Use this for urgent, time-sensitive notifications. Carrier fees may apply.',
    optional: true,
  },
  'Two-factor authentication': {
    short: '2FA',
    description:
      'Adds an extra step when signing in (time-based codes or SMS). Strongly recommended to protect your account from unauthorized access.',
  },
  Theme: {
    short: 'Color theme',
    description: 'Switch between light, dark, or follow system preference for the app appearance.',
  },
  Density: {
    short: 'UI density',
    description:
      'Controls spacing and compactness of list items and controls. Choose compact to see more content at once.',
  },
  'Webhook URL': {
    short: 'Outgoing webhook',
    description:
      'When set, the app will POST events to this URL to integrate with external systems. Keep this URL private and secure.',
    optional: true,
  },
}

const CATEGORY_ICONS: Record<string, JSX.Element> = {
  Account: <PersonIcon fontSize="small" />,
  Preferences: <LanguageIcon fontSize="small" />,
  Notifications: <NotificationsIcon fontSize="small" />,
  Security: <SecurityIcon fontSize="small" />,
  Appearance: <PaletteIcon fontSize="small" />,
  Integrations: <LinkIcon fontSize="small" />,
}

const CATEGORY_META: Record<string, { description: string }> = {
  Account: { description: 'Manage your profile information and primary email.' },
  Preferences: { description: 'Set language, timezone and display preferences.' },
  Notifications: { description: 'Control how you receive alerts from the system.' },
  Security: { description: 'Manage sign-in methods and account protection.' },
  Appearance: { description: '' },
  Integrations: { description: 'Connect external systems and webhooks.' },
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  const meta = SETTING_META[label]
  return (
    <Box sx={{ mb: 2 }}>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'flex-start',
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Box sx={{ mt: 0 }}>{children}</Box>
        </Box>
        {meta?.description ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip
              title={
                <span style={{ whiteSpace: 'pre-line' }}>
                  {meta.description}
                  {meta.optional ? '\n\nOptional' : ''}
                </span>
              }
              placement="right"
            >
              <IconButton size="small" aria-label={`${label} info`}>
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : null}
      </Box>
    </Box>
  )
}

function CategoryGroup({
  title,
  description,
  children,
  noBorder,
}: {
  title: string
  description?: string
  children: React.ReactNode
  noBorder?: boolean
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 1,
        border: noBorder ? 'none' : '1px solid',
        borderColor: noBorder ? 'transparent' : 'divider',
        backgroundColor: 'transparent',
      }}
    >
      <Box sx={{ mb: 1 }}>
        <Typography variant="subtitle2">{title}</Typography>
        {description ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {description}
          </Typography>
        ) : null}
      </Box>
      <Box>{children}</Box>
    </Paper>
  )
}

export default function SettingsPage({
  openProp,
  onCloseProp,
}: {
  openProp?: boolean
  onCloseProp?: () => void
}) {
  const { load, save } = useUserSettings()
  const user = useAuthStore((s) => s.user)
  const [settings, setSettings] = useState<UserSettingsShape>({})
  const activeSaved = useUIStore((s) => s.activeSettingsCategory)
  const setActiveSaved = useUIStore((s) => s.setActiveSettingsCategory)
  const commitPatternDraft = useUIStore((s) => s.commitPatternDraft)
  const resetPatternDraft = useUIStore((s) => s.resetPatternDraft)
  const [active, setActive] = useState<string>(activeSaved ?? CATEGORIES[0])
  const [search, setSearch] = useState<string>('')
  const themeKind = useThemeStore((s) => s.kind)
  const setKind = useThemeStore((s) => s.setKind)
  const { t } = useTranslate()

  useEffect(() => {
    const s = load()
    if (s) setSettings(s)
  }, [load, user?.id])

  // keep local active in sync with the UI store so it survives unmounts
  useEffect(() => {
    if (activeSaved && activeSaved !== active) setActive(activeSaved)
  }, [activeSaved])

  const locales = useMemo(
    () => [
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Español' },
    ],
    [],
  )

  const searchInputRef = React.useRef<HTMLInputElement | null>(null)

  // mapping of fields per category for counting matches
  const categoryFields: Record<string, string[]> = {
    Account: ['Display name', 'Email'],
    Preferences: ['Locale', 'Timezone'],
    Notifications: ['Email notifications', 'SMS notifications'],
    Security: ['Two-factor authentication'],
    Appearance: ['Theme', 'Density'],
    Integrations: ['Webhook URL'],
  }

  const counts = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    const out: Record<string, number> = {}
    for (const c of CATEGORIES) {
      const fields = categoryFields[c] ?? []
      if (!q) out[c] = fields.length
      else out[c] = fields.filter((f) => f.toLowerCase().includes(q)).length
    }
    return out
  }, [search])

  function clearSearch() {
    setSearch('')
    // focus the input after clearing
    setTimeout(() => searchInputRef.current?.focus(), 0)
  }

  const navigate = useNavigate()
  const open = openProp ?? true
  const onClose = onCloseProp ?? (() => navigate(-1))
  const handleClose = () => {
    resetPatternDraft()
    onClose()
  }

  if (!user)
    return (
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>
          <Typography>Please sign in to view your settings.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    )

  function onSave() {
    commitPatternDraft()
    save(settings)
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: (theme) => ({
          borderRadius: 2,
          boxShadow: 'none', // remove elevation overlay so dark theme color stays consistent
          m: 2,
          // ensure dialog background uses the surface color so panels read consistently
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }),
      }}
    >
      <DialogTitle>Settings</DialogTitle>
      {/* remove default padding so we can control scroll regions inside the paper; keep outer content from scrolling */}
      <DialogContent
        dividers
        sx={{ p: 0, display: 'flex', overflow: 'hidden', maxHeight: 'calc(100vh - 160px)' }}
      >
        <Paper
          sx={(theme) => ({
            display: 'flex',
            minHeight: 480,
            height: '100%',
            width: '100%',
            boxShadow: 'none',
            backgroundColor: theme.palette.background.paper,
          })}
        >
          <Box
            sx={(theme) => ({
              width: 220,
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: theme.palette.background.paper,
              height: '100%',
            })}
          >
            {/* left panel header removed; dialog-level title used so the modal reads as a single panel */}
            <TextField
              inputRef={(el) => (searchInputRef.current = el)}
              placeholder="Search settings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              size="small"
              sx={{ mt: 1, mb: 1 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {search ? (
                      <IconButton size="small" onClick={clearSearch} aria-label="clear search">
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    ) : (
                      <IconButton size="small" aria-hidden>
                        <SearchIcon fontSize="small" />
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ overflowY: 'auto', flexGrow: 1, minHeight: 0 }}>
              <List>
                {CATEGORIES.map((c) => (
                  <ListItemButton
                    key={c}
                    selected={active === c}
                    onClick={() => {
                      setActive(c)
                      setActiveSaved(c)
                    }}
                    sx={(theme) => ({
                      borderRadius: 2,
                      mb: 0.5,
                      '&.Mui-selected': {
                        backgroundColor:
                          theme.palette.mode === 'dark'
                            ? alpha(
                                theme.palette.getContrastText(theme.palette.background.paper),
                                0.06,
                              )
                            : alpha(
                                theme.palette.getContrastText(theme.palette.background.paper),
                                0.04,
                              ),
                        color: theme.palette.text.primary,
                        borderRadius: 2,
                      },
                    })}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>{CATEGORY_ICONS[c]}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Box component="span">{c}</Box>
                          {search ? (
                            <Typography
                              variant="caption"
                              color={counts[c] === 0 ? 'text.disabled' : 'text.secondary'}
                            >
                              {counts[c] ?? 0}
                            </Typography>
                          ) : null}
                        </Box>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            </Box>
          </Box>
          <Box
            sx={{
              flex: 1,
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              minHeight: 0,
            }}
          >
            {/* fixed header/title area */}
            <Box sx={{ mb: 1 }}>
              <Typography variant="h6" gutterBottom>
                {active}
              </Typography>
              {CATEGORY_META[active]?.description ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {CATEGORY_META[active].description}
                </Typography>
              ) : null}
            </Box>

            {/* scrollable content area - only this will scroll when content is long */}
            <Box sx={{ overflowY: 'auto', flex: 1, pr: 1 }}>
              {/* If there's a search term, filter fields across categories */}
              {search ? (
                <Box>
                  {[
                    'Display name',
                    'Email',
                    'Locale',
                    'Timezone',
                    'Email notifications',
                    'SMS notifications',
                    'Two-factor authentication',
                    'Theme',
                    'Density',
                    'Webhook URL',
                  ]
                    .filter((label) => label.toLowerCase().includes(search.toLowerCase()))
                    .map((label) => (
                      <SettingRow key={label} label={label}>
                        {/* Render a simple representation of the control to allow editing where practical */}
                        {label === 'Display name' && (
                          <TextField
                            value={settings.displayName ?? ''}
                            onChange={(e) =>
                              setSettings((p) => ({ ...p, displayName: e.target.value }))
                            }
                            fullWidth
                            helperText={SETTING_META['Display name']?.short}
                          />
                        )}
                        {label === 'Email' && (
                          <TextField value={user?.email ?? ''} disabled fullWidth />
                        )}
                        {label === 'Locale' && (
                          <TextField
                            select
                            value={settings.locale ?? 'en'}
                            onChange={(e) => setSettings((p) => ({ ...p, locale: e.target.value }))}
                            fullWidth
                            helperText={SETTING_META['Locale']?.short}
                          >
                            {locales.map((l) => (
                              <MenuItem value={l.value} key={l.value}>
                                {l.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                        {label === 'Timezone' && (
                          <TextField
                            value={settings.timezone ?? 'UTC'}
                            onChange={(e) =>
                              setSettings((p) => ({ ...p, timezone: e.target.value }))
                            }
                            fullWidth
                            helperText={SETTING_META['Timezone']?.short}
                          />
                        )}
                        {label === 'Email notifications' && (
                          <div>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={!!settings.receiveEmails}
                                  onChange={(e) =>
                                    setSettings((p) => ({ ...p, receiveEmails: e.target.checked }))
                                  }
                                />
                              }
                              label=""
                            />
                            {SETTING_META['Email notifications']?.short ? (
                              <Typography variant="caption" color="text.secondary">
                                {SETTING_META['Email notifications']?.short}
                              </Typography>
                            ) : null}
                          </div>
                        )}
                        {label === 'SMS notifications' && (
                          <div>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={!!settings.receiveSms}
                                  onChange={(e) =>
                                    setSettings((p) => ({ ...p, receiveSms: e.target.checked }))
                                  }
                                />
                              }
                              label=""
                            />
                            {SETTING_META['SMS notifications']?.short ? (
                              <Typography variant="caption" color="text.secondary">
                                {SETTING_META['SMS notifications']?.short}
                              </Typography>
                            ) : null}
                          </div>
                        )}
                        {label === 'Two-factor authentication' && (
                          <div>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={!!settings.twoFactorEnabled}
                                  onChange={(e) =>
                                    setSettings((p) => ({
                                      ...p,
                                      twoFactorEnabled: e.target.checked,
                                    }))
                                  }
                                />
                              }
                              label=""
                            />
                            {SETTING_META['Two-factor authentication']?.short ? (
                              <Typography variant="caption" color="text.secondary">
                                {SETTING_META['Two-factor authentication']?.short}
                              </Typography>
                            ) : null}
                          </div>
                        )}
                        {label === 'Theme' && (
                          <TextField
                            select
                            value={settings.themePreference ?? 'system'}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setSettings((p) => ({
                                ...p,
                                themePreference: e.target
                                  .value as UserSettingsShape['themePreference'],
                              }))
                            }
                            fullWidth
                            helperText={SETTING_META['Theme']?.short}
                          >
                            <MenuItem value="system">Follow system</MenuItem>
                            <MenuItem value="light">Light</MenuItem>
                            <MenuItem value="dark">Dark</MenuItem>
                            <MenuItem value="brand">Brand</MenuItem>
                          </TextField>
                        )}
                        {label === 'Density' && (
                          <TextField
                            select
                            value={settings.density ?? 'comfortable'}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setSettings((p) => ({
                                ...p,
                                density: e.target.value as UserSettingsShape['density'],
                              }))
                            }
                            fullWidth
                            helperText={SETTING_META['Density']?.short}
                          >
                            <MenuItem value="comfortable">Comfortable</MenuItem>
                            <MenuItem value="compact">Compact</MenuItem>
                          </TextField>
                        )}
                        {label === 'Webhook URL' && (
                          <TextField
                            value={settings.webhookUrl ?? ''}
                            onChange={(e) =>
                              setSettings((p) => ({ ...p, webhookUrl: e.target.value }))
                            }
                            fullWidth
                            helperText={SETTING_META['Webhook URL']?.short}
                          />
                        )}
                      </SettingRow>
                    ))}
                </Box>
              ) : null}

              {!search && (
                <>
                  {active === 'Account' && (
                    <CategoryGroup title="Account" description={CATEGORY_META.Account.description}>
                      <CategoryGroup
                        title="Profile"
                        description="Your public profile information."
                        noBorder
                      >
                        <SettingRow label="Display name">
                          <TextField
                            label="Display name"
                            value={settings.displayName ?? ''}
                            onChange={(e) =>
                              setSettings((p) => ({ ...p, displayName: e.target.value }))
                            }
                            sx={{ mb: 2 }}
                            fullWidth
                            helperText={SETTING_META['Display name']?.short}
                          />
                        </SettingRow>
                      </CategoryGroup>

                      <CategoryGroup
                        title="Contact"
                        description="Primary contact details for account communication."
                        noBorder
                      >
                        <SettingRow label="Email">
                          <TextField
                            label="Email"
                            value={user?.email ?? ''}
                            disabled
                            sx={{ mb: 2 }}
                            fullWidth
                          />
                        </SettingRow>
                      </CategoryGroup>
                    </CategoryGroup>
                  )}

                  {active === 'Preferences' && (
                    <CategoryGroup
                      title="Preferences"
                      description={CATEGORY_META.Preferences.description}
                    >
                      <CategoryGroup
                        title="Locale & Time"
                        description="Choose language and timezone settings."
                        noBorder
                      >
                        <SettingRow label="Locale">
                          <TextField
                            select
                            label="Locale"
                            value={settings.locale ?? 'en'}
                            onChange={(e) => setSettings((p) => ({ ...p, locale: e.target.value }))}
                            sx={{ minWidth: 240 }}
                          >
                            {locales.map((l) => (
                              <MenuItem value={l.value} key={l.value}>
                                {l.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </SettingRow>
                        <SettingRow label="Timezone">
                          <TextField
                            label="Timezone"
                            value={settings.timezone ?? 'UTC'}
                            onChange={(e) =>
                              setSettings((p) => ({ ...p, timezone: e.target.value }))
                            }
                            sx={{ minWidth: 240 }}
                          />
                        </SettingRow>
                      </CategoryGroup>
                    </CategoryGroup>
                  )}

                  {active === 'Notifications' && (
                    <CategoryGroup
                      title="Notifications"
                      description={CATEGORY_META.Notifications.description}
                    >
                      <CategoryGroup
                        title="Delivery methods"
                        description="Control how you receive alerts (email, SMS)"
                        noBorder
                      >
                        <SettingRow label="Email notifications">
                          <FormControlLabel
                            control={
                              <Switch
                                checked={!!settings.receiveEmails}
                                onChange={(e) =>
                                  setSettings((p) => ({ ...p, receiveEmails: e.target.checked }))
                                }
                              />
                            }
                            label="Email notifications"
                          />
                        </SettingRow>
                        <SettingRow label="SMS notifications">
                          <FormControlLabel
                            control={
                              <Switch
                                checked={!!settings.receiveSms}
                                onChange={(e) =>
                                  setSettings((p) => ({ ...p, receiveSms: e.target.checked }))
                                }
                              />
                            }
                            label="SMS notifications"
                          />
                        </SettingRow>
                      </CategoryGroup>
                    </CategoryGroup>
                  )}

                  {active === 'Security' && (
                    <CategoryGroup
                      title="Security"
                      description={CATEGORY_META.Security.description}
                    >
                      <CategoryGroup
                        title="Authentication"
                        description="Sign-in methods and extra protections."
                        noBorder
                      >
                        <SettingRow label="Two-factor authentication">
                          <FormControlLabel
                            control={
                              <Switch
                                checked={!!settings.twoFactorEnabled}
                                onChange={(e) =>
                                  setSettings((p) => ({ ...p, twoFactorEnabled: e.target.checked }))
                                }
                              />
                            }
                            label="Two-factor authentication"
                          />
                        </SettingRow>
                      </CategoryGroup>
                    </CategoryGroup>
                  )}

                  {active === 'Appearance' && (
                    <>
                      {/* General Appearance subgroup */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1">General appearance</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Theme, density and editor settings.
                        </Typography>
                        <SettingRow label="Use system settings">
                          <FormControlLabel
                            control={
                              <Switch
                                checked={
                                  settings.themePreference === 'system' || themeKind === 'system'
                                }
                                onChange={(e) => {
                                  const val = e.target.checked ? 'system' : 'light'
                                  setSettings((p) => ({ ...p, themePreference: val }))
                                  setKind(val as ThemeKind)
                                }}
                              />
                            }
                            label={
                              settings.themePreference === 'system' || themeKind === 'system'
                                ? 'Following system'
                                : 'Override'
                            }
                          />
                        </SettingRow>

                        {!(settings.themePreference === 'system' || themeKind === 'system') && (
                          <>
                            <SettingRow label="Theme">
                              <ToggleButtonGroup
                                exclusive
                                value={settings.themePreference ?? themeKind ?? 'light'}
                                onChange={(e: React.MouseEvent<HTMLElement>, v: string | null) => {
                                  if (!v) return
                                  setSettings((p) => ({
                                    ...p,
                                    themePreference: v as UserSettingsShape['themePreference'],
                                  }))
                                  setKind(v as ThemeKind)
                                }}
                                size="small"
                              >
                                <ToggleButton value="light">Light</ToggleButton>
                                <ToggleButton value="dark">Dark</ToggleButton>
                                <ToggleButton value="brand">Brand</ToggleButton>
                              </ToggleButtonGroup>
                            </SettingRow>

                            <SettingRow label="Theme editor">
                              <Button
                                variant="outlined"
                                onClick={() =>
                                  startTransition(() => {
                                    setActiveSaved(active)
                                    save(settings)
                                    navigate('/settings/theme')
                                  })
                                }
                              >
                                {t('settings.openThemeEditor')}
                              </Button>
                            </SettingRow>
                          </>
                        )}

                        <SettingRow label="Density">
                          <TextField
                            select
                            label="Density"
                            value={settings.density ?? 'comfortable'}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setSettings((p) => ({
                                ...p,
                                density: e.target.value as UserSettingsShape['density'],
                              }))
                            }
                            sx={{ minWidth: 240 }}
                          >
                            <MenuItem value="comfortable">Comfortable</MenuItem>
                            <MenuItem value="compact">Compact</MenuItem>
                          </TextField>
                        </SettingRow>
                      </Box>

                      {/* Topbar Appearance subgroup */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1">Topbar appearance</Typography>
                        <SettingRow label="Topbar pattern">
                          <PatternSelector embedded />
                        </SettingRow>
                      </Box>
                    </>
                  )}

                  {active === 'Integrations' && (
                    <CategoryGroup
                      title="Integrations"
                      description={CATEGORY_META.Integrations.description}
                    >
                      <CategoryGroup
                        title="Webhooks"
                        description="Outgoing webhooks and integration endpoints."
                        noBorder
                      >
                        <SettingRow label="Webhook URL">
                          <TextField
                            label="Webhook URL"
                            value={settings.webhookUrl ?? ''}
                            onChange={(e) =>
                              setSettings((p) => ({ ...p, webhookUrl: e.target.value }))
                            }
                            sx={{ mb: 2 }}
                            fullWidth
                            helperText={SETTING_META['Webhook URL']?.short}
                          />
                        </SettingRow>
                      </CategoryGroup>
                    </CategoryGroup>
                  )}
                </>
              )}
            </Box>

            {/* footer removed from inner panel; actions live on the dialog level */}
          </Box>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        <Button
          variant="contained"
          onClick={() => {
            onSave()
            handleClose()
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
