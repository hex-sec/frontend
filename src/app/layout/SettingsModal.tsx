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
import MenuIcon from '@mui/icons-material/Menu'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import PaletteIcon from '@mui/icons-material/Palette'
import { useTranslate } from '@i18n/useTranslate'
import { alpha, useTheme } from '@mui/material/styles'
import { useThemeStore } from '@store/theme.store'
import { useSiteStore } from '@store/site.store'
import { BASE_SETTINGS_SCHEMA } from './components/settings/settings.schema'
import { SETTINGS_DEFAULT_VALUES } from './components/settings/settings.defaults'
import type {
  SettingsModalProps,
  StructuredCategory,
  OptionPresentation,
  SettingsOptionChoice,
} from './components/settings/settings.types'

// Re-export for external usage
export { SETTINGS_DEFAULT_VALUES }

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

function TopbarPreview({ values }: { values: Record<string, boolean | number | string> }) {
  const theme = useTheme()
  const blurValue = Number(values['appearance.topbar.topbarBlur'] ?? 14)
  const badgesEnabled = Boolean(values['appearance.topbar.topbarBadges'])
  const patternEnabled = Boolean(values['appearance.topbar.topbarPatternEnabled'])
  const rawKind = values['appearance.topbar.topbarPatternKind']
  const patternKind = typeof rawKind === 'string' ? rawKind : 'subtle-diagonal'
  const opacityValue = Number(values['appearance.topbar.topbarPatternOpacity'] ?? 0.08)
  const clampedOpacity = Math.max(0, Math.min(0.4, opacityValue))
  const scaleValue = Number(values['appearance.topbar.topbarPatternScale'] ?? 28)
  const clampedScale = Math.max(8, Math.min(64, Math.round(scaleValue || 28)))
  const dotScale = Math.max(6, Math.round(clampedScale / 4))

  const backgroundTint = alpha(
    theme.palette.primary.main,
    theme.palette.mode === 'dark' ? 0.82 : 0.92,
  )
  const contrastColor =
    theme.palette.mode === 'dark'
      ? theme.palette.common.white
      : theme.palette.getContrastText(theme.palette.primary.main)

  let bgImage: string | undefined
  let bgSize: string | undefined
  if (patternEnabled && patternKind !== 'none' && clampedOpacity > 0) {
    if (patternKind === 'subtle-diagonal') {
      bgImage = `linear-gradient(135deg, ${alpha(
        contrastColor,
        clampedOpacity,
      )} 25%, transparent 25%, transparent 50%, ${alpha(contrastColor, clampedOpacity)} 50%, ${alpha(
        contrastColor,
        clampedOpacity,
      )} 75%, transparent 75%, transparent)`
      bgSize = `${clampedScale}px ${clampedScale}px`
    } else if (patternKind === 'subtle-dots') {
      bgImage = `radial-gradient(${alpha(contrastColor, clampedOpacity)} 1px, transparent 1px)`
      bgSize = `${dotScale}px ${dotScale}px`
    } else if (patternKind === 'geometry') {
      bgImage = `linear-gradient(45deg, ${alpha(
        contrastColor,
        clampedOpacity,
      )} 25%, transparent 25%), linear-gradient(-45deg, ${alpha(
        contrastColor,
        clampedOpacity,
      )} 25%, transparent 25%)`
      bgSize = `${clampedScale}px ${clampedScale}px`
    }
  }

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
        overflow: 'hidden',
        backgroundColor: alpha(
          theme.palette.background.paper,
          theme.palette.mode === 'dark' ? 0.3 : 0.6,
        ),
      }}
    >
      <Box
        sx={{
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          backgroundColor: backgroundTint,
          backgroundImage: bgImage,
          backgroundSize: bgSize,
          color: contrastColor,
          backdropFilter: `blur(${Math.max(0, Math.min(40, blurValue))}px)`,
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <MenuIcon fontSize="small" />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 12 }}>
            HexSecure
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <SearchIcon sx={{ fontSize: 18 }} />
          <Box
            sx={{
              position: 'relative',
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: alpha(contrastColor, 0.15),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <NotificationsNoneIcon sx={{ fontSize: 16 }} />
            {badgesEnabled ? (
              <Box
                component="span"
                sx={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: theme.palette.error.main,
                  border: `1px solid ${contrastColor}`,
                }}
              />
            ) : null}
          </Box>
        </Box>
      </Box>
    </Box>
  )
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
  const sites = useSiteStore((state) => state.sites)
  const hydrateSites = useSiteStore((state) => state.hydrate)

  useEffect(() => {
    if (!open) return
    hydrateSites()
  }, [open, hydrateSites])

  const landingSiteChoices = useMemo(
    () =>
      sites.map((site) => ({
        value: site.slug,
        label: site.name,
      })),
    [sites],
  )

  const schemaWithDynamicData = useMemo(() => {
    const groupedPresets = presets.length
      ? [
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
      : null

    const iconMap: Record<string, JSX.Element> = {
      account: <PersonOutlinedIcon fontSize="small" />,
      notifications: <NotificationsActiveIcon fontSize="small" />,
      security: <ShieldOutlinedIcon fontSize="small" />,
      appearance: <PaletteIcon fontSize="small" />,
    }

    return BASE_SETTINGS_SCHEMA.map((category) => {
      const icon = iconMap[category.key] || category.icon
      let groups = category.groups

      if (groupedPresets && category.key === 'appearance') {
        groups = groups.map((group) => {
          if (group.key !== 'generalLook') return group
          return {
            ...group,
            options: group.options.map((option) => {
              if (option.key !== 'themeMode') return option
              return {
                ...option,
                choices:
                  groupedPresets.length > 0
                    ? groupedPresets.flatMap((modeGroup) =>
                        modeGroup.items.map((preset) => ({
                          value: preset.id,
                          label: preset.label,
                          group: modeGroup.label,
                        })),
                      )
                    : undefined,
              }
            }),
          }
        })
      }

      if (category.key === 'account') {
        groups = groups.map((group) => {
          if (group.key !== 'profile') return group
          return {
            ...group,
            options: group.options.map((option) => {
              if (option.key !== 'defaultLandingSite') return option
              return {
                ...option,
                choices: landingSiteChoices,
              }
            }),
          }
        })
      }

      return {
        ...category,
        icon,
        groups,
      }
    })
  }, [landingSiteChoices, presets])

  const firstCategoryKey = schemaWithDynamicData[0]?.key ?? ''

  const [selectedCategory, setSelectedCategory] = useState<string>(firstCategoryKey)
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

    if (presets.length) {
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
    }

    const wantsSiteLanding = baseValues['account.profile.defaultLanding'] === 'site'
    const hasEmptySiteSelection =
      typeof baseValues['account.profile.defaultLandingSite'] !== 'string' ||
      baseValues['account.profile.defaultLandingSite'].length === 0

    if (wantsSiteLanding && hasEmptySiteSelection && landingSiteChoices[0]) {
      baseValues['account.profile.defaultLandingSite'] = landingSiteChoices[0].value
    }

    setValues(baseValues)
    setSelectedCategory(firstCategoryKey)
  }, [open, initialValues, presets, currentPresetId, firstCategoryKey])

  useEffect(() => {
    if (!open) return
    if (!landingSiteChoices.length) return
    setValues((prev) => {
      if (prev['account.profile.defaultLanding'] !== 'site') return prev
      const currentSiteValue = String(prev['account.profile.defaultLandingSite'] ?? '')
      if (currentSiteValue) return prev
      return {
        ...prev,
        'account.profile.defaultLandingSite': landingSiteChoices[0].value,
      }
    })
  }, [landingSiteChoices, open])

  const structuredCategories: StructuredCategory[] = useMemo(() => {
    return schemaWithDynamicData.map((category) => {
      const categoryLabel = t(category.labelKey)

      const groups = category.groups.map((group) => {
        const groupLabel = t(group.labelKey)
        const groupDescription = group.descriptionKey ? t(group.descriptionKey) : undefined

        const translatedOptions: OptionPresentation[] = group.options.map((option) => ({
          option,
          label: option.labelKey ? t(option.labelKey) : (option.label ?? option.key),
          description: option.descriptionKey ? t(option.descriptionKey) : option.description,
          placeholder: option.placeholderKey ? t(option.placeholderKey) : option.placeholder,
          choices: option.choices?.map((choice: SettingsOptionChoice) => {
            const choiceLabel = choice.labelKey
              ? t(choice.labelKey)
              : (choice.label ?? choice.value)
            return {
              value: choice.value,
              label: choiceLabel,
              group: choice.group,
              disabled: choice.disabled,
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
  }, [normalizedQuery, t, schemaWithDynamicData])

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

  const handleValueChange = useCallback(
    (key: string, value: boolean | number | string) => {
      setValues((prev) => {
        const next: Record<string, boolean | number | string> = { ...prev, [key]: value }

        if (key === 'account.profile.defaultLanding') {
          const normalized = String(value)
          if (normalized === 'site') {
            const currentSiteValue = String(prev['account.profile.defaultLandingSite'] ?? '')
            if (!currentSiteValue && landingSiteChoices[0]) {
              next['account.profile.defaultLandingSite'] = landingSiteChoices[0].value
            }
          } else {
            next['account.profile.defaultLandingSite'] = ''
          }
        }

        if (key === 'account.profile.defaultLandingSite') {
          next[key] = typeof value === 'string' ? value : String(value)
        }

        return next
      })
    },
    [landingSiteChoices],
  )

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
    const { option, label, description, choices, placeholder } = presented
    const optionKey = buildOptionKey(categoryKey, groupKey, option.key)
    if (option.visibleWhen) {
      const dependencyValue = values[option.visibleWhen.key]
      if (dependencyValue !== option.visibleWhen.equals) {
        return null
      }
    }
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
              value={
                typeof currentValue === 'string'
                  ? currentValue
                  : currentValue != null
                    ? String(currentValue)
                    : ''
              }
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
              SelectProps={{
                displayEmpty: Boolean(placeholder),
              }}
              disabled={
                optionKey === 'account.profile.defaultLandingSite' &&
                (!choices || choices.length === 0)
              }
            >
              {(() => {
                const nodes: React.ReactNode[] = []

                if (optionKey === 'account.profile.defaultLandingSite' && placeholder) {
                  nodes.push(
                    <MenuItem key="placeholder" value="">
                      {highlightMatch(placeholder, searchTerm)}
                    </MenuItem>,
                  )
                }

                if (!choices) return nodes.length > 0 ? nodes : null

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
                    <MenuItem key={choice.value} value={choice.value} disabled={choice.disabled}>
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
            {optionKey === 'account.profile.defaultLandingSite' &&
            (!choices || choices.length === 0) ? (
              <Typography variant="caption" color="text.secondary">
                {highlightMatch(
                  t('settings.account.profile.defaultLandingSite.emptyState'),
                  searchTerm,
                )}
              </Typography>
            ) : null}
          </Box>
        )
      case 'slider': {
        const numericValue = Number(currentValue ?? option.min ?? 0)
        const sliderDisplay =
          option.max !== undefined && option.max <= 1
            ? `${Math.round(numericValue * 100)}%`
            : numericValue
        return (
          <Box key={optionKey} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2">{highlightMatch(label, searchTerm)}</Typography>
              <Typography variant="caption" color="text.secondary">
                {sliderDisplay}
              </Typography>
            </Box>
            <Slider
              value={numericValue}
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
      }
      case 'text':
        return (
          <Box key={optionKey} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="subtitle2">{highlightMatch(label, searchTerm)}</Typography>
            <TextField
              size="small"
              value={String(currentValue ?? '')}
              onChange={(event) => handleValueChange(optionKey, event.target.value)}
              placeholder={placeholder}
              sx={{
                mt: 0.5,
                maxWidth: 260,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: searchFieldBg,
                  color: theme.palette.text.primary,
                  '& fieldset': { borderColor: borderShade },
                  '&:hover fieldset': { borderColor: hoverBorderColor },
                  '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                },
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
          overflow: { xs: 'auto', md: 'hidden' },
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
      <DialogContent
        sx={{
          px: 3,
          py: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          overflow: { xs: 'auto', md: 'hidden' },
          maxHeight: { xs: 'none', md: 'calc(100vh - 220px)' },
          height: { xs: 'auto', md: 'calc(100vh - 220px)' },
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          sx={{
            alignItems: { xs: 'stretch', md: 'flex-start' },
            flex: { xs: 'none', md: 1 },
            minHeight: 0,
            height: { xs: 'auto', md: '100%' },
          }}
        >
          <Box
            sx={{
              width: { xs: '100%', md: 260 },
              flexShrink: 0,
              backgroundColor: sidebarSurface,
              borderRadius: 2,
              border: subtleBorder,
              position: { xs: 'static', md: 'sticky' },
              top: { xs: 'auto', md: 0 },
              alignSelf: { xs: 'stretch', md: 'flex-start' },
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              p: 2,
              maxHeight: { xs: 'none', md: '100%' },
              overflowY: { xs: 'visible', md: 'auto' },
            }}
          >
            <TextField
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={t('settings.searchPlaceholder')}
              variant="outlined"
              fullWidth
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
                        backgroundColor: alpha(theme.palette.primary.main, isDarkMode ? 0.18 : 0.1),
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
              minHeight: 0,
              height: { xs: 'auto', md: '100%' },
              overflowY: { xs: 'visible', md: 'auto' },
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
                  {activeCategory.key === 'appearance' && group.key === 'topbar' ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          letterSpacing: 0.6,
                          textTransform: 'uppercase',
                          color: 'text.secondary',
                        }}
                      >
                        {t('settings.appearance.topbar.previewLabel')}
                      </Typography>
                      <TopbarPreview values={values} />
                    </Box>
                  ) : null}
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
      </DialogContent>
      <Divider sx={{ borderColor: borderShade }} />
      <DialogActions sx={{ px: 3, py: 2.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            width: '100%',
            flexWrap: 'wrap',
            justifyContent: { xs: 'flex-start', md: 'flex-end' },
          }}
        >
          <Button
            onClick={onClose}
            color="inherit"
            sx={{
              order: { xs: 0, md: onApply ? 1 : 0 },
              mr: { xs: 'auto', md: 0 },
            }}
          >
            {t('common.cancel')}
          </Button>
          {onApply ? (
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleApply}
              sx={{ order: { xs: 2, md: 0 } }}
            >
              {t('common.apply')}
            </Button>
          ) : null}
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{ order: { xs: 1, md: onApply ? 2 : 1 } }}
          >
            {t('common.saveChanges')}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}
