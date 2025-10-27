import { useMemo } from 'react'
import { alpha, Box, Stack, Typography } from '@mui/material'

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

interface CalendarGridProps {
  currentDate: Date
  events: Array<{ date: Date; time: string; title: string }>
  onDateSelect: (date: Date) => void
  language?: string
}

export function CalendarGrid({
  currentDate,
  events,
  onDateSelect,
  language = 'en',
}: CalendarGridProps) {
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
