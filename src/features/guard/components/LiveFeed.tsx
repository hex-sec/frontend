import { Box, Typography, List, ListItem, Chip, Avatar, Stack, Paper, Divider } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import type { AccessEvent } from '@features/shared/types/access.types'
import { TableRowSkeleton } from '@features/shared/components/LoadingSkeleton'

interface LiveFeedProps {
  items: AccessEvent[]
  title?: string
  maxHeight?: number
  isLoading?: boolean
}

/**
 * Live Feed Component - Displays recent access events
 */
export function LiveFeed({
  items,
  title = 'Actividad Reciente',
  maxHeight = 400,
  isLoading = false,
}: LiveFeedProps) {
  if (isLoading) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
          {title}
        </Typography>
        <TableRowSkeleton count={5} />
      </Paper>
    )
  }

  if (!items || items.length === 0) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No hay eventos recientes
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Box
        sx={{
          maxHeight,
          overflowY: 'auto',
        }}
      >
        <List disablePadding>
          {items.length === 0 ? (
            <ListItem>
              <Typography variant="body2" color="text.secondary">
                No hay eventos recientes
              </Typography>
            </ListItem>
          ) : (
            items.map((item, index) => {
              const isAllowed = item.result === 'allowed'
              const isEntry = item.direction === 'in'

              return (
                <Box key={item.id}>
                  <ListItem
                    disablePadding
                    sx={{
                      py: 1.5,
                      px: 1,
                      '&:hover': {
                        bgcolor: 'action.hover',
                        borderRadius: 1,
                      },
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                      <Avatar
                        src={item.person.avatarUrl}
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: isAllowed ? 'success.main' : 'error.main',
                        }}
                      >
                        {item.person.avatarUrl ? null : <PersonIcon />}
                      </Avatar>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {item.person.name}
                          </Typography>
                          {isEntry ? (
                            <LoginIcon fontSize="small" color="action" />
                          ) : (
                            <LogoutIcon fontSize="small" color="action" />
                          )}
                          <Chip
                            label={item.result}
                            size="small"
                            color={isAllowed ? 'success' : 'error'}
                            variant="outlined"
                          />
                        </Stack>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {item.person.unit && `${item.person.unit} • `}
                          {item.medium.toUpperCase()} • {new Date(item.at).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    </Stack>
                  </ListItem>
                  {index < items.length - 1 && <Divider />}
                </Box>
              )
            })
          )}
        </List>
      </Box>
    </Paper>
  )
}
