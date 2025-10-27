import { Fragment } from 'react'
import {
  Box,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  MenuList,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import EventIcon from '@mui/icons-material/Event'
import { CalendarGrid } from './CalendarGrid'

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

interface CalendarEvent {
  date: Date
  type: 'arrival' | 'event'
  time: string
  title: string
  location: string
  site: string
}

interface CalendarMenuProps {
  anchorEl: HTMLElement | null
  open: boolean
  onClose: () => void
  title: string
  selectedDate: Date
  onDateChange: (date: Date) => void
  selectedDateEvents: CalendarEvent[]
  allEvents: CalendarEvent[]
  language: string
  noEventsMessage: string
}

export function CalendarMenu({
  anchorEl,
  open,
  onClose,
  title,
  selectedDate,
  onDateChange,
  selectedDateEvents,
  allEvents,
  language,
  noEventsMessage,
}: CalendarMenuProps) {
  const handleMonthChange = (delta: number) => {
    const newDate = new Date(selectedDate)
    newDate.setMonth(newDate.getMonth() + delta)
    onDateChange(newDate)
  }

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
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
          {title}
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
              <IconButton size="small" onClick={() => handleMonthChange(-1)}>
                <ChevronLeftIcon />
              </IconButton>
              <Typography variant="subtitle1" fontWeight={600}>
                {selectedDate.toLocaleDateString(getLocaleFromLanguage(language), {
                  month: 'long',
                  year: 'numeric',
                })}
              </Typography>
              <IconButton size="small" onClick={() => handleMonthChange(1)}>
                <ChevronRightIcon />
              </IconButton>
            </Stack>
            <CalendarGrid
              currentDate={selectedDate}
              events={allEvents}
              onDateSelect={onDateChange}
              language={language}
            />
          </Stack>
        </Paper>

        {/* Events List */}
        <Box sx={{ flex: 1, maxHeight: { xs: 'auto', sm: 450 }, overflow: 'auto' }}>
          {selectedDateEvents.length === 0 ? (
            <Box sx={{ px: 2.5, py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                {noEventsMessage}
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
  )
}
