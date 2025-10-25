import React, { useEffect, useMemo, useState, startTransition, useCallback, useRef } from 'react'
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
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import PersonIcon from '@mui/icons-material/Person'
import LanguageIcon from '@mui/icons-material/Language'
import NotificationsIcon from '@mui/icons-material/Notifications'
import SecurityIcon from '@mui/icons-material/Security'
import PaletteIcon from '@mui/icons-material/Palette'
import LinkIcon from '@mui/icons-material/Link'
import { useUserSettings } from '@app/hooks/useUserSettings'
import { useAuthStore } from '@app/auth/auth.store'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '@store/theme.store'
import type { ThemeKind } from '@app/theme.types'
import { useUIStore } from '@store/ui.store'
import { useI18nStore } from '@store/i18n.store'
import type { SupportedLanguage } from '@i18n/i18n'
import { useTranslate } from '../../i18n/useTranslate'
import { LanguageMenu } from '../../app/layout/LanguageMenu'

type UserSettingsShape = {
  locale?: string
  timezone?: string
  receiveEmails?: boolean
  receiveSms?: boolean
  twoFactorEnabled?: boolean
  themePreference?: 'light' | 'dark' | 'system' | 'brand' | 'high-contrast'
  density?: 'comfortable' | 'compact' | 'standard'
  displayName?: string
  webhookUrl?: string
}

type CategoryId =
  | 'account'
  | 'preferences'
  | 'notifications'
  | 'security'
  | 'appearance'
  | 'integrations'

type GroupId =
  | 'profile'
  | 'contact'
  | 'regional'
  | 'accessibility'
  | 'delivery'
  | 'authentication'
  | 'appearanceGeneral'
  | 'webhooks'

type SettingFieldKey =
  | 'displayName'
  | 'email'
  | 'language'
  | 'timezone'
  | 'receiveEmails'
  | 'receiveSms'
  | 'twoFactor'
  | 'themeFollowSystem'
  | 'themePreference'
  | 'themeEditor'
  | 'density'
  | 'webhookUrl'

type SettingFieldMeta = {
  label: string
  description?: string
  helper?: string
  optional?: boolean
}

const CATEGORY_ORDER: CategoryId[] = [
  'account',
  'preferences',
  'notifications',
  'security',
  'appearance',
  'integrations',
]

const CATEGORY_ICON_MAP: Record<CategoryId, JSX.Element> = {
  account: <PersonIcon fontSize="small" />,
  preferences: <LanguageIcon fontSize="small" />,
  notifications: <NotificationsIcon fontSize="small" />,
  security: <SecurityIcon fontSize="small" />,
  appearance: <PaletteIcon fontSize="small" />,
  integrations: <LinkIcon fontSize="small" />,
}

const CATEGORY_LABEL_KEYS: Record<CategoryId, string> = {
  account: 'settings.categories.account',
  preferences: 'settings.categories.preferences',
  notifications: 'settings.categories.notifications',
  security: 'settings.categories.security',
  appearance: 'settings.categories.appearance',
  integrations: 'settings.categories.integrations',
}

const CATEGORY_DESCRIPTION_KEYS: Partial<Record<CategoryId, string>> = {
  account: 'settings.categories.accountDescription',
  preferences: 'settings.categories.preferencesDescription',
  notifications: 'settings.categories.notificationsDescription',
  security: 'settings.categories.securityDescription',
  appearance: 'settings.categories.appearanceDescription',
  integrations: 'settings.categories.integrationsDescription',
}

const GROUP_LABEL_KEYS: Record<GroupId, { title: string; description?: string }> = {
  profile: {
    title: 'settings.groups.profile.title',
    description: 'settings.groups.profile.description',
  },
  contact: {
    title: 'settings.groups.contact.title',
    description: 'settings.groups.contact.description',
  },
  regional: {
    title: 'settings.groups.regional.title',
    description: 'settings.groups.regional.description',
  },
  accessibility: {
    title: 'settings.groups.accessibility.title',
    description: 'settings.groups.accessibility.description',
  },
  delivery: {
    title: 'settings.groups.delivery.title',
    description: 'settings.groups.delivery.description',
  },
  authentication: {
    title: 'settings.groups.authentication.title',
    description: 'settings.groups.authentication.description',
  },
  appearanceGeneral: {
    title: 'settings.groups.appearanceGeneral.title',
    description: 'settings.groups.appearanceGeneral.description',
  },
  webhooks: {
    title: 'settings.groups.webhooks.title',
    description: 'settings.groups.webhooks.description',
  },
}

const LEGACY_CATEGORY_MAP: Record<string, CategoryId> = {
  Account: 'account',
  Preferences: 'preferences',
  Accessibility: 'preferences',
  Notifications: 'notifications',
  Security: 'security',
  Appearance: 'appearance',
  Integrations: 'integrations',
}

const SETTINGS_STRUCTURE: Array<{
  id: CategoryId
  groups: Array<{ id: GroupId; fields: SettingFieldKey[] }>
}> = [
  {
    id: 'account',
    groups: [
      { id: 'profile', fields: ['displayName'] },
      { id: 'contact', fields: ['email'] },
    ],
  },
  {
    id: 'preferences',
    groups: [
      { id: 'regional', fields: ['timezone'] },
      { id: 'accessibility', fields: ['language'] },
    ],
  },
  {
    id: 'notifications',
    groups: [{ id: 'delivery', fields: ['receiveEmails', 'receiveSms'] }],
  },
  {
    id: 'security',
    groups: [{ id: 'authentication', fields: ['twoFactor'] }],
  },
  {
    id: 'appearance',
    groups: [
      {
        id: 'appearanceGeneral',
        fields: ['themeFollowSystem', 'themePreference', 'themeEditor', 'density'],
      },
    ],
  },
  {
    id: 'integrations',
    groups: [{ id: 'webhooks', fields: ['webhookUrl'] }],
  },
]

const FIELD_META: Record<SettingFieldKey, SettingFieldMeta> = {
  displayName: {
    label: 'settings.fields.displayName.label',
    helper: 'settings.fields.displayName.helper',
  },
  email: {
    label: 'settings.fields.email.label',
    description: 'settings.fields.email.description',
  },
  language: {
    label: 'settings.fields.language.label',
    description: 'settings.fields.language.description',
    helper: 'languageSwitcher.aria',
  },
  timezone: {
    label: 'settings.fields.timezone.label',
    helper: 'settings.fields.timezone.helper',
  },
  receiveEmails: {
    label: 'settings.fields.receiveEmails.label',
    description: 'settings.fields.receiveEmails.description',
  },
  receiveSms: {
    label: 'settings.fields.receiveSms.label',
    description: 'settings.fields.receiveSms.description',
  },
  twoFactor: {
    label: 'settings.fields.twoFactor.label',
    description: 'settings.fields.twoFactor.description',
  },
  themeFollowSystem: {
    label: 'settings.fields.themeFollowSystem.label',
    description: 'settings.fields.themeFollowSystem.description',
  },
  themePreference: {
    label: 'settings.fields.themePreference.label',
    description: 'settings.fields.themePreference.description',
  },
  themeEditor: {
    label: 'settings.fields.themeEditor.label',
    description: 'settings.fields.themeEditor.description',
  },
  density: {
    label: 'settings.fields.density.label',
    description: 'settings.fields.density.description',
  },
  webhookUrl: {
    label: 'settings.fields.webhookUrl.label',
    helper: 'settings.fields.webhookUrl.helper',
    optional: true,
  },
}

const CATEGORY_FIELD_MAP = SETTINGS_STRUCTURE.reduce<Record<CategoryId, SettingFieldKey[]>>(
  (acc, category) => {
    acc[category.id] = category.groups.flatMap((group) => group.fields)
    return acc
  },
  {
    account: [],
    preferences: [],
    notifications: [],
    security: [],
    appearance: [],
    integrations: [],
  },
)

const GROUP_ORDER_MAP = SETTINGS_STRUCTURE.reduce<Record<CategoryId, GroupId[]>>(
  (acc, category) => {
    acc[category.id] = category.groups.map((group) => group.id)
    return acc
  },
  {
    account: [],
    preferences: [],
    notifications: [],
    security: [],
    appearance: [],
    integrations: [],
  },
)

const FIELD_ROUTE_MAP = SETTINGS_STRUCTURE.reduce<
  Record<SettingFieldKey, { categoryId: CategoryId; groupId: GroupId }>
>(
  (acc, category) => {
    for (const group of category.groups) {
      for (const field of group.fields) {
        acc[field] = { categoryId: category.id, groupId: group.id }
      }
    }
    return acc
  },
  {} as Record<SettingFieldKey, { categoryId: CategoryId; groupId: GroupId }>,
)

function normalizeCategoryId(value?: string | null): CategoryId | undefined {
  if (!value) return undefined
  if ((CATEGORY_ORDER as ReadonlyArray<string>).includes(value)) {
    return value as CategoryId
  }
  return LEGACY_CATEGORY_MAP[value] ?? undefined
}

function coerceNonSystemPreference(
  kind: ThemeKind,
): Exclude<UserSettingsShape['themePreference'], 'system'> {
  if (kind === 'brand') return 'brand'
  if (kind === 'dark' || kind === 'high-contrast') return 'dark'
  return 'light'
}

function resolveEffectivePreference(
  stored: UserSettingsShape['themePreference'] | undefined,
  themeKind: ThemeKind,
): UserSettingsShape['themePreference'] {
  if (stored) return stored
  if (themeKind === 'system') return 'system'
  return coerceNonSystemPreference(themeKind)
}

function SettingRow({
  description,
  helper,
  children,
}: {
  description?: string
  helper?: string
  children: React.ReactNode
}) {
  return (
    <Box sx={{ mb: 3 }}>
      <Box>{children}</Box>
      {description ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {description}
        </Typography>
      ) : null}
      {helper ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          {helper}
        </Typography>
      ) : null}
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
  const { t } = useTranslate()
  const navigate = useNavigate()
  const themeKind = useThemeStore((s) => s.kind)
  const setKind = useThemeStore((s) => s.setKind)
  const language = useI18nStore((s) => s.language)
  const languageLabel = t(`languages.${language}`)
  const [settings, setSettings] = useState<UserSettingsShape>({})
  const [search, setSearch] = useState('')
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const activeSavedRaw = useUIStore((s) => s.activeSettingsCategory)
  const setActiveSaved = useUIStore((s) => s.setActiveSettingsCategory)
  const commitPatternDraft = useUIStore((s) => s.commitPatternDraft)
  const resetPatternDraft = useUIStore((s) => s.resetPatternDraft)

  const normalizedActiveSaved = useMemo(() => normalizeCategoryId(activeSavedRaw), [activeSavedRaw])
  const [active, setActive] = useState<CategoryId>(() => normalizedActiveSaved ?? CATEGORY_ORDER[0])

  useEffect(() => {
    const stored = load()
    if (stored) setSettings(stored)
  }, [load, user?.id])

  useEffect(() => {
    setSettings((prev) => (prev.locale === language ? prev : { ...prev, locale: language }))
  }, [language])

  useEffect(() => {
    if (normalizedActiveSaved && normalizedActiveSaved !== active) {
      setActive(normalizedActiveSaved)
    }
  }, [normalizedActiveSaved, active])

  const persistLanguageSelection = useCallback(
    (nextLanguage: SupportedLanguage) => setSettings((prev) => ({ ...prev, locale: nextLanguage })),
    [setSettings],
  )

  const fieldMatchesQuery = useCallback(
    (field: SettingFieldKey, query: string) => {
      if (!query) return true
      const meta = FIELD_META[field]
      const label = t(meta.label).toLowerCase()
      if (label.includes(query)) return true
      if (meta.description && t(meta.description).toLowerCase().includes(query)) return true
      if (meta.helper && t(meta.helper).toLowerCase().includes(query)) return true
      return false
    },
    [t],
  )

  const categoryCounts = useMemo(() => {
    const query = search.trim().toLowerCase()
    const result: Record<CategoryId, number> = {
      account: 0,
      preferences: 0,
      notifications: 0,
      security: 0,
      appearance: 0,
      integrations: 0,
    }
    CATEGORY_ORDER.forEach((categoryId) => {
      const fields = CATEGORY_FIELD_MAP[categoryId]
      result[categoryId] = query
        ? fields.filter((field) => fieldMatchesQuery(field, query)).length
        : fields.length
    })
    return result
  }, [search, fieldMatchesQuery])

  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return []
    const results: Array<{ fieldKey: SettingFieldKey; categoryId: CategoryId; groupId: GroupId }> =
      []
    ;(Object.keys(FIELD_ROUTE_MAP) as SettingFieldKey[]).forEach((fieldKey) => {
      if (fieldMatchesQuery(fieldKey, query)) {
        results.push({ fieldKey, ...FIELD_ROUTE_MAP[fieldKey] })
      }
    })
    results.sort((a, b) => {
      const categoryDiff =
        CATEGORY_ORDER.indexOf(a.categoryId) - CATEGORY_ORDER.indexOf(b.categoryId)
      if (categoryDiff !== 0) return categoryDiff
      const groupDiff =
        GROUP_ORDER_MAP[a.categoryId].indexOf(a.groupId) -
        GROUP_ORDER_MAP[b.categoryId].indexOf(b.groupId)
      if (groupDiff !== 0) return groupDiff
      const fieldOrder = CATEGORY_FIELD_MAP[a.categoryId]
      return fieldOrder.indexOf(a.fieldKey) - fieldOrder.indexOf(b.fieldKey)
    })
    return results
  }, [search, fieldMatchesQuery])

  const activeCategory = useMemo(
    () => SETTINGS_STRUCTURE.find((item) => item.id === active),
    [active],
  )

  const open = openProp ?? true
  const onClose = onCloseProp ?? (() => navigate(-1))
  const handleClose = () => {
    resetPatternDraft()
    onClose()
  }

  const clearSearch = () => {
    setSearch('')
    setTimeout(() => searchInputRef.current?.focus(), 0)
  }
  const effectivePreference = resolveEffectivePreference(settings.themePreference, themeKind)
  const followsSystem = effectivePreference === 'system'
  const activeNonSystemPreference =
    effectivePreference === 'system' ? coerceNonSystemPreference(themeKind) : effectivePreference

  const onSave = () => {
    commitPatternDraft()
    save(settings)
  }

  const renderField = (fieldKey: SettingFieldKey, label: string) => {
    switch (fieldKey) {
      case 'displayName':
        return (
          <TextField
            label={label}
            value={settings.displayName ?? ''}
            onChange={(e) => setSettings((prev) => ({ ...prev, displayName: e.target.value }))}
            fullWidth
          />
        )
      case 'email':
        return <TextField label={label} value={user?.email ?? ''} fullWidth disabled />
      case 'language':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxWidth: 320 }}>
            <LanguageMenu
              variant="button"
              buttonLabel={`${label}: ${languageLabel}`}
              onLanguageSelect={persistLanguageSelection}
              fullWidth
              size="medium"
            />
          </Box>
        )
      case 'timezone':
        return (
          <TextField
            label={label}
            value={settings.timezone ?? 'UTC'}
            onChange={(e) => setSettings((prev) => ({ ...prev, timezone: e.target.value }))}
            fullWidth
          />
        )
      case 'receiveEmails':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={!!settings.receiveEmails}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, receiveEmails: e.target.checked }))
                }
              />
            }
            label={label}
          />
        )
      case 'receiveSms':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={!!settings.receiveSms}
                onChange={(e) => setSettings((prev) => ({ ...prev, receiveSms: e.target.checked }))}
              />
            }
            label={label}
          />
        )
      case 'twoFactor':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={!!settings.twoFactorEnabled}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, twoFactorEnabled: e.target.checked }))
                }
              />
            }
            label={label}
          />
        )
      case 'themeFollowSystem':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={followsSystem}
                onChange={(e) => {
                  const checked = e.target.checked
                  if (checked) {
                    setSettings((prev) => ({ ...prev, themePreference: 'system' }))
                    setKind('system')
                    return
                  }
                  const fallback =
                    settings.themePreference && settings.themePreference !== 'system'
                      ? settings.themePreference
                      : coerceNonSystemPreference(themeKind)
                  setSettings((prev) => ({ ...prev, themePreference: fallback }))
                  setKind(fallback as ThemeKind)
                }}
              />
            }
            label={
              followsSystem ? t('settings.toggles.followingSystem') : t('settings.toggles.override')
            }
          />
        )
      case 'themePreference': {
        const current = activeNonSystemPreference
        return (
          <ToggleButtonGroup
            exclusive
            value={current}
            onChange={(_, value: string | null) => {
              if (!value) return
              setSettings((prev) => ({
                ...prev,
                themePreference: value as UserSettingsShape['themePreference'],
              }))
              setKind(value as ThemeKind)
            }}
            size="small"
            disabled={followsSystem}
          >
            <ToggleButton value="light">{t('settings.themeOptions.light')}</ToggleButton>
            <ToggleButton value="dark">{t('settings.themeOptions.dark')}</ToggleButton>
            <ToggleButton value="brand">{t('settings.themeOptions.brand')}</ToggleButton>
          </ToggleButtonGroup>
        )
      }
      case 'themeEditor':
        return (
          <Button
            variant="outlined"
            disabled={followsSystem}
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
        )
      case 'density':
        return (
          <TextField
            select
            label={label}
            value={settings.density ?? 'comfortable'}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSettings((prev) => ({
                ...prev,
                density: e.target.value as UserSettingsShape['density'],
              }))
            }
            sx={{ minWidth: 240 }}
          >
            <MenuItem value="comfortable">{t('settings.densityOptions.comfortable')}</MenuItem>
            <MenuItem value="compact">{t('settings.densityOptions.compact')}</MenuItem>
          </TextField>
        )
      case 'webhookUrl':
        return (
          <TextField
            type="url"
            label={label}
            value={settings.webhookUrl ?? ''}
            onChange={(e) => setSettings((prev) => ({ ...prev, webhookUrl: e.target.value }))}
            fullWidth
          />
        )
      default:
        return null
    }
  }

  if (!user)
    return (
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{t('settings.title')}</DialogTitle>
        <DialogContent>
          <Typography>{t('settings.signInPrompt')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>
    )

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: (theme) => ({
          borderRadius: 2,
          boxShadow: 'none',
          m: 2,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }),
      }}
    >
      <DialogTitle>{t('settings.title')}</DialogTitle>
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
            <TextField
              inputRef={searchInputRef}
              placeholder={t('settings.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              size="small"
              sx={{ mt: 1, mb: 1 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {search ? (
                      <IconButton
                        size="small"
                        onClick={clearSearch}
                        aria-label={t('settings.actions.clearSearch')}
                      >
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
                {CATEGORY_ORDER.map((categoryId) => {
                  const label = t(CATEGORY_LABEL_KEYS[categoryId])
                  return (
                    <ListItemButton
                      key={categoryId}
                      selected={active === categoryId}
                      onClick={() => {
                        setActive(categoryId)
                        setActiveSaved(categoryId)
                      }}
                      sx={(theme) => {
                        const selectAlpha = theme.palette.mode === 'dark' ? 0.22 : 0.12
                        const hoverAlpha =
                          theme.palette.mode === 'dark' ? selectAlpha + 0.08 : selectAlpha + 0.04
                        return {
                          borderRadius: 2,
                          mb: 0.5,
                          color: theme.palette.text.secondary,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, hoverAlpha),
                            color: theme.palette.getContrastText(theme.palette.primary.main),
                          },
                          '&.Mui-selected': {
                            backgroundColor: alpha(theme.palette.primary.main, selectAlpha),
                            color: theme.palette.getContrastText(theme.palette.primary.main),
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, hoverAlpha + 0.04),
                            },
                          },
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {CATEGORY_ICON_MAP[categoryId]}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Box component="span">{label}</Box>
                            {search ? (
                              <Typography
                                variant="caption"
                                color={
                                  categoryCounts[categoryId] === 0
                                    ? 'text.disabled'
                                    : 'text.secondary'
                                }
                              >
                                {categoryCounts[categoryId] ?? 0}
                              </Typography>
                            ) : null}
                          </Box>
                        }
                      />
                    </ListItemButton>
                  )
                })}
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
            <Box sx={{ mb: 1 }}>
              <Typography variant="h6" gutterBottom>
                {t(CATEGORY_LABEL_KEYS[active])}
              </Typography>
              {(() => {
                const descriptionKey = CATEGORY_DESCRIPTION_KEYS[active]
                if (!descriptionKey) return null
                return (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {t(descriptionKey)}
                  </Typography>
                )
              })()}
            </Box>

            <Box sx={{ overflowY: 'auto', flex: 1, pr: 1 }}>
              {search ? (
                <Box>
                  {searchResults.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      {t('settings.noResults')}
                    </Typography>
                  ) : (
                    searchResults.map(({ fieldKey, categoryId, groupId }) => {
                      const meta = FIELD_META[fieldKey]
                      const label = t(meta.label)
                      const description = meta.description ? t(meta.description) : undefined
                      const helperPieces = [
                        meta.helper ? t(meta.helper) : undefined,
                        meta.optional ? t('settings.optional') : undefined,
                      ].filter(Boolean)
                      const helper = helperPieces.length ? helperPieces.join(' · ') : undefined
                      const control = renderField(fieldKey, label)
                      if (!control) return null
                      return (
                        <Box key={`${categoryId}-${groupId}-${fieldKey}`} sx={{ mb: 3 }}>
                          <Typography variant="overline" color="text.secondary">
                            {t(CATEGORY_LABEL_KEYS[categoryId])} ·{' '}
                            {t(GROUP_LABEL_KEYS[groupId].title)}
                          </Typography>
                          <SettingRow description={description} helper={helper}>
                            {control}
                          </SettingRow>
                        </Box>
                      )
                    })
                  )}
                </Box>
              ) : (
                activeCategory?.groups.map((group) => {
                  const groupMeta = GROUP_LABEL_KEYS[group.id]
                  const groupTitle = t(groupMeta.title)
                  const groupDescription = groupMeta.description
                    ? t(groupMeta.description)
                    : undefined

                  return (
                    <CategoryGroup key={group.id} title={groupTitle} description={groupDescription}>
                      {group.fields.map((fieldKey) => {
                        const meta = FIELD_META[fieldKey]
                        const label = t(meta.label)
                        const description = meta.description ? t(meta.description) : undefined
                        const helperPieces = [
                          meta.helper ? t(meta.helper) : undefined,
                          meta.optional ? t('settings.optional') : undefined,
                        ].filter(Boolean)
                        const helper = helperPieces.length ? helperPieces.join(' · ') : undefined
                        const control = renderField(fieldKey, label)
                        if (!control) return null
                        return (
                          <SettingRow key={fieldKey} description={description} helper={helper}>
                            {control}
                          </SettingRow>
                        )
                      })}
                    </CategoryGroup>
                  )
                })
              )}
            </Box>
          </Box>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('common.close')}</Button>
        <Button
          variant="contained"
          onClick={() => {
            onSave()
            handleClose()
          }}
        >
          {t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
