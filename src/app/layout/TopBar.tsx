import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Fragment,
  type ElementType,
  type MouseEvent,
  type SyntheticEvent,
} from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Avatar,
  Chip,
  ListSubheader,
  MenuList,
  useMediaQuery,
} from '@mui/material'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import MenuIcon from '@mui/icons-material/Menu'
import HomeIcon from '@mui/icons-material/Home'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import GroupsIcon from '@mui/icons-material/Groups'
import SecurityIcon from '@mui/icons-material/Security'
import SettingsIcon from '@mui/icons-material/Settings'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import LogoutIcon from '@mui/icons-material/Logout'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import DomainIcon from '@mui/icons-material/Domain'
import BarChartIcon from '@mui/icons-material/BarChart'
import DoorFrontIcon from '@mui/icons-material/DoorFront'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import LocalPoliceIcon from '@mui/icons-material/LocalPolice'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled'
import BadgeOutlinedIcon from '@mui/icons-material/Badge'
import Badge from '@mui/material/Badge'
import SearchIcon from '@mui/icons-material/Search'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import EventIcon from '@mui/icons-material/Event'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import type { ButtonProps } from '@mui/material/Button'
import { alpha, useTheme } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
import { useAuthStore } from '@app/auth/auth.store'
import { useUIStore } from '@store/ui.store'
import { useI18nStore } from '@store/i18n.store'
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@i18n/i18n'
import SettingsModal, { SETTINGS_DEFAULT_VALUES } from './SettingsModal'
import { useTranslate } from '../../i18n/useTranslate'
import { useSiteStore, type SiteMode, type Site } from '@store/site.store'
import buildEntityUrl, { siteRoot } from '@app/utils/contextPaths'
import { useUserSettings, type UserSettings } from '@app/hooks/useUserSettings'
import { useThemeStore } from '@store/theme.store'
import type { ThemeKind } from '@app/theme.types'
import { expandModalSettings, flattenModalSettings } from '@services/settings.service'

type NavItem = {
  label: string
  to: string
  Icon: ElementType
  description?: string
}

type NotificationType = 'incident' | 'visitor' | 'announcement'

type Notification = {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: string
  siteSlug?: string
}

type NotificationAction = {
  label: string
  variant?: ButtonProps['variant']
  color?: ButtonProps['color']
  onClick: () => void
}

const getLocaleFromLanguage = (language: string): string => {
  const localeMap: Record<string, string> = {
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    it: 'it-IT',
    pt: 'pt-PT',
    ru: 'ru-RU',
    zh: 'zh-CN',
    ja: 'ja-JP',
  }
  return localeMap[language] || language
}

function getUserInitials(source?: string): string {
  if (!source) return 'HX'
  const trimmed = source.trim()
  if (!trimmed) return 'HX'
  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
}

function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 64 64"
      sx={{
        width: size,
        height: size,
        color: 'primary.main',
      }}
    >
      <polygon points="32 4 56 18 56 46 32 60 8 46 8 18" fill="currentColor" opacity={0.9} />
      <polygon points="32 16 44 23 44 41 32 48 20 41 20 23" fill="#ffffff" opacity={0.25} />
      <polygon points="32 24 38 28 38 36 32 40 26 36 26 28" fill="#ffffff" opacity={0.55} />
    </Box>
  )
}

export default function TopBar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { t } = useTranslate()
  const { language, setLanguage } = useI18nStore((s) => ({
    language: s.language,
    setLanguage: s.setLanguage,
  }))
  const patternEnabled = useUIStore((s) => s.patternEnabled)
  const patternKind = useUIStore((s) => s.patternKind)
  const patternOpacity = useUIStore((s) => s.patternOpacity)
  const patternScale = useUIStore((s) => s.patternScale)
  const setPatternEnabled = useUIStore((s) => s.setPatternEnabled)
  const setPatternKind = useUIStore((s) => s.setPatternKind)
  const setPatternOpacity = useUIStore((s) => s.setPatternOpacity)
  const setPatternScale = useUIStore((s) => s.setPatternScale)
  const topbarBlur = useUIStore((s) => s.topbarBlur)
  const setTopbarBlur = useUIStore((s) => s.setTopbarBlur)
  const topbarBadges = useUIStore((s) => s.topbarBadges)
  const setTopbarBadges = useUIStore((s) => s.setTopbarBadges)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const openSettings = useUIStore((s) => s.openSettings)
  const setOpenSettings = useUIStore((s) => s.setOpenSettings)
  const { sites, current, mode, hydrate, setCurrent, setMode } = useSiteStore()
  const location = useLocation()
  const { load: loadUserSettings, save: saveUserSettings } = useUserSettings()
  const themeKind = useThemeStore((s) => s.kind)
  const setThemeKind = useThemeStore((s) => s.setKind)
  const themePresets = useThemeStore((s) => s.presets)
  const themePresetId = useThemeStore((s) => s.currentId)
  const setThemePreset = useThemeStore((s) => s.setCurrent)
  const [settingsModalInitialValues, setSettingsModalInitialValues] = useState<
    Record<string, boolean | number | string>
  >(() => ({ ...SETTINGS_DEFAULT_VALUES }))
  const [saveFeedback, setSaveFeedback] = useState<{
    open: boolean
    message: string
    key: number
  }>(() => ({
    open: false,
    message: '',
    key: 0,
  }))

  const items = useMemo<NavItem[]>(() => {
    if (!user) return []

    if (mode === 'site' && current) {
      const base = siteRoot(current.slug)
      return [
        {
          label: t('topnav.siteNav.dashboard.label', { siteName: current.name }),
          to: base,
          Icon: DomainIcon,
          description: t('topnav.siteNav.dashboard.description'),
        },
        {
          label: t('topnav.siteNav.allUsers.label'),
          to: buildEntityUrl('users', undefined, { mode: 'site', currentSlug: current.slug }),
          Icon: PeopleIcon,
          description: t('topnav.siteNav.allUsers.description', { siteName: current.name }),
        },
        {
          label: t('topnav.siteNav.residents.label'),
          to: buildEntityUrl('users/residents', undefined, {
            mode: 'site',
            currentSlug: current.slug,
          }),
          Icon: GroupsIcon,
          description: t('topnav.siteNav.residents.description'),
        },
        {
          label: t('topnav.siteNav.guards.label'),
          to: `${base}/users/guards`,
          Icon: LocalPoliceIcon,
          description: t('topnav.siteNav.guards.description'),
        },
        {
          label: t('topnav.siteNav.admins.label'),
          to: `${base}/users/admins`,
          Icon: ManageAccountsIcon,
          description: t('topnav.siteNav.admins.description'),
        },
        {
          label: t('topnav.siteNav.visits.label'),
          to: buildEntityUrl('visits', undefined, { mode: 'site', currentSlug: current.slug }),
          Icon: DoorFrontIcon,
          description: t('topnav.siteNav.visits.description'),
        },
        {
          label: t('topnav.siteNav.residences.label'),
          to: buildEntityUrl('residences', undefined, { mode: 'site', currentSlug: current.slug }),
          Icon: HomeWorkIcon,
          description: t('topnav.siteNav.residences.description'),
        },
        {
          label: t('topnav.siteNav.vehicles.label'),
          to: buildEntityUrl('vehicles', undefined, { mode: 'site', currentSlug: current.slug }),
          Icon: DirectionsCarFilledIcon,
          description: t('topnav.siteNav.vehicles.description'),
        },
        {
          label: t('topnav.siteNav.visitors.label'),
          to: buildEntityUrl('visitors', undefined, { mode: 'site', currentSlug: current.slug }),
          Icon: BadgeOutlinedIcon,
          description: t('topnav.siteNav.visitors.description'),
        },
        {
          label: t('topnav.siteNav.reports.label'),
          to: buildEntityUrl('reports', undefined, { mode: 'site', currentSlug: current.slug }),
          Icon: BarChartIcon,
          description: t('topnav.siteNav.reports.description', { siteName: current.name }),
        },
      ]
    }

    switch (user.role) {
      case 'admin':
        return [
          {
            label: t('topnav.roleNav.admin.dashboard.label'),
            to: buildEntityUrl(''),
            Icon: DashboardIcon,
            description: t('topnav.roleNav.admin.dashboard.description'),
          },
          {
            label: t('topnav.roleNav.admin.sites.label'),
            to: buildEntityUrl('sites'),
            Icon: DomainIcon,
            description: t('topnav.roleNav.admin.sites.description'),
          },
          {
            label: t('topnav.roleNav.admin.users.label'),
            to: buildEntityUrl('users'),
            Icon: PeopleIcon,
            description: t('topnav.roleNav.admin.users.description'),
          },
          {
            label: 'Admins',
            to: buildEntityUrl('users/admins'),
            Icon: ManageAccountsIcon,
            description: 'Manage administrative users',
          },
          {
            label: 'Guards',
            to: buildEntityUrl('users/guards'),
            Icon: LocalPoliceIcon,
            description: 'Manage security personnel',
          },
          {
            label: 'Residents',
            to: buildEntityUrl('users/residents'),
            Icon: GroupsIcon,
            description: 'Manage resident users',
          },
          {
            label: t('topnav.roleNav.admin.residences.label'),
            to: buildEntityUrl('residences'),
            Icon: HomeWorkIcon,
            description: t('topnav.roleNav.admin.residences.description'),
          },
          {
            label: t('topnav.roleNav.admin.visits.label'),
            to: buildEntityUrl('visits'),
            Icon: DoorFrontIcon,
            description: t('topnav.roleNav.admin.visits.description'),
          },
          {
            label: t('topnav.roleNav.admin.vehicles.label'),
            to: buildEntityUrl('vehicles'),
            Icon: DirectionsCarFilledIcon,
            description: t('topnav.roleNav.admin.vehicles.description'),
          },
          {
            label: t('topnav.roleNav.admin.visitors.label'),
            to: buildEntityUrl('visitors'),
            Icon: BadgeOutlinedIcon,
            description: t('topnav.roleNav.admin.visitors.description'),
          },
          {
            label: t('topnav.roleNav.admin.reports.label'),
            to: buildEntityUrl('reports'),
            Icon: BarChartIcon,
            description: t('topnav.roleNav.admin.reports.description'),
          },
        ]
      case 'guard':
        return [
          {
            label: t('topnav.roleNav.guard.kiosk.label'),
            to: '/guard',
            Icon: SecurityIcon,
            description: t('topnav.roleNav.guard.kiosk.description'),
          },
        ]
      case 'resident':
        return [
          {
            label: t('topnav.roleNav.resident.home.label'),
            to: '/app',
            Icon: HomeIcon,
            description: t('topnav.roleNav.resident.home.description'),
          },
        ]
      default:
        return []
    }
  }, [user, mode, current, t, language])

  const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null)
  const [modeDialogOpen, setModeDialogOpen] = useState(false)
  const [selectedMode, setSelectedMode] = useState<SiteMode>(mode)
  const [selectedSiteSlug, setSelectedSiteSlug] = useState(current?.slug ?? '')
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null)
  const [calendarAnchor, setCalendarAnchor] = useState<null | HTMLElement>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const topbarBlurRadius = useMemo(() => Math.max(0, Math.min(20, topbarBlur)), [topbarBlur])
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Events data with dates
  const allEvents = useMemo(() => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return [
      {
        date: today,
        type: 'arrival' as const,
        time: '09:30',
        title: 'Security committee sync',
        location: 'Ops war room',
        site: 'Vista Azul',
      },
      {
        date: today,
        type: 'arrival' as const,
        time: '11:00',
        title: 'Billing review',
        location: 'Finance hub',
        site: 'Enterprise',
      },
      {
        date: today,
        type: 'event' as const,
        time: '14:00',
        title: 'New resident onboarding',
        location: 'North gate',
        site: 'Los Olivos',
      },
      {
        date: today,
        type: 'arrival' as const,
        time: '15:00',
        title: 'Guard shift change',
        location: 'Kiosk entrance',
        site: 'Vista Azul',
      },
      {
        date: tomorrow,
        type: 'arrival' as const,
        time: '09:00',
        title: 'Monthly review meeting',
        location: 'Conference room',
        site: 'Vista Azul',
      },
    ]
  }, [])

  // Filter events for selected date
  const selectedDateEvents = useMemo(() => {
    return allEvents.filter((event) => {
      const eventDate = event.date
      return (
        eventDate.getDate() === selectedDate.getDate() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getFullYear() === selectedDate.getFullYear()
      )
    })
  }, [allEvents, selectedDate])

  const baseNotifications = useMemo<Notification[]>(() => {
    if (!user) return []

    const siteName = current?.name ?? t('topnav.notifications.fallbackSiteName')
    const siteSlug = current?.slug

    if (mode === 'site' && siteSlug) {
      return [
        {
          id: 'incident-site-1',
          type: 'incident',
          title: t('topnav.notifications.site.incident.title', { siteName }),
          message: t('topnav.notifications.site.incident.message', { siteName }),
          timestamp: t('topnav.notifications.timestamps.justNow'),
          siteSlug,
        },
        {
          id: 'visitor-site-1',
          type: 'visitor',
          title: t('topnav.notifications.site.visitor.title'),
          message: t('topnav.notifications.site.visitor.message'),
          timestamp: t('topnav.notifications.timestamps.minutesAgo', { count: 2 }),
          siteSlug,
        },
        {
          id: 'announcement-site-1',
          type: 'announcement',
          title: t('topnav.notifications.site.announcement.title'),
          message: t('topnav.notifications.site.announcement.message'),
          timestamp: t('topnav.notifications.timestamps.hoursAgo', { count: 1 }),
          siteSlug,
        },
      ]
    }

    return [
      {
        id: 'incident-enterprise-1',
        type: 'incident',
        title: t('topnav.notifications.enterprise.incident.title'),
        message: t('topnav.notifications.enterprise.incident.message'),
        timestamp: t('topnav.notifications.timestamps.minutesAgo', { count: 5 }),
      },
      {
        id: 'visitor-enterprise-1',
        type: 'visitor',
        title: t('topnav.notifications.enterprise.visitor.title'),
        message: t('topnav.notifications.enterprise.visitor.message'),
        timestamp: t('topnav.notifications.timestamps.minutesAgo', { count: 18 }),
      },
      {
        id: 'announcement-enterprise-1',
        type: 'announcement',
        title: t('topnav.notifications.enterprise.announcement.title'),
        message: t('topnav.notifications.enterprise.announcement.message'),
        timestamp: t('topnav.notifications.timestamps.today'),
      },
    ]
  }, [current, mode, t, user, language])

  const [notifications, setNotifications] = useState<Notification[]>(baseNotifications)

  useEffect(() => {
    setNotifications(baseNotifications)
  }, [baseNotifications])

  const hasAppliedLandingRef = useRef(false)
  const pathname = location.pathname

  // Ensure the stored default landing preference drives the initial navigation.
  const applyLandingPreference = useCallback(
    (preference?: UserSettings['landingPreference']) => {
      const storedPreference = preference ?? loadUserSettings()?.landingPreference
      if (!storedPreference) {
        hasAppliedLandingRef.current = true
        return
      }

      const rawTarget = storedPreference.target
      type LandingTarget = 'enterpriseDashboard' | 'sitesOverview' | 'site'
      const target: LandingTarget =
        rawTarget === 'enterpriseDashboard' || rawTarget === 'sitesOverview' || rawTarget === 'site'
          ? rawTarget
          : 'enterpriseDashboard'

      if (target === 'site') {
        if (sites.length === 0) {
          return
        }

        const requestedSlug = storedPreference.siteSlug?.trim() ?? ''
        if (!requestedSlug) {
          if (mode !== 'enterprise') {
            setMode('enterprise')
          }
          const fallbackPath = buildEntityUrl('sites')
          if (pathname !== fallbackPath) {
            navigate(fallbackPath, { replace: true })
          }
          hasAppliedLandingRef.current = true
          return
        }

        const matchedSite = sites.find((site) => site.slug === requestedSlug)
        if (!matchedSite) {
          if (mode !== 'enterprise') {
            setMode('enterprise')
          }
          const fallbackPath = buildEntityUrl('sites')
          if (pathname !== fallbackPath) {
            navigate(fallbackPath, { replace: true })
          }
          hasAppliedLandingRef.current = true
          return
        }

        if (mode !== 'site') {
          setMode('site')
        }
        if (current?.slug !== matchedSite.slug) {
          setCurrent(matchedSite)
        }
        const destination = siteRoot(matchedSite.slug)
        if (pathname !== destination) {
          navigate(destination, { replace: true })
        }
        hasAppliedLandingRef.current = true
        return
      }

      if (mode !== 'enterprise') {
        setMode('enterprise')
      }
      const destination = target === 'sitesOverview' ? buildEntityUrl('sites') : buildEntityUrl('')
      if (pathname !== destination) {
        navigate(destination, { replace: true })
      }
      hasAppliedLandingRef.current = true
    },
    [current?.slug, loadUserSettings, mode, navigate, pathname, setCurrent, setMode, sites],
  )

  useEffect(() => {
    if (!openSettings) return
    const stored = loadUserSettings()
    const storedModalValues = flattenModalSettings(stored?.modalSettings)
    const derived: Record<string, boolean | number | string> = {
      ...SETTINGS_DEFAULT_VALUES,
      ...storedModalValues,
    }
    if (stored?.locale) {
      derived['account.profile.digestLanguage'] = stored.locale
    } else {
      derived['account.profile.digestLanguage'] = language
    }
    if (typeof stored?.receiveEmails === 'boolean') {
      derived['notifications.channels.channelEmail'] = stored.receiveEmails
    }
    if (typeof stored?.receiveSms === 'boolean') {
      derived['notifications.channels.channelSms'] = stored.receiveSms
    }
    if (typeof stored?.twoFactorEnabled === 'boolean') {
      derived['security.auth.mfa'] = stored.twoFactorEnabled
    }
    if (stored?.density) {
      derived['appearance.generalLook.density'] = stored.density
    }
    const landingPreference = stored?.landingPreference
    const rawLandingTarget = landingPreference?.target
    const landingTarget =
      rawLandingTarget === 'enterpriseDashboard' ||
      rawLandingTarget === 'sitesOverview' ||
      rawLandingTarget === 'site'
        ? rawLandingTarget
        : SETTINGS_DEFAULT_VALUES['account.profile.defaultLanding']
    derived['account.profile.defaultLanding'] = landingTarget
    derived['account.profile.defaultLandingSite'] =
      landingTarget === 'site' ? (landingPreference?.siteSlug ?? '') : ''
    const presetIds = themePresets.map((preset) => preset.id)
    if (presetIds.length > 0) {
      const storedModalTheme = storedModalValues['appearance.generalLook.themeMode']
      const storedThemeId =
        typeof storedModalTheme === 'string' && presetIds.includes(storedModalTheme)
          ? storedModalTheme
          : undefined
      const fallbackPreset =
        storedThemeId ??
        (presetIds.includes(themePresetId) ? themePresetId : (presetIds[0] ?? undefined))
      if (fallbackPreset) {
        derived['appearance.generalLook.themeMode'] = fallbackPreset
      }
    } else {
      const themePreference = stored?.themePreference ?? themeKind
      derived['appearance.generalLook.themeMode'] =
        themePreference === 'system' ? 'auto' : themePreference
    }
    if (
      stored?.themePreference === 'light' ||
      stored?.themePreference === 'dark' ||
      stored?.themePreference === 'system' ||
      stored?.themePreference === 'brand' ||
      stored?.themePreference === 'high-contrast'
    ) {
      derived['appearance.generalLook.themePreference'] = stored.themePreference
    }
    derived['appearance.topbar.topbarBlur'] = topbarBlur
    derived['appearance.topbar.topbarBadges'] = topbarBadges
    derived['appearance.topbar.topbarPatternEnabled'] = patternEnabled
    derived['appearance.topbar.topbarPatternKind'] = patternKind
    derived['appearance.topbar.topbarPatternOpacity'] = patternOpacity
    derived['appearance.topbar.topbarPatternScale'] = patternScale
    setSettingsModalInitialValues(derived)
  }, [
    openSettings,
    loadUserSettings,
    themeKind,
    themePresets,
    themePresetId,
    topbarBlur,
    topbarBadges,
    patternEnabled,
    patternKind,
    patternOpacity,
    patternScale,
    setSettingsModalInitialValues,
    language,
  ])

  useEffect(() => {
    if (!user) return
    if (hasAppliedLandingRef.current) return
    applyLandingPreference()
  }, [applyLandingPreference, user])

  useEffect(() => {
    // Ensure each authenticated user hydrates their own locale, theme, and topbar styling.
    if (!user?.id) return
    const stored = loadUserSettings()
    if (!stored) return

    const storedModalValues = flattenModalSettings(stored.modalSettings)

    const modalLocale = storedModalValues['account.profile.digestLanguage']
    const nextLocaleCandidate =
      typeof modalLocale === 'string'
        ? modalLocale
        : typeof stored.locale === 'string'
          ? stored.locale
          : undefined
    if (
      nextLocaleCandidate &&
      (SUPPORTED_LANGUAGES as readonly string[]).includes(nextLocaleCandidate) &&
      nextLocaleCandidate !== language
    ) {
      setLanguage(nextLocaleCandidate as SupportedLanguage)
    }

    const modalThemeSelection = storedModalValues['appearance.generalLook.themeMode']
    const matchedPreset =
      typeof modalThemeSelection === 'string'
        ? themePresets.find((preset) => preset.id === modalThemeSelection)
        : undefined
    if (matchedPreset && themePresetId !== matchedPreset.id) {
      setThemePreset(matchedPreset.id)
    }

    const resolvedThemePreference: ThemeKind | undefined = (() => {
      if (stored.themePreference) return stored.themePreference
      if (matchedPreset) {
        return matchedPreset.palette.mode === 'dark' ? 'dark' : 'light'
      }
      if (modalThemeSelection === 'auto') return 'system'
      if (
        modalThemeSelection === 'light' ||
        modalThemeSelection === 'dark' ||
        modalThemeSelection === 'system' ||
        modalThemeSelection === 'brand' ||
        modalThemeSelection === 'high-contrast'
      ) {
        return modalThemeSelection
      }
      return undefined
    })()

    if (resolvedThemePreference && resolvedThemePreference !== themeKind) {
      setThemeKind(resolvedThemePreference)
    }

    const defaultBlur = Number(SETTINGS_DEFAULT_VALUES['appearance.topbar.topbarBlur'] ?? 14)
    const rawStoredBlur = storedModalValues['appearance.topbar.topbarBlur']
    const parsedBlur =
      typeof rawStoredBlur === 'number'
        ? rawStoredBlur
        : Number.isFinite(Number(rawStoredBlur))
          ? Number(rawStoredBlur)
          : defaultBlur
    const nextBlur = Number.isFinite(parsedBlur)
      ? Math.max(0, Math.min(40, parsedBlur))
      : defaultBlur
    if (nextBlur !== topbarBlur) {
      setTopbarBlur(nextBlur)
    }

    const defaultBadges = Boolean(SETTINGS_DEFAULT_VALUES['appearance.topbar.topbarBadges'])
    const rawStoredBadges = storedModalValues['appearance.topbar.topbarBadges']
    const nextBadges =
      typeof rawStoredBadges === 'boolean'
        ? rawStoredBadges
        : rawStoredBadges === 'true'
          ? true
          : rawStoredBadges === 'false'
            ? false
            : defaultBadges
    if (nextBadges !== topbarBadges) {
      setTopbarBadges(nextBadges)
    }

    const defaultPatternEnabled = Boolean(
      SETTINGS_DEFAULT_VALUES['appearance.topbar.topbarPatternEnabled'],
    )
    const rawStoredPatternEnabled = storedModalValues['appearance.topbar.topbarPatternEnabled']
    const nextPatternEnabled =
      typeof rawStoredPatternEnabled === 'boolean'
        ? rawStoredPatternEnabled
        : rawStoredPatternEnabled === 'true'
          ? true
          : rawStoredPatternEnabled === 'false'
            ? false
            : defaultPatternEnabled
    if (nextPatternEnabled !== patternEnabled) {
      setPatternEnabled(nextPatternEnabled)
    }

    const allowedPatternKinds = new Set(['subtle-diagonal', 'subtle-dots', 'geometry', 'none'])
    const defaultPatternKind = String(
      SETTINGS_DEFAULT_VALUES['appearance.topbar.topbarPatternKind'] ?? 'subtle-diagonal',
    )
    const rawStoredPatternKind = storedModalValues['appearance.topbar.topbarPatternKind']
    const nextPatternKind =
      typeof rawStoredPatternKind === 'string' && allowedPatternKinds.has(rawStoredPatternKind)
        ? rawStoredPatternKind
        : allowedPatternKinds.has(defaultPatternKind)
          ? defaultPatternKind
          : 'subtle-diagonal'
    if (nextPatternKind !== patternKind) {
      setPatternKind(nextPatternKind)
    }

    const defaultPatternOpacity = Number(
      SETTINGS_DEFAULT_VALUES['appearance.topbar.topbarPatternOpacity'] ?? 0.08,
    )
    const rawStoredPatternOpacity = storedModalValues['appearance.topbar.topbarPatternOpacity']
    const parsedPatternOpacity =
      typeof rawStoredPatternOpacity === 'number'
        ? rawStoredPatternOpacity
        : Number.isFinite(Number(rawStoredPatternOpacity))
          ? Number(rawStoredPatternOpacity)
          : defaultPatternOpacity
    const nextPatternOpacity = Number.isFinite(parsedPatternOpacity)
      ? Math.max(0, Math.min(0.4, parsedPatternOpacity))
      : defaultPatternOpacity
    if (Math.abs(nextPatternOpacity - patternOpacity) > 0.0001) {
      setPatternOpacity(nextPatternOpacity)
    }

    const defaultPatternScale = Number(
      SETTINGS_DEFAULT_VALUES['appearance.topbar.topbarPatternScale'] ?? 28,
    )
    const rawStoredPatternScale = storedModalValues['appearance.topbar.topbarPatternScale']
    const parsedPatternScale =
      typeof rawStoredPatternScale === 'number'
        ? rawStoredPatternScale
        : Number.isFinite(Number(rawStoredPatternScale))
          ? Number(rawStoredPatternScale)
          : defaultPatternScale
    const nextPatternScale = Number.isFinite(parsedPatternScale)
      ? Math.max(8, Math.min(64, Math.round(parsedPatternScale)))
      : defaultPatternScale
    if (nextPatternScale !== patternScale) {
      setPatternScale(nextPatternScale)
    }
  }, [
    user?.id,
    loadUserSettings,
    themePresets,
    themePresetId,
    setThemePreset,
    language,
    setLanguage,
    themeKind,
    setThemeKind,
    topbarBlur,
    setTopbarBlur,
    topbarBadges,
    setTopbarBadges,
    patternEnabled,
    setPatternEnabled,
    patternKind,
    setPatternKind,
    patternOpacity,
    setPatternOpacity,
    patternScale,
    setPatternScale,
  ])

  useEffect(() => {
    hasAppliedLandingRef.current = false
  }, [user?.id])

  const handleSettingsClose = useCallback(() => {
    setOpenSettings(false)
  }, [setOpenSettings])

  const handleSnackbarClose = useCallback(
    (_: SyntheticEvent | Event | undefined, reason?: string) => {
      if (reason === 'clickaway') return
      setSaveFeedback((prev) => ({ ...prev, open: false }))
    },
    [],
  )

  const handleSettingsSave = useCallback(
    (nextValues: Record<string, boolean | number | string>) => {
      const stored = loadUserSettings()
      const storedModalValues = flattenModalSettings(stored?.modalSettings)

      const presetIds = themePresets.map((preset) => preset.id)
      const defaultThemeSelection = (() => {
        const storedModalTheme = storedModalValues['appearance.generalLook.themeMode']
        const storedThemeId =
          typeof storedModalTheme === 'string' && presetIds.includes(storedModalTheme)
            ? storedModalTheme
            : undefined
        if (presetIds.length > 0) {
          if (storedThemeId) return storedThemeId
          if (presetIds.includes(themePresetId)) return themePresetId
          return presetIds[0]
        }
        if (stored?.themePreference) {
          return stored.themePreference === 'system' ? 'auto' : stored.themePreference
        }
        return SETTINGS_DEFAULT_VALUES['appearance.generalLook.themeMode']
      })()

      const rawTheme = String(
        nextValues['appearance.generalLook.themeMode'] ?? defaultThemeSelection,
      )

      const matchedPreset = themePresets.find((preset) => preset.id === rawTheme)
      const resolvedThemePreference: ThemeKind = matchedPreset
        ? matchedPreset.palette.mode === 'dark'
          ? 'dark'
          : 'light'
        : rawTheme === 'auto'
          ? 'system'
          : (rawTheme as ThemeKind)

      const defaultDensity =
        stored?.density ?? SETTINGS_DEFAULT_VALUES['appearance.generalLook.density']
      const rawDensity = String(nextValues['appearance.generalLook.density'] ?? defaultDensity)
      const normalizedDensity =
        rawDensity === 'comfortable' || rawDensity === 'compact' || rawDensity === 'standard'
          ? (rawDensity as 'comfortable' | 'compact' | 'standard')
          : stored?.density

      const localeValueRaw =
        typeof nextValues['account.profile.digestLanguage'] === 'string'
          ? nextValues['account.profile.digestLanguage']
          : (stored?.locale ?? language)

      const normalizedLocale =
        typeof localeValueRaw === 'string' &&
        (SUPPORTED_LANGUAGES as readonly string[]).includes(localeValueRaw)
          ? (localeValueRaw as SupportedLanguage)
          : undefined

      const rawLandingTarget = String(
        nextValues['account.profile.defaultLanding'] ??
          stored?.landingPreference?.target ??
          SETTINGS_DEFAULT_VALUES['account.profile.defaultLanding'],
      )
      const landingTargets = new Set(['enterpriseDashboard', 'sitesOverview', 'site'])
      const resolvedLandingTarget = landingTargets.has(rawLandingTarget)
        ? (rawLandingTarget as 'enterpriseDashboard' | 'sitesOverview' | 'site')
        : 'enterpriseDashboard'

      const rawLandingSiteValue =
        typeof nextValues['account.profile.defaultLandingSite'] === 'string'
          ? nextValues['account.profile.defaultLandingSite']
          : (stored?.landingPreference?.siteSlug ?? '')
      const normalizedLandingSite = rawLandingSiteValue.trim()

      const nextLandingPreference: UserSettings['landingPreference'] =
        resolvedLandingTarget === 'site'
          ? {
              target: 'site',
              ...(normalizedLandingSite ? { siteSlug: normalizedLandingSite } : {}),
            }
          : { target: resolvedLandingTarget }

      const blurValueRaw = Number(nextValues['appearance.topbar.topbarBlur'] ?? topbarBlurRadius)
      const normalizedBlur = Number.isFinite(blurValueRaw)
        ? Math.max(0, Math.min(40, blurValueRaw))
        : topbarBlurRadius
      const badgesEnabled = Boolean(nextValues['appearance.topbar.topbarBadges'])
      const patternEnabledSetting = Boolean(nextValues['appearance.topbar.topbarPatternEnabled'])
      const rawPatternKind = String(
        nextValues['appearance.topbar.topbarPatternKind'] ?? patternKind,
      )
      const allowedPatternKinds = new Set(['subtle-diagonal', 'subtle-dots', 'geometry', 'none'])
      const normalizedPatternKind = allowedPatternKinds.has(rawPatternKind)
        ? rawPatternKind
        : patternKind
      const rawPatternOpacity = Number(
        nextValues['appearance.topbar.topbarPatternOpacity'] ?? patternOpacity,
      )
      const normalizedPatternOpacity = Number.isFinite(rawPatternOpacity)
        ? Math.max(0, Math.min(0.4, rawPatternOpacity))
        : patternOpacity
      const rawPatternScale = Number(
        nextValues['appearance.topbar.topbarPatternScale'] ?? patternScale,
      )
      const normalizedPatternScale = Number.isFinite(rawPatternScale)
        ? Math.max(8, Math.min(64, rawPatternScale))
        : patternScale
      const nextModalValues = {
        ...nextValues,
        'appearance.topbar.topbarBlur': normalizedBlur,
        'appearance.topbar.topbarBadges': badgesEnabled,
        'appearance.topbar.topbarPatternEnabled': patternEnabledSetting,
        'appearance.topbar.topbarPatternKind': normalizedPatternKind,
        'appearance.topbar.topbarPatternOpacity': normalizedPatternOpacity,
        'appearance.topbar.topbarPatternScale': normalizedPatternScale,
        'appearance.generalLook.themePreference': resolvedThemePreference,
        'account.profile.defaultLanding': resolvedLandingTarget,
        'account.profile.defaultLandingSite':
          resolvedLandingTarget === 'site' ? normalizedLandingSite : '',
      }

      const nextSettings: UserSettings = {
        ...(stored ?? {}),
        landingPreference: nextLandingPreference,
        locale: normalizedLocale ?? stored?.locale ?? language,
        receiveEmails: Boolean(nextValues['notifications.channels.channelEmail']),
        receiveSms: Boolean(nextValues['notifications.channels.channelSms']),
        twoFactorEnabled: Boolean(nextValues['security.auth.mfa']),
        density: normalizedDensity,
        themePreference: resolvedThemePreference,
        modalSettings: expandModalSettings(nextModalValues),
      }

      saveUserSettings(nextSettings)
      if (matchedPreset) {
        setThemePreset(matchedPreset.id)
      }
      setThemeKind(resolvedThemePreference)

      if (normalizedLocale && normalizedLocale !== language) {
        setLanguage(normalizedLocale)
      }

      setTopbarBlur(normalizedBlur)
      setTopbarBadges(badgesEnabled)
      setPatternEnabled(patternEnabledSetting)
      setPatternKind(normalizedPatternKind)
      setPatternOpacity(normalizedPatternOpacity)
      setPatternScale(normalizedPatternScale)
      setSettingsModalInitialValues(nextModalValues)
      setOpenSettings(false)
      setSaveFeedback({ open: true, message: t('settings.toast.saveSuccess'), key: Date.now() })
    },
    [
      loadUserSettings,
      themePresets,
      themePresetId,
      setThemePreset,
      saveUserSettings,
      setThemeKind,
      setTopbarBlur,
      setTopbarBadges,
      setPatternEnabled,
      setPatternKind,
      setPatternOpacity,
      setPatternScale,
      topbarBlurRadius,
      setOpenSettings,
      setSettingsModalInitialValues,
      language,
      setLanguage,
      patternKind,
      patternOpacity,
      patternScale,
      t,
    ],
  )

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const closeNotificationsMenu = useCallback(() => {
    setNotificationsAnchor(null)
  }, [])

  const getActionsForNotification = useCallback(
    (notification: Notification): NotificationAction[] => {
      const goTo = (path: string) => {
        closeNotificationsMenu()
        navigate(path)
      }

      switch (notification.type) {
        case 'incident': {
          const reportsUrl = buildEntityUrl('reports', undefined, {
            mode: notification.siteSlug ? 'site' : 'enterprise',
            currentSlug: notification.siteSlug ?? null,
          })
          const visitsUrl = buildEntityUrl('visits', undefined, {
            mode: notification.siteSlug ? 'site' : 'enterprise',
            currentSlug: notification.siteSlug ?? null,
          })
          return [
            {
              label: t('topnav.notifications.actions.reviewIncidentLog'),
              variant: 'contained',
              color: 'error',
              onClick: () => goTo(reportsUrl),
            },
            {
              label: t('topnav.notifications.actions.markResolved'),
              color: 'inherit',
              onClick: () => {
                dismissNotification(notification.id)
                goTo(visitsUrl)
              },
            },
          ]
        }
        case 'visitor': {
          const visitsUrl = buildEntityUrl('visits', undefined, {
            mode: notification.siteSlug ? 'site' : 'enterprise',
            currentSlug: notification.siteSlug ?? null,
          })
          return [
            {
              label: t('topnav.notifications.actions.approveVisitor'),
              variant: 'contained',
              color: 'primary',
              onClick: () => {
                dismissNotification(notification.id)
                goTo(visitsUrl)
              },
            },
            {
              label: t('topnav.notifications.actions.declineVisitor'),
              variant: 'outlined',
              color: 'warning',
              onClick: () => {
                dismissNotification(notification.id)
                closeNotificationsMenu()
              },
            },
          ]
        }
        case 'announcement':
        default:
          return [
            {
              label: t('topnav.notifications.actions.readUpdate'),
              color: 'secondary',
              onClick: () => {
                dismissNotification(notification.id)
                closeNotificationsMenu()
                setOpenSettings(true)
              },
            },
          ]
      }
    },
    [closeNotificationsMenu, dismissNotification, navigate, setOpenSettings, t],
  )

  const unreadCount = notifications.length
  const hasCritical = notifications.some((notification) => notification.type === 'incident')

  const userInitials = useMemo(() => getUserInitials(user?.name ?? user?.email), [user])
  const accountDisplayName = user?.name ?? user?.email ?? t('topnav.accountMenu.defaultName')
  const accountRoleLabel = user?.role ? t(`roles.${user.role}`) : t('roles.guest')

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (!modeDialogOpen) {
      setSelectedMode(mode)
      setSelectedSiteSlug(current?.slug ?? sites[0]?.slug ?? '')
    }
  }, [modeDialogOpen, mode, current, sites])

  useEffect(() => {
    if (selectedMode === 'site' && !selectedSiteSlug && sites[0]) {
      setSelectedSiteSlug(sites[0].slug)
    }
  }, [selectedMode, selectedSiteSlug, sites])

  const clampedScale = useMemo(
    () => Math.max(8, Math.min(64, Math.round(patternScale || 28))),
    [patternScale],
  )
  const dotScale = useMemo(() => Math.max(6, Math.round(clampedScale / 4)), [clampedScale])
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'), { noSsr: true })

  const handleApplyMode = () => {
    if (selectedMode === 'enterprise') {
      setMode('enterprise')
      setModeDialogOpen(false)
      setDrawerOpen(false)
      navigate(buildEntityUrl(''))
      return
    }

    const targetSite = sites.find((site) => site.slug === selectedSiteSlug) ?? sites[0]
    if (!targetSite) {
      return
    }

    setCurrent(targetSite)
    setMode('site')
    setModeDialogOpen(false)
    setDrawerOpen(false)
    navigate(siteRoot(targetSite.slug))
  }

  const disableConfirm =
    selectedMode === 'site' &&
    (!selectedSiteSlug || !sites.some((site) => site.slug === selectedSiteSlug))

  const openUserMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setUserAnchor(event.currentTarget)
  }

  const closeUserMenu = () => {
    setUserAnchor(null)
  }

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={(muiTheme) => {
          const backgroundTint = alpha(
            muiTheme.palette.primary.main,
            muiTheme.palette.mode === 'dark' ? 0.82 : 0.92,
          )
          const contrastColor =
            muiTheme.palette.mode === 'dark'
              ? muiTheme.palette.common.white
              : muiTheme.palette.getContrastText(muiTheme.palette.primary.main)
          const patternStroke = contrastColor

          let bgImage: string | undefined
          let bgSize: string | undefined
          if (patternEnabled && patternKind !== 'none') {
            const alphaVal = Math.max(0, Math.min(1, patternOpacity))
            if (patternKind === 'subtle-diagonal') {
              bgImage = `linear-gradient(135deg, ${alpha(
                patternStroke,
                alphaVal,
              )} 25%, transparent 25%, transparent 50%, ${alpha(patternStroke, alphaVal)} 50%, ${alpha(
                patternStroke,
                alphaVal,
              )} 75%, transparent 75%, transparent)`
              bgSize = `${clampedScale}px ${clampedScale}px`
            } else if (patternKind === 'subtle-dots') {
              bgImage = `radial-gradient(${alpha(patternStroke, alphaVal)} 1px, transparent 1px)`
              bgSize = `${dotScale}px ${dotScale}px`
            } else if (patternKind === 'geometry') {
              bgImage = `linear-gradient(45deg, ${alpha(
                patternStroke,
                alphaVal,
              )} 25%, transparent 25%), linear-gradient(-45deg, ${alpha(
                patternStroke,
                alphaVal,
              )} 25%, transparent 25%)`
              bgSize = `${clampedScale}px ${clampedScale}px`
            }
          }

          return {
            height: 64,
            backdropFilter: `blur(${topbarBlurRadius}px)`,
            backgroundColor: backgroundTint,
            backgroundImage: bgImage,
            backgroundSize: bgSize,
            borderBottom: `1px solid ${alpha(contrastColor, 0.18)}`,
            boxShadow: muiTheme.shadows[muiTheme.palette.mode === 'dark' ? 8 : 3],
            color: contrastColor,
          }
        }}
      >
        <Toolbar
          sx={{
            alignItems: 'center',
            gap: 1.5,
            minHeight: 64,
            px: { xs: 2, sm: 3 },
            position: 'relative',
            flexWrap: 'nowrap',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              gap: { xs: 1, sm: 1.5 },
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setDrawerOpen(true)}
              aria-label={t('topnav.drawer.openMenu')}
              sx={{ flexShrink: 0 }}
            >
              <MenuIcon />
            </IconButton>

            <Box
              component={RouterLink}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <LogoMark size={34} />
            </Box>

            {/* Live clock for desktop - centered in topbar, visible until 600px */}
            <Box
              onClick={(e) => {
                setSelectedDate(new Date())
                setCalendarAnchor(e.currentTarget)
              }}
              sx={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                cursor: 'pointer',
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.common.white, 0.1),
                },
              }}
            >
              <AccessTimeIcon sx={{ fontSize: 18, mr: 0.5 }} />
              <Stack direction="column" spacing={0.25} alignItems="center">
                <Typography
                  variant="body2"
                  component="span"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 500,
                    letterSpacing: 0.5,
                  }}
                >
                  {currentTime.toLocaleTimeString(language === 'en' ? 'en-US' : language, {
                    hour12: true,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </Typography>
                <Typography
                  variant="caption"
                  component="span"
                  sx={{
                    textAlign: 'center',
                    opacity: 0.8,
                  }}
                >
                  {currentTime.toLocaleDateString(getLocaleFromLanguage(language), {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Typography>
              </Stack>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1, sm: 1.5 },
                flexShrink: 0,
                ml: 'auto',
              }}
            >
              {/* Calendar button for mobile */}
              <IconButton
                color="inherit"
                aria-label={t('topnav.clock.calendar.title')}
                onClick={(e) => {
                  setSelectedDate(new Date())
                  setCalendarAnchor(e.currentTarget)
                }}
                sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
              >
                <CalendarTodayIcon />
              </IconButton>

              <IconButton
                color="inherit"
                aria-label={t('topnav.notifications.aria')}
                onClick={(event) => setNotificationsAnchor(event.currentTarget)}
              >
                <Badge
                  badgeContent={unreadCount}
                  color={hasCritical ? 'error' : 'secondary'}
                  invisible={!topbarBadges || unreadCount === 0}
                >
                  <NotificationsNoneIcon sx={{ color: 'inherit' }} />
                </Badge>
              </IconButton>

              <IconButton
                color="inherit"
                aria-label={t('topnav.searchAria', { defaultValue: 'Search' })}
                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              >
                <SearchIcon />
              </IconButton>

              <IconButton
                color="inherit"
                aria-label={t('topnav.accountMenu.defaultName')}
                onClick={openUserMenu}
                sx={{ display: { xs: 'inline-flex', lg: 'none' } }}
                aria-haspopup="true"
                aria-controls={userAnchor ? 'topbar-account-menu' : undefined}
                aria-expanded={userAnchor ? 'true' : undefined}
              >
                <AccountCircleIcon />
              </IconButton>

              <Button
                color="inherit"
                startIcon={<AccountCircleIcon />}
                onClick={openUserMenu}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  display: { xs: 'none', lg: 'inline-flex' },
                  maxWidth: 240,
                  justifyContent: 'flex-start',
                }}
                aria-haspopup="true"
                aria-controls={userAnchor ? 'topbar-account-menu' : undefined}
                aria-expanded={userAnchor ? 'true' : undefined}
              >
                <Box
                  component="span"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                  }}
                >
                  {t('topnav.accountMenu.welcome', { name: accountDisplayName })}
                </Box>
              </Button>
            </Box>
          </Box>
        </Toolbar>

        <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box
            sx={(muiTheme) => ({
              width: 320,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: muiTheme.palette.background.paper,
            })}
          >
            {isMobile ? (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, pt: 2 }}>
                <IconButton
                  aria-label={t('topnav.drawer.closeMenu')}
                  onClick={() => setDrawerOpen(false)}
                  size="small"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : null}
            <Box
              sx={{
                px: 3,
                pt: isMobile ? 1 : 3,
                pb: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                borderBottom: (muiTheme) => `1px solid ${alpha(muiTheme.palette.divider, 0.6)}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: (muiTheme) => muiTheme.palette.primary.main,
                    color: (muiTheme) =>
                      muiTheme.palette.getContrastText(muiTheme.palette.primary.main),
                    fontWeight: 600,
                  }}
                >
                  {userInitials}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {accountDisplayName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {accountRoleLabel}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="overline" color="text.secondary">
                  {t('topnav.workspace.focus')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Chip
                    label={
                      mode === 'enterprise'
                        ? t('topnav.workspace.mode.enterprise')
                        : t('topnav.workspace.mode.site')
                    }
                    size="small"
                    color={mode === 'enterprise' ? 'primary' : 'secondary'}
                  />
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<SwapHorizIcon fontSize="small" />}
                    onClick={() => setModeDialogOpen(true)}
                  >
                    {t('topnav.workspace.changeMode')}
                  </Button>
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 0.75 }}
                >
                  {mode === 'enterprise'
                    ? t('topnav.workspace.hints.enterprise')
                    : current
                      ? t('topnav.workspace.hints.site', { siteName: current.name })
                      : t('topnav.workspace.hints.empty')}
                </Typography>
              </Box>
            </Box>

            <List
              component="nav"
              subheader={
                <ListSubheader
                  component="div"
                  disableSticky
                  sx={{
                    px: 3,
                    py: 1.5,
                    typography: 'overline',
                    color: 'text.secondary',
                    letterSpacing: 0.8,
                  }}
                >
                  {t('topnav.drawer.navigation')}
                </ListSubheader>
              }
              sx={{ px: 1.5, flex: 1, overflowY: 'auto' }}
            >
              {items.map((item) => {
                const Icon = item.Icon
                const isActive =
                  location.pathname === item.to ||
                  (item.to !== '/' && location.pathname.startsWith(`${item.to}/`))
                return (
                  <ListItemButton
                    key={item.to}
                    component={RouterLink}
                    to={item.to}
                    onClick={() => setDrawerOpen(false)}
                    selected={isActive}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      alignItems: 'center',
                      px: 2,
                      py: 1.25,
                      transition: (muiTheme) =>
                        muiTheme.transitions.create(['background-color', 'transform'], {
                          duration: muiTheme.transitions.duration.shorter,
                        }),
                      ...(isActive
                        ? {
                            backgroundColor: (muiTheme) =>
                              alpha(
                                muiTheme.palette.primary.main,
                                muiTheme.palette.mode === 'dark' ? 0.25 : 0.12,
                              ),
                            color: 'primary.main',
                            '& .MuiListItemIcon-root': { color: 'primary.main' },
                          }
                        : {
                            color: 'text.primary',
                            '& .MuiListItemIcon-root': { color: 'text.secondary' },
                            '&:hover': {
                              backgroundColor: (muiTheme) =>
                                alpha(muiTheme.palette.primary.main, 0.08),
                            },
                          }),
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Icon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={item.description}
                      primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }}
                      secondaryTypographyProps={{ fontSize: 12 }}
                    />
                  </ListItemButton>
                )
              })}
            </List>

            <Box sx={{ px: 3, pb: 3, pt: 2, backgroundColor: 'background.default' }}>
              <Divider sx={{ mb: 2 }} />
              <List dense disablePadding>
                <ListItemButton
                  onClick={() => {
                    setOpenSettings(true)
                    setDrawerOpen(false)
                  }}
                  sx={{ borderRadius: 1.5, mb: 0.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary' }}>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('topnav.drawer.workspaceSettings')}
                    primaryTypographyProps={{ fontSize: 13 }}
                  />
                </ListItemButton>
                <ListItemButton
                  component={RouterLink}
                  to="/billing"
                  onClick={() => setDrawerOpen(false)}
                  sx={{ borderRadius: 1.5, mb: 0.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary' }}>
                    <CreditCardIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('topnav.drawer.billing')}
                    primaryTypographyProps={{ fontSize: 13 }}
                  />
                </ListItemButton>
              </List>
              <Typography variant="caption" color="text.secondary">
                {t('topnav.drawer.version', { version: 'v1.0.0', minutes: 4 })}
              </Typography>
            </Box>
          </Box>
        </Drawer>
        <Menu
          anchorEl={notificationsAnchor}
          open={Boolean(notificationsAnchor)}
          onClose={closeNotificationsMenu}
          MenuListProps={{ disablePadding: true }}
          PaperProps={{
            sx: {
              width: 360,
              mt: 1,
              borderRadius: 2.5,
              boxShadow: (muiTheme) => muiTheme.shadows[8],
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1.5,
            }}
          >
            <Typography variant="subtitle2">{t('topnav.notifications.menuTitle')}</Typography>
            {unreadCount > 0 ? (
              <Button
                size="small"
                color="inherit"
                onClick={() => {
                  setNotifications([])
                  closeNotificationsMenu()
                }}
              >
                {t('topnav.notifications.markAllRead')}
              </Button>
            ) : null}
          </Box>
          <Divider />
          {unreadCount === 0 ? (
            <Box sx={{ px: 2.5, py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                {t('topnav.notifications.empty')}
              </Typography>
            </Box>
          ) : (
            <MenuList disablePadding component="div">
              {notifications.map((notification, index) => {
                const actions = getActionsForNotification(notification)
                const lastItem = index === notifications.length - 1
                const chipColor =
                  notification.type === 'incident'
                    ? 'error'
                    : notification.type === 'visitor'
                      ? 'primary'
                      : 'secondary'
                const chipLabelKey =
                  notification.type === 'incident'
                    ? 'incident'
                    : notification.type === 'visitor'
                      ? 'visitor'
                      : 'announcement'

                return (
                  <Box key={notification.id} sx={{ px: 2.5, py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        size="small"
                        color={chipColor}
                        label={t(`topnav.notifications.chip.${chipLabelKey}`)}
                      />
                      <Typography variant="subtitle2" sx={{ flex: 1 }}>
                        {notification.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {notification.timestamp}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1.25 }} color="text.secondary">
                      {notification.message}
                    </Typography>
                    {actions.length > 0 ? (
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
                        {actions.map((action) => (
                          <Button
                            key={action.label}
                            size="small"
                            variant={action.variant ?? 'text'}
                            color={action.color ?? 'primary'}
                            onClick={action.onClick}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </Box>
                    ) : null}
                    {lastItem ? null : <Divider sx={{ mt: 2, mb: -0.5 }} />}
                  </Box>
                )
              })}
            </MenuList>
          )}
        </Menu>

        {/* Calendar Menu */}
        <Menu
          anchorEl={calendarAnchor}
          open={Boolean(calendarAnchor)}
          onClose={() => setCalendarAnchor(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          PaperProps={{
            sx: {
              width: { xs: 'calc(100vw - 32px)', sm: 580, '@media (min-width: 750px)': 680 },
              height: 'auto',
              maxWidth: { xs: 340, sm: 580, '@media (min-width: 750px)': 680 },
              maxHeight: { xs: 'calc(100vh - 100px)', sm: 'auto' },
              mt: { xs: 1, sm: 1 },
              borderRadius: { xs: 2.5, sm: 2.5 },
              boxShadow: (muiTheme) => muiTheme.shadows[8],
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1.5,
            }}
          >
            <Typography variant="subtitle2" fontWeight={600}>
              {t('topnav.clock.calendar.title')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                size="small"
                icon={<CalendarTodayIcon fontSize="small" />}
                label={selectedDate.toLocaleDateString(getLocaleFromLanguage(language), {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
                color="primary"
                variant="outlined"
              />
            </Box>
          </Box>
          <Divider />
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              minHeight: { xs: 'auto', sm: 450 },
              overflow: 'auto',
            }}
          >
            {/* Calendar View */}
            <Paper
              elevation={0}
              sx={{
                width: { xs: '100%', sm: 300 },
                borderRight: { xs: 'none', sm: '1px solid' },
                borderBottom: { xs: '1px solid', sm: 'none' },
                borderColor: 'divider',
                p: 2,
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <IconButton
                    size="small"
                    onClick={() => {
                      const newDate = new Date(selectedDate)
                      newDate.setMonth(newDate.getMonth() - 1)
                      setSelectedDate(newDate)
                    }}
                  >
                    <ChevronLeftIcon />
                  </IconButton>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {selectedDate.toLocaleDateString(getLocaleFromLanguage(language), {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => {
                      const newDate = new Date(selectedDate)
                      newDate.setMonth(newDate.getMonth() + 1)
                      setSelectedDate(newDate)
                    }}
                  >
                    <ChevronRightIcon />
                  </IconButton>
                </Stack>
                <CalendarGrid
                  currentDate={selectedDate}
                  events={allEvents}
                  onDateSelect={setSelectedDate}
                  language={language}
                />
              </Stack>
            </Paper>

            {/* Events List */}
            <Box sx={{ flex: 1, maxHeight: { xs: 'auto', sm: 450 }, overflow: 'auto' }}>
              {selectedDateEvents.length === 0 ? (
                <Box sx={{ px: 2.5, py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('topnav.clock.calendar.noEvents')}
                  </Typography>
                </Box>
              ) : (
                <MenuList disablePadding>
                  {selectedDateEvents.map((event, index) => (
                    <Fragment key={`${event.time}-${index}`}>
                      <MenuItem
                        sx={{
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          py: 1.5,
                          px: 2,
                        }}
                      >
                        <Stack direction="row" spacing={1.5} sx={{ width: '100%' }}>
                          <Chip
                            icon={event.type === 'arrival' ? <AccessTimeIcon /> : <EventIcon />}
                            label={event.time}
                            size="small"
                            color={event.type === 'arrival' ? 'primary' : 'secondary'}
                            variant="outlined"
                            sx={{ minWidth: 70 }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={500}>
                              {event.title}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 0.25 }}>
                              <Typography variant="caption" color="text.secondary">
                                {event.location}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                •
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {event.site}
                              </Typography>
                            </Stack>
                          </Box>
                        </Stack>
                      </MenuItem>
                      {index < selectedDateEvents.length - 1 ? <Divider /> : null}
                    </Fragment>
                  ))}
                </MenuList>
              )}
            </Box>
          </Box>
        </Menu>

        <SettingsModal
          open={openSettings}
          onClose={handleSettingsClose}
          onSave={handleSettingsSave}
          initialValues={settingsModalInitialValues}
        />
      </AppBar>

      <Menu
        id="topbar-account-menu"
        anchorEl={userAnchor}
        open={Boolean(userAnchor)}
        onClose={closeUserMenu}
      >
        <MenuItem component={RouterLink} to="/profile" onClick={closeUserMenu}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          {t('topnav.accountMenu.profile')}
        </MenuItem>
        <MenuItem component={RouterLink} to="/billing" onClick={closeUserMenu}>
          <ListItemIcon>
            <CreditCardIcon fontSize="small" />
          </ListItemIcon>
          {t('topnav.accountMenu.billing')}
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            closeUserMenu()
            logout()
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          {t('topnav.accountMenu.logout')}
        </MenuItem>
      </Menu>

      <Snackbar
        key={saveFeedback.key}
        open={saveFeedback.open}
        autoHideDuration={3500}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {saveFeedback.message}
        </Alert>
      </Snackbar>

      <ModeSwitchDialog
        open={modeDialogOpen}
        onClose={() => setModeDialogOpen(false)}
        selectedMode={selectedMode}
        onModeChange={(nextMode) => setSelectedMode(nextMode)}
        selectedSiteSlug={selectedSiteSlug}
        onSiteChange={(slug) => setSelectedSiteSlug(slug)}
        onConfirm={handleApplyMode}
        canSelectSite={sites.length > 0}
        disableConfirm={disableConfirm}
        sites={sites}
      />
    </>
  )
}

function ModeSwitchDialog({
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
}: {
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
}) {
  const showSiteSelect = selectedMode === 'site'
  const { t } = useTranslate()

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('topnav.modeDialog.title')}</DialogTitle>
      <DialogContent dividers>
        <RadioGroup
          value={selectedMode}
          onChange={(event) => onModeChange(event.target.value as SiteMode)}
        >
          <FormControlLabel
            value="enterprise"
            control={<Radio />}
            label={t('topnav.modeDialog.enterpriseOption')}
          />
          <FormControlLabel
            value="site"
            control={<Radio />}
            label={t('topnav.modeDialog.siteOption')}
            disabled={!canSelectSite}
          />
        </RadioGroup>
        {showSiteSelect ? (
          <Box sx={{ mt: 2 }}>
            <TextField
              select
              label={t('topnav.modeDialog.selectSite')}
              value={selectedSiteSlug}
              onChange={(event) => onSiteChange(event.target.value)}
              fullWidth
              helperText={!canSelectSite ? t('topnav.modeDialog.noSites') : undefined}
            >
              {canSelectSite ? (
                sites.map((site) => (
                  <MenuItem key={site.slug} value={site.slug}>
                    {site.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="" disabled>
                  {t('topnav.modeDialog.noSites')}
                </MenuItem>
              )}
            </TextField>
          </Box>
        ) : null}
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

function CalendarGrid({
  currentDate,
  events,
  onDateSelect,
  language = 'en',
}: {
  currentDate: Date
  events: Array<{ date: Date; time: string; title: string }>
  onDateSelect: (date: Date) => void
  language?: string
}) {
  const today = new Date()

  // Get the first day of the month and find the Monday of that week
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const dayOfWeek = startOfMonth.getDay()
  const dayOfWeekMondayStart = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Convert Sunday=0 to Sunday=6, and shift by -1
  const startOfCalendar = new Date(startOfMonth)
  startOfCalendar.setDate(startOfMonth.getDate() - dayOfWeekMondayStart)

  // Get the last day of the month
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const daysInMonth = endOfMonth.getDate()

  // Generate all days to display (usually 35 or 42 days for a month calendar)
  const allDays = useMemo(() => {
    const days: (Date | null)[] = []
    const totalDays = Math.ceil((dayOfWeekMondayStart + daysInMonth) / 7) * 7

    // Add empty cells before the first day of month
    for (let i = 0; i < dayOfWeekMondayStart; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
      days.push(date)
    }

    // Add empty cells to fill the last week
    const remainingDays = totalDays - days.length
    for (let i = 0; i < remainingDays; i++) {
      days.push(null)
    }

    return days
  }, [currentDate.getFullYear(), currentDate.getMonth(), dayOfWeekMondayStart, daysInMonth])

  const dayNames = useMemo(() => {
    const locale = getLocaleFromLanguage(language)
    // Start from Monday (January 1, 2024 is a Monday)
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(2024, 0, i + 1) // January 1, 2024 is a Monday
      return date.toLocaleDateString(locale, { weekday: 'short' })
    })
  }, [language])

  const handleDateClick = (date: Date) => {
    onDateSelect(date)
  }

  const getDayEvents = (date: Date | null) => {
    if (!date) return []
    return events.filter((event) => {
      const eventDate = event.date
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  return (
    <Stack spacing={1.5}>
      {/* Day names */}
      <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'center' }}>
        {dayNames.map((day) => (
          <Box key={day} sx={{ width: 36, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {day}
            </Typography>
          </Box>
        ))}
      </Stack>

      {/* Calendar grid - exactly 7 days wide, fixed width */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 36px)',
          gap: 0.5,
          justifyContent: 'center',
        }}
      >
        {allDays.map((date, index) => {
          if (!date) {
            return <Box key={index} sx={{ width: 36, height: 36 }} />
          }

          const isDayToday =
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
          const isDaySelected =
            date.getDate() === currentDate.getDate() &&
            date.getMonth() === currentDate.getMonth() &&
            date.getFullYear() === currentDate.getFullYear()
          const dayEvents = getDayEvents(date)

          return (
            <Box
              key={index}
              onClick={() => handleDateClick(date)}
              sx={{
                width: 36,
                height: 36,
                position: 'relative',
                cursor: 'pointer',
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1,
                  bgcolor: isDaySelected ? 'primary.main' : 'transparent',
                  color: isDaySelected ? 'primary.contrastText' : 'inherit',
                  fontWeight: isDaySelected ? 600 : 400,
                  border: isDayToday ? '2px solid' : 'none',
                  borderColor: isDayToday ? 'primary.main' : 'transparent',
                  '&:hover': {
                    bgcolor: isDaySelected
                      ? 'primary.main'
                      : (theme) => alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <Typography variant="body2">{date.getDate()}</Typography>
              </Box>
              {dayEvents.length > 0 && !isDaySelected && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 2,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                  }}
                />
              )}
            </Box>
          )
        })}
      </Box>
    </Stack>
  )
}
