import { useCallback } from 'react'
import { useAuthStore } from '@app/auth/auth.store'
import { useThemeStore } from '@store/theme.store'
import type { ThemeKind } from '@app/theme.types'
import { SettingsService, type UserSettings } from '@services/settings.service'

export type { UserSettings } from '@services/settings.service'

export function useUserSettings() {
  const user = useAuthStore((s) => s.user)
  const setKind = useThemeStore((s) => s.setKind)

  const load = useCallback((): UserSettings | null => {
    if (!user?.id) return null
    try {
      return SettingsService.load(user.id)
    } catch (e) {
      console.error('Failed to load user settings', e)
      return null
    }
  }, [user])

  const save = useCallback(
    (settings: UserSettings) => {
      if (!user?.id) return
      try {
        SettingsService.save(user.id, settings)
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
    [user, setKind],
  )

  const clear = useCallback(() => {
    if (!user?.id) return
    SettingsService.clear(user.id)
  }, [user])

  return { load, save, clear }
}
