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
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import PaletteIcon from '@mui/icons-material/Palette'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import { alpha, useTheme } from '@mui/material/styles'

type OptionType = 'switch' | 'select' | 'slider' | 'checkbox'

type SettingsOption = {
  key: string
  label: string
  description?: string
  type: OptionType
  choices?: Array<{ value: string; label: string }>
  min?: number
  max?: number
  step?: number
}

type SettingsGroup = {
  key: string
  label: string
  description?: string
  options: SettingsOption[]
}

type SettingsCategory = {
  key: string
  label: string
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

const SETTINGS_SCHEMA: SettingsCategory[] = [
  {
    key: 'account',
    label: 'Cuenta',
    icon: <PersonOutlinedIcon fontSize="small" />,
    groups: [
      {
        key: 'profile',
        label: 'Perfil',
        description: 'Controla cómo se muestra tu perfil a otros administradores y guardias.',
        options: [
          {
            key: 'profileVisibility',
            label: 'Visibilidad del perfil',
            description: 'Permite que otros gestores vean tu nombre y foto.',
            type: 'switch',
          },
          {
            key: 'digestLanguage',
            label: 'Idioma del resumen semanal',
            description: 'Selecciona el idioma en el que recibes reportes y resúmenes.',
            type: 'select',
            choices: [
              { value: 'es', label: 'Español' },
              { value: 'en', label: 'Inglés' },
              { value: 'pt', label: 'Portugués' },
            ],
          },
        ],
      },
      {
        key: 'privacy',
        label: 'Privacidad',
        description: 'Configura el manejo de tus datos personales y auditorías.',
        options: [
          {
            key: 'auditTrail',
            label: 'Registrar auditorías de cambios',
            description: 'Guarda un historial detallado de ajustes realizados en tu cuenta.',
            type: 'switch',
          },
          {
            key: 'sessionTimeout',
            label: 'Cierre de sesión automático',
            description: 'Tiempo de inactividad antes de cerrar sesión por seguridad.',
            type: 'select',
            choices: [
              { value: '15', label: '15 minutos' },
              { value: '30', label: '30 minutos' },
              { value: '60', label: '1 hora' },
            ],
          },
        ],
      },
    ],
  },
  {
    key: 'notifications',
    label: 'Notificaciones',
    icon: <NotificationsActiveIcon fontSize="small" />,
    groups: [
      {
        key: 'alerts',
        label: 'Alertas',
        description: 'Define qué alertas se entregan en tiempo real.',
        options: [
          {
            key: 'criticalIncidents',
            label: 'Incidentes críticos',
            description: 'Recibir alertas prioritarias cuando un guardia marca un incidente.',
            type: 'switch',
          },
          {
            key: 'visitorArrivals',
            label: 'Llegadas de visitantes',
            description: 'Avisos cuando un visitante llega sin autorización previa.',
            type: 'switch',
          },
        ],
      },
      {
        key: 'channels',
        label: 'Canales',
        description: 'Escoge los canales por los que recibes notificaciones.',
        options: [
          {
            key: 'channelEmail',
            label: 'Correo electrónico',
            description: 'Enviar copias de alertas clave al correo.',
            type: 'switch',
          },
          {
            key: 'channelSms',
            label: 'Mensajes SMS',
            description: 'Enviar un SMS cuando se active una alerta urgente.',
            type: 'switch',
          },
          {
            key: 'channelPush',
            label: 'Notificaciones push',
            description: 'Recibir notificaciones push en la aplicación móvil.',
            type: 'switch',
          },
        ],
      },
    ],
  },
  {
    key: 'security',
    label: 'Seguridad',
    icon: <ShieldOutlinedIcon fontSize="small" />,
    groups: [
      {
        key: 'auth',
        label: 'Autenticación',
        description: 'Fortalece el acceso a la plataforma.',
        options: [
          {
            key: 'mfa',
            label: 'Autenticación multifactor obligatoria',
            description: 'Solicita un segundo factor en cada inicio de sesión.',
            type: 'switch',
          },
          {
            key: 'passwordRotation',
            label: 'Rotación de contraseñas',
            description: 'Frecuencia con la que se exige un cambio de contraseña.',
            type: 'select',
            choices: [
              { value: '30', label: 'Cada 30 días' },
              { value: '60', label: 'Cada 60 días' },
              { value: '90', label: 'Cada 90 días' },
            ],
          },
        ],
      },
      {
        key: 'sessions',
        label: 'Sesiones activas',
        description: 'Controla la permanencia de sesiones y dispositivos conectados.',
        options: [
          {
            key: 'sessionLimit',
            label: 'Sesiones simultáneas permitidas',
            description: 'Cantidad máxima de dispositivos conectados a la vez.',
            type: 'slider',
            min: 1,
            max: 10,
            step: 1,
          },
          {
            key: 'geoLock',
            label: 'Bloqueo geográfico',
            description: 'Restringe el acceso desde ubicaciones fuera de tu país.',
            type: 'switch',
          },
        ],
      },
    ],
  },
  {
    key: 'appearance',
    label: 'Apariencia',
    icon: <PaletteIcon fontSize="small" />,
    groups: [
      {
        key: 'generalLook',
        label: 'General',
        description: 'Ajusta la temática visual de toda la aplicación.',
        options: [
          {
            key: 'themeMode',
            label: 'Modo de color',
            description: 'Define si se fuerza modo claro, oscuro o dinámico.',
            type: 'select',
            choices: [
              { value: 'auto', label: 'Automático' },
              { value: 'light', label: 'Claro' },
              { value: 'dark', label: 'Oscuro' },
            ],
          },
          {
            key: 'density',
            label: 'Densidad de contenido',
            description: 'Controla el espaciado entre filas y cards.',
            type: 'select',
            choices: [
              { value: 'comfortable', label: 'Cómodo' },
              { value: 'standard', label: 'Estándar' },
              { value: 'compact', label: 'Compacto' },
            ],
          },
        ],
      },
      {
        key: 'topbar',
        label: 'Barra superior',
        description: 'Personaliza el encabezado para la operación diaria.',
        options: [
          {
            key: 'topbarBlur',
            label: 'Intensidad del blur',
            description: 'Nivel de desenfoque aplicado a la barra superior.',
            type: 'slider',
            min: 0,
            max: 20,
            step: 1,
          },
          {
            key: 'topbarBadges',
            label: 'Mostrar contadores de actividad',
            description: 'Activa globos con conteo de tareas pendientes.',
            type: 'switch',
          },
        ],
      },
      {
        key: 'charts',
        label: 'Gráficas',
        description: 'Elige cómo se visualizan las métricas clave.',
        options: [
          {
            key: 'chartPalette',
            label: 'Paleta de color',
            description: 'Juego de colores aplicado a gráficas y KPIs.',
            type: 'select',
            choices: [
              { value: 'brand', label: 'Brand' },
              { value: 'viz', label: 'Analítica' },
              { value: 'mono', label: 'Monocromático' },
            ],
          },
          {
            key: 'chartAnimation',
            label: 'Animaciones suaves',
            description: 'Activa transiciones suaves al cargar gráficas.',
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
    options: SettingsOption[]
    matchCount: number
  }>
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
  const [selectedCategory, setSelectedCategory] = useState<string>(SETTINGS_SCHEMA[0]?.key ?? '')
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
    setValues({ ...SETTINGS_DEFAULT_VALUES, ...(initialValues ?? {}) })
    setSelectedCategory(SETTINGS_SCHEMA[0]?.key ?? '')
  }, [open, initialValues])

  const structuredCategories: StructuredCategory[] = useMemo(() => {
    return SETTINGS_SCHEMA.map((category) => {
      const groups = category.groups.map((group) => {
        const matchingOptions = group.options.filter((option) => {
          if (!normalizedQuery) return true
          const haystack = `${option.label} ${option.description ?? ''}`.toLowerCase()
          return haystack.includes(normalizedQuery)
        })

        const matchCount = normalizedQuery ? matchingOptions.length : group.options.length

        return {
          key: group.key,
          label: group.label,
          description: group.description,
          options: normalizedQuery ? matchingOptions : group.options,
          matchCount,
        }
      })

      const visibleGroups = normalizedQuery
        ? groups.filter((group) => group.options.length > 0)
        : groups

      const totalMatches = visibleGroups.reduce((acc, group) => acc + group.options.length, 0)

      return {
        key: category.key,
        label: category.label,
        icon: category.icon,
        totalMatches,
        groups: visibleGroups,
      }
    })
  }, [normalizedQuery])

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

  const renderOptionControl = (categoryKey: string, groupKey: string, option: SettingsOption) => {
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
                <Typography variant="subtitle2">
                  {highlightMatch(option.label, searchTerm)}
                </Typography>
                {option.description ? (
                  <Typography variant="caption" color="text.secondary">
                    {highlightMatch(option.description, searchTerm)}
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
            <Typography variant="subtitle2">{highlightMatch(option.label, searchTerm)}</Typography>
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
              {option.choices?.map((choice) => (
                <MenuItem key={choice.value} value={choice.value}>
                  {highlightMatch(choice.label, searchTerm)}
                </MenuItem>
              ))}
            </TextField>
            {option.description ? (
              <Typography variant="caption" color="text.secondary">
                {highlightMatch(option.description, searchTerm)}
              </Typography>
            ) : null}
          </Box>
        )
      case 'slider':
        return (
          <Box key={optionKey} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2">
                {highlightMatch(option.label, searchTerm)}
              </Typography>
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
            {option.description ? (
              <Typography variant="caption" color="text.secondary">
                {highlightMatch(option.description, searchTerm)}
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
          Configuración
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
            placeholder="Buscar ajustes"
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
                      {group.options.map((option) =>
                        renderOptionControl(activeCategory.key, group.key, option),
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
                    Sin coincidencias
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ajusta tu búsqueda para encontrar configuraciones disponibles.
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
          Cancelar
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        {onApply ? (
          <Button variant="outlined" color="inherit" onClick={handleApply}>
            Aplicar
          </Button>
        ) : null}
        <Button variant="contained" onClick={handleSave}>
          Guardar cambios
        </Button>
      </DialogActions>
    </Dialog>
  )
}
