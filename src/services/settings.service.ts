import settingsSeed from '../mocks/user-settings.json'

export type ModalSettingsPrimitive = boolean | number | string
export type ModalSettingsGroup = Partial<Record<string, ModalSettingsPrimitive>>
export type ModalSettingsCategory = Partial<Record<string, ModalSettingsGroup>>
export type ModalSettings = Partial<Record<string, ModalSettingsCategory>>

export type UserSettings = {
  locale?: string
  timezone?: string
  receiveEmails?: boolean
  receiveSms?: boolean
  twoFactorEnabled?: boolean
  themePreference?: 'light' | 'dark' | 'system' | 'brand' | 'high-contrast'
  density?: 'comfortable' | 'compact' | 'standard'
  displayName?: string
  webhookUrl?: string
  modalSettings?: ModalSettings
  workspaceMode?: 'enterprise' | 'site'
  landingPreference?: {
    target: 'enterpriseDashboard' | 'sitesOverview' | 'site'
    siteSlug?: string
  }
}

type SettingsFileSchema = Record<string, ModalSettings>
type FlatModalSettings = Record<string, ModalSettingsPrimitive>
const FILE_STORAGE_KEY = 'mock.settings.file'

function storageKey(userId: string) {
  return `user.settings.${userId}`
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function parseJson<T>(value: string | null): T | null {
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

const clone = <T>(value: T): T => {
  const structured = (
    globalThis as typeof globalThis & {
      structuredClone?: (value: unknown) => unknown
    }
  ).structuredClone
  if (typeof structured === 'function') {
    return structured(value) as T
  }
  return JSON.parse(JSON.stringify(value)) as T
}

const isPrimitive = (value: unknown): value is ModalSettingsPrimitive => {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function ensureModalSettings(value: unknown): ModalSettings {
  if (!value) return {}
  if (isRecord(value) && value.modalSettings && isRecord(value.modalSettings)) {
    return ensureModalSettings(value.modalSettings)
  }

  if (!isRecord(value)) return {}

  const result: ModalSettings = {}
  let hasCategory = false

  Object.entries(value).forEach(([category, groupValue]) => {
    if (!isRecord(groupValue)) return

    const categoryNode: ModalSettingsCategory = {}
    let hasGroup = false

    Object.entries(groupValue).forEach(([group, optionValue]) => {
      if (!isRecord(optionValue)) return

      const groupNode: ModalSettingsGroup = {}
      let hasOption = false

      Object.entries(optionValue).forEach(([option, primitive]) => {
        if (isPrimitive(primitive)) {
          groupNode[option] = primitive
          hasOption = true
        }
      })

      if (hasOption) {
        categoryNode[group] = groupNode
        hasGroup = true
      }
    })

    if (hasGroup) {
      result[category] = categoryNode
      hasCategory = true
    }
  })

  if (hasCategory) {
    return result
  }

  const flat: FlatModalSettings = {}
  Object.entries(value).forEach(([key, primitive]) => {
    if (isPrimitive(primitive) && key.includes('.')) {
      flat[key] = primitive
    }
  })

  return Object.keys(flat).length > 0 ? expandModalSettings(flat) : {}
}

function getModalPrimitive(
  modal: ModalSettings,
  category: string,
  group: string,
  option: string,
): ModalSettingsPrimitive | undefined {
  return modal?.[category]?.[group]?.[option]
}

function deriveString(
  modal: ModalSettings,
  category: string,
  group: string,
  option: string,
  fallback?: string,
): string | undefined {
  const value = getModalPrimitive(modal, category, group, option)
  return typeof value === 'string' ? value : fallback
}

function deriveBoolean(
  modal: ModalSettings,
  category: string,
  group: string,
  option: string,
  fallback?: boolean,
): boolean | undefined {
  const value = getModalPrimitive(modal, category, group, option)
  return typeof value === 'boolean' ? value : fallback
}

function deriveDensity(modal: ModalSettings, fallback?: UserSettings['density']) {
  const value = deriveString(modal, 'appearance', 'generalLook', 'density')
  if (value === 'comfortable' || value === 'compact' || value === 'standard') {
    return value
  }
  return fallback
}

function deriveThemePreference(
  modal: ModalSettings,
  fallback?: UserSettings['themePreference'],
): UserSettings['themePreference'] | undefined {
  const value = deriveString(modal, 'appearance', 'generalLook', 'themePreference')
  if (
    value === 'light' ||
    value === 'dark' ||
    value === 'system' ||
    value === 'brand' ||
    value === 'high-contrast'
  ) {
    return value
  }
  return fallback
}

function deriveLandingPreference(
  modal: ModalSettings,
  fallback?: UserSettings['landingPreference'],
): UserSettings['landingPreference'] | undefined {
  const targetRaw = deriveString(modal, 'account', 'profile', 'defaultLanding')
  if (targetRaw === 'site') {
    const slug = deriveString(modal, 'account', 'profile', 'defaultLandingSite')?.trim()
    return slug ? { target: 'site', siteSlug: slug } : { target: 'site' }
  }
  if (targetRaw === 'enterpriseDashboard' || targetRaw === 'sitesOverview') {
    return { target: targetRaw }
  }
  return fallback ? clone(fallback) : undefined
}

function composeUserSettings(modal: ModalSettings, fallback?: Partial<UserSettings>): UserSettings {
  const result: UserSettings = {
    locale: fallback?.locale,
    timezone: fallback?.timezone,
    receiveEmails: fallback?.receiveEmails,
    receiveSms: fallback?.receiveSms,
    twoFactorEnabled: fallback?.twoFactorEnabled,
    themePreference: fallback?.themePreference,
    density: fallback?.density,
    displayName: fallback?.displayName,
    webhookUrl: fallback?.webhookUrl,
    modalSettings: clone(modal),
    landingPreference: fallback?.landingPreference ? clone(fallback.landingPreference) : undefined,
  }

  const locale = deriveString(modal, 'account', 'profile', 'digestLanguage')
  if (locale) result.locale = locale

  const receiveEmails = deriveBoolean(modal, 'notifications', 'channels', 'channelEmail')
  if (receiveEmails !== undefined) result.receiveEmails = receiveEmails

  const receiveSms = deriveBoolean(modal, 'notifications', 'channels', 'channelSms')
  if (receiveSms !== undefined) result.receiveSms = receiveSms

  const twoFactor = deriveBoolean(modal, 'security', 'auth', 'mfa')
  if (twoFactor !== undefined) result.twoFactorEnabled = twoFactor

  const density = deriveDensity(modal, result.density)
  if (density) result.density = density

  const themePreference = deriveThemePreference(modal, result.themePreference)
  if (themePreference) result.themePreference = themePreference

  const landingPreference = deriveLandingPreference(modal, result.landingPreference)
  if (landingPreference) result.landingPreference = landingPreference

  return result
}

function normalizeUserSettings(raw: UserSettings): UserSettings {
  const modal = ensureModalSettings(raw.modalSettings ?? {})
  return composeUserSettings(modal, raw)
}

function normalizePersistedEntry(entry: unknown): UserSettings | null {
  if (!entry) return null
  const modal = ensureModalSettings(entry)
  const fallback = isRecord(entry) ? (entry as Partial<UserSettings>) : undefined
  if (Object.keys(modal).length === 0 && !fallback) {
    return null
  }
  return composeUserSettings(modal, fallback)
}

function normalizeFileSchema(raw: unknown): SettingsFileSchema {
  if (!isRecord(raw)) return {}
  const result: SettingsFileSchema = {}
  Object.entries(raw).forEach(([userId, entry]) => {
    result[userId] = ensureModalSettings(entry)
  })
  return result
}

let cachedSnapshot: SettingsFileSchema | null = null

function readFileSnapshot(): SettingsFileSchema {
  if (cachedSnapshot) {
    return cachedSnapshot
  }

  const storage = getStorage()
  const fromStorage = parseJson<unknown>(storage?.getItem(FILE_STORAGE_KEY) ?? null)
  if (fromStorage) {
    cachedSnapshot = normalizeFileSchema(fromStorage)
    return cachedSnapshot
  }

  try {
    cachedSnapshot = normalizeFileSchema(settingsSeed as unknown)
    if (storage) {
      storage.setItem(FILE_STORAGE_KEY, JSON.stringify(cachedSnapshot))
    }
    return cachedSnapshot
  } catch {
    cachedSnapshot = {}
    return cachedSnapshot
  }
}

function writeFileSnapshot(next: SettingsFileSchema) {
  cachedSnapshot = next
  const storage = getStorage()
  if (!storage) return
  storage.setItem(FILE_STORAGE_KEY, JSON.stringify(next))
}

export function flattenModalSettings(modalSettings?: ModalSettings): FlatModalSettings {
  const result: FlatModalSettings = {}
  if (!modalSettings) return result

  Object.entries(modalSettings).forEach(([category, groups]) => {
    if (!groups) return
    Object.entries(groups).forEach(([group, options]) => {
      if (!options) return
      Object.entries(options).forEach(([option, value]) => {
        if (value === undefined) return
        result[`${category}.${group}.${option}`] = value
      })
    })
  })

  return result
}

export function expandModalSettings(flat: FlatModalSettings): ModalSettings {
  const result: ModalSettings = {}

  Object.entries(flat).forEach(([key, value]) => {
    if (!isPrimitive(value)) return
    const segments = key.split('.')
    if (segments.length < 3) return
    const [category, group, ...rest] = segments
    const option = rest.join('.')
    if (!category || !group || !option) return

    if (!result[category]) {
      result[category] = {}
    }
    if (!result[category]![group]) {
      result[category]![group] = {}
    }
    result[category]![group]![option] = value
  })

  return result
}

export const SettingsService = {
  load(userId: string): UserSettings | null {
    const storage = getStorage()
    if (storage) {
      const stored = parseJson<unknown>(storage.getItem(storageKey(userId)))
      const normalized = normalizePersistedEntry(stored)
      if (normalized) {
        return normalized
      }
    }

    const fileState = readFileSnapshot()
    const candidate = fileState[userId] ?? fileState.default ?? null
    if (!candidate) return null
    return composeUserSettings(candidate)
  },

  save(userId: string, settings: UserSettings): void {
    const storage = getStorage()
    const sanitized = normalizeUserSettings(settings)
    const document = sanitized.modalSettings ?? {}

    if (storage) {
      storage.setItem(storageKey(userId), JSON.stringify(document))
    }

    const fileState = readFileSnapshot()
    const nextState: SettingsFileSchema = {
      ...fileState,
      [userId]: clone(document),
    }
    writeFileSnapshot(nextState)
  },

  clear(userId: string): void {
    const storage = getStorage()
    if (storage) {
      storage.removeItem(storageKey(userId))
    }

    const fileState = readFileSnapshot()
    if (fileState[userId]) {
      const nextState = { ...fileState }
      delete nextState[userId]
      writeFileSnapshot(nextState)
    }
  },
}
