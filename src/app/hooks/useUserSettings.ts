import { useCallback } from 'react'
import { useAuthStore } from '@app/auth/auth.store'
import { useThemeStore } from '@store/theme.store'
import type { ThemeKind } from '@app/theme.types'

type UserSettings = {
  // grouped settings for upcoming features
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

const storageKey = (userId: string) => `user.settings.${userId}`

export function useUserSettings() {
  const user = useAuthStore((s) => s.user)
  const setKind = useThemeStore((s) => s.setKind)

  const load = useCallback((): UserSettings | null => {
    if (!user?.id) return null
    try {
      const raw = localStorage.getItem(storageKey(user.id))
      return raw ? (JSON.parse(raw) as UserSettings) : { locale: 'en', receiveEmails: true }
    } catch (e) {
      console.error('Failed to load user settings', e)
      return null
    }
  }, [user])

  const save = useCallback(
    (settings: UserSettings) => {
      if (!user?.id) return
      try {
        localStorage.setItem(storageKey(user.id), JSON.stringify(settings))
        // If the user saved a theme preference, apply it to the global theme store so the change is immediate
        if (settings.themePreference) {
          try {
            setKind(settings.themePreference as ThemeKind)
          } catch (e) {
            // non-fatal: log and continue
            console.warn('Failed to apply theme preference to global store', e)
          }
        }
      } catch (e) {
        console.error('Failed to save user settings', e)
      }
    },
    [user],
  )

  const clear = useCallback(() => {
    if (!user?.id) return
    localStorage.removeItem(storageKey(user.id))
  }, [user])

  return { load, save, clear }
}
