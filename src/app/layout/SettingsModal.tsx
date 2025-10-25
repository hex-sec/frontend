import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  Slider,
  Stack,
  Switch,
  TextField,
  Typography,
  FormControlLabel,
  MenuItem,
  ListSubheader,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import PaletteIcon from '@mui/icons-material/Palette'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import { useTranslate } from '@i18n/useTranslate'
import { alpha, useTheme } from '@mui/material/styles'
import { useThemeStore } from '@store/theme.store'

type OptionType = 'switch' | 'select' | 'slider' | 'checkbox'

type SettingsOptionChoice = {
  value: string
  labelKey?: string
  label?: string
  group?: string
}

type SettingsOption = {
  key: string
  labelKey: string
  descriptionKey?: string
  type: OptionType
  choices?: SettingsOptionChoice[]
  min?: number
  max?: number
  step?: number
}

type SettingsGroup = {
  key: string
  labelKey: string
  descriptionKey?: string
  options: SettingsOption[]
}

type SettingsCategory = {
  key: string
  labelKey: string
  icon: JSX.Element
  groups: SettingsGroup[]
}

type SettingsModalProps = {
  open: boolean
  onClose: () => void
  onApply?: (values: Record<string, boolean | number | string>) => void
  onSave?: (values: Record<string, boolean | number | string>) => void
  initialValues?: Record<string, boolean | number | string>
}

const BASE_SETTINGS_SCHEMA: SettingsCategory[] = [
  {
    key: 'account',
    labelKey: 'settings.categories.account',
    icon: <PersonOutlinedIcon fontSize="small" />,
    groups: [
      {
        key: 'profile',
        labelKey: 'settings.account.profile.title',
        descriptionKey: 'settings.account.profile.description',
        options: [
          {
            key: 'profileVisibility',
            labelKey: 'settings.account.profile.profileVisibility.label',
            descriptionKey: 'settings.account.profile.profileVisibility.description',
            type: 'switch',
          },
          {
            key: 'digestLanguage',
            labelKey: 'settings.account.profile.digestLanguage.label',
            descriptionKey: 'settings.account.profile.digestLanguage.description',
            type: 'select',
            choices: [
              { value: 'es', labelKey: 'languages.es' },
              { value: 'en', labelKey: 'languages.en' },
              { value: 'pt', labelKey: 'languages.pt' },
            ],
          },
        ],
      },
      {
        key: 'privacy',
        labelKey: 'settings.account.privacy.title',
        descriptionKey: 'settings.account.privacy.description',
        options: [
          {
            key: 'auditTrail',
            labelKey: 'settings.account.privacy.auditTrail.label',
            descriptionKey: 'settings.account.privacy.auditTrail.description',
            type: 'switch',
          },
          {
            key: 'sessionTimeout',
            labelKey: 'settings.account.privacy.sessionTimeout.label',
            descriptionKey: 'settings.account.privacy.sessionTimeout.description',
            type: 'select',
            choices: [
              { value: '15', labelKey: 'settings.account.privacy.sessionTimeout.choices.15' },
              { value: '30', labelKey: 'settings.account.privacy.sessionTimeout.choices.30' },
              { value: '60', labelKey: 'settings.account.privacy.sessionTimeout.choices.60' },
            ],
          },
        ],
      },
    ],
  },
  {
    key: 'notifications',
    labelKey: 'settings.categories.notifications',
    icon: <NotificationsActiveIcon fontSize="small" />,
    groups: [
      {
        key: 'alerts',
        labelKey: 'settings.notifications.alerts.title',
        descriptionKey: 'settings.notifications.alerts.description',
        options: [
          {
            key: 'criticalIncidents',
            labelKey: 'settings.notifications.alerts.criticalIncidents.label',
            descriptionKey: 'settings.notifications.alerts.criticalIncidents.description',
            type: 'switch',
          },
          {
            key: 'visitorArrivals',
            labelKey: 'settings.notifications.alerts.visitorArrivals.label',
            descriptionKey: 'settings.notifications.alerts.visitorArrivals.description',
            type: 'switch',
          },
        ],
      },
      {
        key: 'channels',
        labelKey: 'settings.notifications.channels.title',
        descriptionKey: 'settings.notifications.channels.description',
        options: [
          {
            key: 'channelEmail',
            labelKey: 'settings.notifications.channels.channelEmail.label',
            descriptionKey: 'settings.notifications.channels.channelEmail.description',
            type: 'switch',
          },
          {
            key: 'channelSms',
            labelKey: 'settings.notifications.channels.channelSms.label',
            descriptionKey: 'settings.notifications.channels.channelSms.description',
            type: 'switch',
          },
          {
            key: 'channelPush',
            labelKey: 'settings.notifications.channels.channelPush.label',
            descriptionKey: 'settings.notifications.channels.channelPush.description',
            type: 'switch',
          },
        ],
      },
    ],
  },
  {
    key: 'security',
    labelKey: 'settings.categories.security',
    icon: <ShieldOutlinedIcon fontSize="small" />,
    groups: [
      {
        key: 'auth',
        labelKey: 'settings.security.auth.title',
        descriptionKey: 'settings.security.auth.description',
        options: [
          {
            key: 'mfa',
            labelKey: 'settings.security.auth.mfa.label',
            descriptionKey: 'settings.security.auth.mfa.description',
            type: 'switch',
          },
          {
            key: 'passwordRotation',
            labelKey: 'settings.security.auth.passwordRotation.label',
            descriptionKey: 'settings.security.auth.passwordRotation.description',
            type: 'select',
            choices: [
              { value: '30', labelKey: 'settings.security.auth.passwordRotation.choices.30' },
              { value: '60', labelKey: 'settings.security.auth.passwordRotation.choices.60' },
              { value: '90', labelKey: 'settings.security.auth.passwordRotation.choices.90' },
            ],
          },
        ],
      },
      {
        key: 'sessions',
        labelKey: 'settings.security.sessions.title',
        descriptionKey: 'settings.security.sessions.description',
        options: [
          {
            key: 'sessionLimit',
            labelKey: 'settings.security.sessions.sessionLimit.label',
            descriptionKey: 'settings.security.sessions.sessionLimit.description',
            type: 'slider',
            min: 1,
            max: 10,
            step: 1,
          },
          {
            key: 'geoLock',
            labelKey: 'settings.security.sessions.geoLock.label',
            descriptionKey: 'settings.security.sessions.geoLock.description',
            type: 'switch',
          },
        ],
      },
    ],
  },
  {
    key: 'appearance',
    labelKey: 'settings.categories.appearance',
    icon: <PaletteIcon fontSize="small" />,
    groups: [
      {
        key: 'generalLook',
        labelKey: 'settings.appearance.generalLook.title',
        descriptionKey: 'settings.appearance.generalLook.description',
        options: [
          {
            key: 'themeMode',
            labelKey: 'settings.appearance.generalLook.themeMode.label',
            descriptionKey: 'settings.appearance.generalLook.themeMode.description',
            type: 'select',
            choices: [
              { value: 'auto', labelKey: 'settings.appearance.generalLook.themeMode.choices.auto' },
              {
                value: 'light',
                labelKey: 'settings.appearance.generalLook.themeMode.choices.light',
              },
              { value: 'dark', labelKey: 'settings.appearance.generalLook.themeMode.choices.dark' },
            ],
          },
          {
            key: 'density',
            labelKey: 'settings.appearance.generalLook.density.label',
            descriptionKey: 'settings.appearance.generalLook.density.description',
            type: 'select',
            choices: [
              {
                value: 'comfortable',
                labelKey: 'settings.appearance.generalLook.density.choices.comfortable',
              },
              {
                value: 'standard',
                labelKey: 'settings.appearance.generalLook.density.choices.standard',
              },
              {
                value: 'compact',
                labelKey: 'settings.appearance.generalLook.density.choices.compact',
              },
            ],
          },
        ],
      },
      {
        key: 'topbar',
        labelKey: 'settings.appearance.topbar.title',
        descriptionKey: 'settings.appearance.topbar.description',
        options: [
          {
            key: 'topbarBlur',
            labelKey: 'settings.appearance.topbar.topbarBlur.label',
            descriptionKey: 'settings.appearance.topbar.topbarBlur.description',
            type: 'slider',
            min: 0,
            max: 20,
            step: 1,
          },
          {
            key: 'topbarBadges',
            labelKey: 'settings.appearance.topbar.topbarBadges.label',
            descriptionKey: 'settings.appearance.topbar.topbarBadges.description',
            type: 'switch',
          },
        ],
      },
      {
        key: 'charts',
        labelKey: 'settings.appearance.charts.title',
        descriptionKey: 'settings.appearance.charts.description',
        options: [
          {
            key: 'chartPalette',
            labelKey: 'settings.appearance.charts.chartPalette.label',
            descriptionKey: 'settings.appearance.charts.chartPalette.description',
            type: 'select',
            choices: [
              { value: 'brand', labelKey: 'settings.appearance.charts.chartPalette.choices.brand' },
              { value: 'viz', labelKey: 'settings.appearance.charts.chartPalette.choices.viz' },
              { value: 'mono', labelKey: 'settings.appearance.charts.chartPalette.choices.mono' },
            ],
          },
          {
            key: 'chartAnimation',
            labelKey: 'settings.appearance.charts.chartAnimation.label',
            descriptionKey: 'settings.appearance.charts.chartAnimation.description',
            type: 'switch',
          },
        ],
      },
    ],
  },
]

export const SETTINGS_DEFAULT_VALUES: Record<string, boolean | number | string> = {
  'account.profile.profileVisibility': true,
  'account.profile.digestLanguage': 'es',
  'account.privacy.auditTrail': true,
  'account.privacy.sessionTimeout': '30',
  'notifications.alerts.criticalIncidents': true,
  'notifications.alerts.visitorArrivals': true,
  'notifications.channels.channelEmail': true,
  'notifications.channels.channelSms': false,
  'notifications.channels.channelPush': true,
  'security.auth.mfa': true,
  'security.auth.passwordRotation': '60',
  'security.sessions.sessionLimit': 3,
  'security.sessions.geoLock': false,
  'appearance.generalLook.themeMode': 'auto',
  'appearance.generalLook.density': 'standard',
  'appearance.topbar.topbarBlur': 14,
  'appearance.topbar.topbarBadges': true,
  'appearance.charts.chartPalette': 'brand',
  'appearance.charts.chartAnimation': true,
}

function buildOptionKey(category: string, group: string, option: string) {
  return `${category}.${group}.${option}`
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function highlightMatch(text: string, query: string): ReactNode {
  if (!query) return text
  const normalized = query.toLowerCase()
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'ig')
  return text
    .split(regex)
    .filter((segment) => segment.length > 0)
    .map((segment, index) =>
      segment.toLowerCase() === normalized ? (
        <Box
          key={`${segment}-${index}`}
          component="span"
          sx={{ color: 'primary.main', fontWeight: 600 }}
        >
          {segment}
        </Box>
      ) : (
        <span key={`${segment}-${index}`}>{segment}</span>
      ),
    )
}

type StructuredCategory = {
  key: string
  label: string
  icon: JSX.Element
  totalMatches: number
  groups: Array<{
    key: string
    label: string
    description?: string
    options: OptionPresentation[]
    matchCount: number
  }>
}

type OptionPresentationChoice = {
  value: string
  label: string
  group?: string
}

type OptionPresentation = {
  option: SettingsOption
  label: string
  description?: string
  choices?: OptionPresentationChoice[]
}

export default function SettingsModal({
  open,
  onClose,
  onApply,
  onSave,
  initialValues,
}: SettingsModalProps) {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const { t } = useTranslate()
  const presets = useThemeStore((state) => state.presets)
  const currentPresetId = useThemeStore((state) => state.currentId)
  const surfaceColor = alpha(theme.palette.background.paper, isDarkMode ? 0.94 : 0.98)
  const backdropColor = alpha(theme.palette.background.default, isDarkMode ? 0.8 : 0.5)
  const headerGradient = `linear-gradient(90deg, ${alpha(
    theme.palette.primary.main,
    isDarkMode ? 0.28 : 0.18,
  )}, ${alpha(theme.palette.primary.light, isDarkMode ? 0.12 : 0.08)})`
  const sidebarSurface = alpha(theme.palette.background.paper, isDarkMode ? 0.72 : 0.9)
  const contentSurface = alpha(theme.palette.background.paper, isDarkMode ? 0.6 : 0.86)
  const borderShade = alpha(theme.palette.divider, isDarkMode ? 0.6 : 0.25)
  const subtleBorder = `1px solid ${borderShade}`
  const searchFieldBg = alpha(theme.palette.background.paper, isDarkMode ? 0.52 : 0.92)
  const searchIconColor = alpha(theme.palette.text.secondary, isDarkMode ? 0.9 : 0.7)
  const sliderShadow = `0 0 0 4px ${alpha(theme.palette.primary.main, 0.2)}`
  const hoverBorderColor = alpha(theme.palette.primary.main, isDarkMode ? 0.5 : 0.35)

  const [searchTerm, setSearchTerm] = useState('')
  const schemaWithPresets = useMemo(() => {
    if (!presets.length) return BASE_SETTINGS_SCHEMA

    const groupedPresets = [
      {
        key: 'light',
        label: 'Temas claros',
        items: presets.filter((preset) => preset.palette.mode !== 'dark'),
      },
      {
        key: 'dark',
        label: 'Temas oscuros',
        items: presets.filter((preset) => preset.palette.mode === 'dark'),
      },
    ].filter((group) => group.items.length > 0)

    return BASE_SETTINGS_SCHEMA.map((category) => {
      if (category.key !== 'appearance') return category
      return {
        ...category,
        groups: category.groups.map((group) => {
          if (group.key !== 'generalLook') return group
          return {
            ...group,
            options: group.options.map((option) => {
              if (option.key !== 'themeMode') return option
              return {
                ...option,
                choices: groupedPresets.flatMap((modeGroup) =>
                  modeGroup.items.map((preset) => ({
                    value: preset.id,
                    label: preset.label,
                    group: modeGroup.label,
                  })),
                ),
              }
            }),
          }
        }),
      }
    })
  }, [presets])

  const [selectedCategory, setSelectedCategory] = useState<string>(schemaWithPresets[0]?.key ?? '')
  const [values, setValues] = useState<Record<string, boolean | number | string>>(() => ({
    ...SETTINGS_DEFAULT_VALUES,
  }))
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const dragState = useRef<{
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)
  const paperRef = useRef<HTMLDivElement | null>(null)

  const normalizedQuery = searchTerm.trim().toLowerCase()

  useEffect(() => {
    if (!open) return
    const baseValues = { ...SETTINGS_DEFAULT_VALUES, ...(initialValues ?? {}) }

    if (schemaWithPresets === BASE_SETTINGS_SCHEMA) {
      setValues(baseValues)
      setSelectedCategory(schemaWithPresets[0]?.key ?? '')
      return
    }

    const availablePresetIds = presets.map((preset) => preset.id)
    const initialThemeValue = baseValues['appearance.generalLook.themeMode']
    const normalizedThemeValue =
      typeof initialThemeValue === 'string' && availablePresetIds.includes(initialThemeValue)
        ? initialThemeValue
        : availablePresetIds.includes(currentPresetId)
          ? currentPresetId
          : availablePresetIds[0]

    if (normalizedThemeValue) {
      baseValues['appearance.generalLook.themeMode'] = normalizedThemeValue
    }

    setValues(baseValues)
    setSelectedCategory(schemaWithPresets[0]?.key ?? '')
  }, [open, initialValues, schemaWithPresets, presets, currentPresetId])

  const structuredCategories: StructuredCategory[] = useMemo(() => {
    return schemaWithPresets.map((category) => {
      const categoryLabel = t(category.labelKey)

      const groups = category.groups.map((group) => {
        const groupLabel = t(group.labelKey)
        const groupDescription = group.descriptionKey ? t(group.descriptionKey) : undefined

        const translatedOptions: OptionPresentation[] = group.options.map((option) => ({
          option,
          label: t(option.labelKey),
          description: option.descriptionKey ? t(option.descriptionKey) : undefined,
          choices: option.choices?.map((choice: SettingsOptionChoice) => {
            const choiceLabel = choice.labelKey
              ? t(choice.labelKey)
              : (choice.label ?? choice.value)
            return {
              value: choice.value,
              label: choiceLabel,
              group: choice.group,
            }
          }),
        }))

        const matchingOptions = translatedOptions.filter(({ label, description }) => {
          if (!normalizedQuery) return true
          const haystack = `${label} ${description ?? ''}`.toLowerCase()
          return haystack.includes(normalizedQuery)
        })

        const visibleOptions = normalizedQuery ? matchingOptions : translatedOptions
        const matchCount = normalizedQuery ? matchingOptions.length : translatedOptions.length

        return {
          key: group.key,
          label: groupLabel,
          description: groupDescription,
          options: visibleOptions,
          matchCount,
        }
      })

      const visibleGroups = normalizedQuery
        ? groups.filter((group) => group.options.length > 0)
        : groups

      const totalMatches = visibleGroups.reduce((acc, group) => acc + group.options.length, 0)

      return {
        key: category.key,
        label: categoryLabel,
        icon: category.icon,
        totalMatches,
        groups: visibleGroups,
      }
    })
  }, [normalizedQuery, t, schemaWithPresets])

  useEffect(() => {
    if (!open) {
      setSearchTerm('')
      setPosition({ x: 0, y: 0 })
      dragState.current = null
    }
  }, [open])

  useEffect(() => {
    if (!normalizedQuery) return
    const active = structuredCategories.find((category) => category.key === selectedCategory)
    if (active && active.groups.length > 0) return
    const fallback = structuredCategories.find((category) => category.groups.length > 0)
    if (fallback && fallback.key !== selectedCategory) {
      setSelectedCategory(fallback.key)
    }
  }, [normalizedQuery, selectedCategory, structuredCategories])

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const data = dragState.current
    if (!data) return
    const deltaX = event.clientX - data.startX
    const deltaY = event.clientY - data.startY
    setPosition({ x: data.originX + deltaX, y: data.originY + deltaY })
  }, [])

  const handleMouseUp = useCallback(() => {
    dragState.current = null
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }, [handleMouseMove])

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  const handleHeaderMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault()
      dragState.current = {
        startX: event.clientX,
        startY: event.clientY,
        originX: position.x,
        originY: position.y,
      }
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [handleMouseMove, handleMouseUp, position.x, position.y],
  )

  const activeCategory = structuredCategories.find((category) => category.key === selectedCategory)

  const handleValueChange = (key: string, value: boolean | number | string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleApply = () => {
    onApply?.(values)
  }

  const handleSave = () => {
    onSave?.(values)
  }

  const renderOptionControl = (
    categoryKey: string,
    groupKey: string,
    presented: OptionPresentation,
  ) => {
    const { option, label, description, choices } = presented
    const optionKey = buildOptionKey(categoryKey, groupKey, option.key)
    const currentValue = values[optionKey]

    switch (option.type) {
      case 'switch':
      case 'checkbox':
        return (
          <FormControlLabel
            key={optionKey}
            control={
              <Switch
                checked={Boolean(currentValue)}
                onChange={(event) => handleValueChange(optionKey, event.target.checked)}
              />
            }
            label={
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="subtitle2">{highlightMatch(label, searchTerm)}</Typography>
                {description ? (
                  <Typography variant="caption" color="text.secondary">
                    {highlightMatch(description, searchTerm)}
                  </Typography>
                ) : null}
              </Box>
            }
            sx={{ alignItems: 'flex-start', m: 0 }}
          />
        )
      case 'select':
        return (
          <Box key={optionKey} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="subtitle2">{highlightMatch(label, searchTerm)}</Typography>
            <TextField
              select
              size="small"
              value={String(currentValue ?? '')}
              onChange={(event) => handleValueChange(optionKey, event.target.value)}
              sx={{
                mt: 0.5,
                maxWidth: 240,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: searchFieldBg,
                  color: theme.palette.text.primary,
                  '& fieldset': { borderColor: borderShade },
                  '&:hover fieldset': { borderColor: hoverBorderColor },
                  '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                },
              }}
            >
              {(() => {
                if (!choices) return null
                const nodes: React.ReactNode[] = []
                let lastGroup: string | undefined
                choices.forEach((choice) => {
                  if (choice.group && choice.group !== lastGroup) {
                    nodes.push(
                      <ListSubheader key={`header-${choice.group}`} disableSticky>
                        {choice.group}
                      </ListSubheader>,
                    )
                    lastGroup = choice.group
                  }
                  nodes.push(
                    <MenuItem key={choice.value} value={choice.value}>
                      {highlightMatch(choice.label, searchTerm)}
                    </MenuItem>,
                  )
                })
                return nodes
              })()}
            </TextField>
            {description ? (
              <Typography variant="caption" color="text.secondary">
                {highlightMatch(description, searchTerm)}
              </Typography>
            ) : null}
          </Box>
        )
      case 'slider':
        return (
          <Box key={optionKey} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2">{highlightMatch(label, searchTerm)}</Typography>
              <Typography variant="caption" color="text.secondary">
                {Number(currentValue ?? option.min ?? 0)}
              </Typography>
            </Box>
            <Slider
              value={Number(currentValue ?? option.min ?? 0)}
              min={option.min ?? 0}
              max={option.max ?? 10}
              step={option.step ?? 1}
              onChange={(_, value) =>
                handleValueChange(optionKey, Array.isArray(value) ? value[0] : value)
              }
              sx={{
                '& .MuiSlider-thumb': { boxShadow: sliderShadow },
              }}
            />
            {description ? (
              <Typography variant="caption" color="text.secondary">
                {highlightMatch(description, searchTerm)}
              </Typography>
            ) : null}
          </Box>
        )
      default:
        return null
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      hideBackdrop={false}
      PaperProps={{
        ref: paperRef,
        sx: {
          position: 'relative',
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          transition: dragState.current ? 'none' : 'transform 0.2s ease-out',
          borderRadius: 3,
          overflow: 'hidden',
          backgroundColor: surfaceColor,
          border: subtleBorder,
          boxShadow: theme.shadows[24],
          color: theme.palette.text.primary,
          backdropFilter: 'blur(18px)',
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: backdropColor,
            backdropFilter: 'blur(6px)',
          },
        },
      }}
    >
      <Box
        onMouseDown={handleHeaderMouseDown}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          cursor: dragState.current ? 'grabbing' : 'grab',
          userSelect: 'none',
          background: headerGradient,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {t('settings.title')}
        </Typography>
        <IconButton onClick={onClose} color="inherit" size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ borderColor: borderShade }} />
      <DialogContent sx={{ px: 3, py: 3 }}>
        <Stack spacing={3}>
          <TextField
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={t('settings.searchPlaceholder')}
            fullWidth
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: searchIconColor }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: searchFieldBg,
                borderRadius: 2,
                color: theme.palette.text.primary,
                '& fieldset': { borderColor: 'transparent' },
                '&:hover fieldset': { borderColor: hoverBorderColor },
                '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
              },
            }}
          />

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Box
              sx={{
                width: { xs: '100%', md: 260 },
                flexShrink: 0,
                backgroundColor: sidebarSurface,
                borderRadius: 2,
                border: subtleBorder,
              }}
            >
              <List disablePadding>
                {structuredCategories.map((category) => {
                  const isSelected = selectedCategory === category.key
                  const hasMatches = normalizedQuery ? category.totalMatches > 0 : true
                  return (
                    <ListItemButton
                      key={category.key}
                      selected={isSelected}
                      disabled={!hasMatches}
                      onClick={() => setSelectedCategory(category.key)}
                      sx={{
                        gap: 1.5,
                        alignItems: 'center',
                        px: 2.5,
                        py: 1.5,
                        borderRadius: 2,
                        transition: theme.transitions.create('background-color', {
                          duration: theme.transitions.duration.shorter,
                        }),
                        '&.Mui-selected': {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            isDarkMode ? 0.28 : 0.16,
                          ),
                        },
                        '&.Mui-selected .MuiTypography-root': {
                          color: theme.palette.primary.main,
                        },
                        '&.Mui-selected svg': {
                          color: theme.palette.primary.main,
                        },
                        '&:not(.Mui-selected):hover': {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            isDarkMode ? 0.18 : 0.1,
                          ),
                        },
                        '& .MuiTypography-root': {
                          color: theme.palette.text.primary,
                        },
                        '& svg': {
                          color: theme.palette.text.secondary,
                        },
                        '&.Mui-disabled': {
                          opacity: 0.4,
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {category.icon}
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {highlightMatch(category.label, searchTerm)}
                        </Typography>
                      </Box>
                      {normalizedQuery ? (
                        <Chip
                          label={category.totalMatches}
                          size="small"
                          color={category.totalMatches > 0 ? 'primary' : 'default'}
                          sx={{ ml: 'auto' }}
                        />
                      ) : null}
                    </ListItemButton>
                  )
                })}
              </List>
            </Box>

            <Box
              sx={{
                flexGrow: 1,
                backgroundColor: contentSurface,
                borderRadius: 2,
                border: subtleBorder,
                px: { xs: 2, md: 3 },
                py: { xs: 2, md: 3 },
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}
            >
              {activeCategory && activeCategory.groups.length > 0 ? (
                activeCategory.groups.map((group) => (
                  <Box key={group.key} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {highlightMatch(group.label, searchTerm)}
                      </Typography>
                      {group.description ? (
                        <Typography variant="body2" color="text.secondary">
                          {highlightMatch(group.description, searchTerm)}
                        </Typography>
                      ) : null}
                    </Box>
                    <Stack spacing={2}>
                      {group.options.map((optionPresentation) =>
                        renderOptionControl(activeCategory.key, group.key, optionPresentation),
                      )}
                    </Stack>
                  </Box>
                ))
              ) : (
                <Box
                  sx={{
                    flexGrow: 1,
                    minHeight: 220,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    gap: 1,
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {t('settings.emptyState.title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('settings.emptyState.description')}
                  </Typography>
                </Box>
              )}
            </Box>
          </Stack>
        </Stack>
      </DialogContent>
      <Divider sx={{ borderColor: borderShade }} />
      <DialogActions sx={{ px: 3, py: 2.5, gap: 1.5 }}>
        <Button onClick={onClose} color="inherit">
          {t('common.cancel')}
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        {onApply ? (
          <Button variant="outlined" color="inherit" onClick={handleApply}>
            {t('common.apply')}
          </Button>
        ) : null}
        <Button variant="contained" onClick={handleSave}>
          {t('common.saveChanges')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
