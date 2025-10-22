import { useCallback, useMemo } from 'react'
import { useTranslate } from '@i18n/useTranslate'
import { useI18nStore } from '@store/i18n.store'

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY

export function useLastActiveFormatter() {
  const { t } = useTranslate()
  const language = useI18nStore((state) => state.language)

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(language, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    [language],
  )

  return useCallback(
    (timestamp: number | null | undefined) => {
      if (typeof timestamp !== 'number' || Number.isNaN(timestamp) || timestamp < 0) {
        return t('usersPage.lastActive.relative.unknown', {
          lng: language,
          defaultValue: 'Not available',
        })
      }

      const now = Date.now()
      const diffMs = now - timestamp

      if (diffMs < 0) {
        console.warn(
          `[useLastActiveFormatter] Timestamp (${timestamp}) is in the future compared to now (${now}). Possible clock sync issue or invalid data.`,
        )
        const formattedDate = dateFormatter.format(new Date(timestamp))
        return t('usersPage.lastActive.relative.date', {
          lng: language,
          value: formattedDate,
          defaultValue: formattedDate,
        })
      }

      if (diffMs < HOUR) {
        const minutes = Math.round(diffMs / MINUTE)
        return t('usersPage.lastActive.relative.minutes', {
          lng: language,
          count: minutes,
          defaultValue: minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`,
        })
      }

      if (diffMs < DAY) {
        const hours = Math.round(diffMs / HOUR)
        return t('usersPage.lastActive.relative.hours', {
          lng: language,
          count: hours,
          defaultValue: hours === 1 ? '1 hour ago' : `${hours} hours ago`,
        })
      }

      if (diffMs < WEEK) {
        const days = Math.round(diffMs / DAY)
        return t('usersPage.lastActive.relative.days', {
          lng: language,
          count: days,
          defaultValue: days === 1 ? '1 day ago' : `${days} days ago`,
        })
      }

      const formattedDate = dateFormatter.format(new Date(timestamp))
      return t('usersPage.lastActive.relative.date', {
        lng: language,
        value: formattedDate,
        defaultValue: formattedDate,
      })
    },
    [dateFormatter, language, t],
  )
}
