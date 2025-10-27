import { Box, Paper, Stack, Typography, type Theme } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import LaunchIcon from '@mui/icons-material/Launch'

interface NavigationItem {
  key: string
  label: string
  caption: string
  to: string
}

interface NavigationCardProps {
  title: string
  navShortcuts: NavigationItem[]
}

export function NavigationCard({ title, navShortcuts }: NavigationCardProps) {
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="subtitle2" color="text.secondary">
        {title}
      </Typography>
      <Stack spacing={1.5} sx={{ mt: 2 }}>
        {navShortcuts.map((item) => (
          <Paper
            key={item.key}
            variant="outlined"
            component={RouterLink}
            to={item.to}
            sx={{
              p: 1.5,
              borderRadius: 2,
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textDecoration: 'none',
              color: 'inherit',
              transition: (theme: Theme) =>
                theme.transitions.create(['transform', 'box-shadow'], {
                  duration: theme.transitions.duration.shortest,
                }),
              '&:hover': {
                transform: 'translateX(4px)',
                boxShadow: (theme: Theme) => theme.shadows[3],
                borderColor: (theme: Theme) => theme.palette.primary.light,
                backgroundColor: (theme: Theme) => theme.palette.action.hover,
              },
            }}
          >
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {item.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.caption}
              </Typography>
            </Box>
            <LaunchIcon color="action" fontSize="small" />
          </Paper>
        ))}
      </Stack>
    </Paper>
  )
}
