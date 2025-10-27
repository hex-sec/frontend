import { Box, Button, Chip, Divider, Menu, MenuList, Typography } from '@mui/material'
import type { ButtonProps } from '@mui/material/Button'

export interface Notification {
  id: string
  type: 'incident' | 'visitor' | 'announcement'
  title: string
  message: string
  timestamp: string
  siteSlug?: string
}

export interface NotificationAction {
  label: string
  variant?: ButtonProps['variant']
  color?: ButtonProps['color']
  onClick: () => void
}

interface NotificationsMenuProps {
  anchorEl: HTMLElement | null
  open: boolean
  onClose: () => void
  menuTitle: string
  unreadCount: number
  notifications: Notification[]
  onMarkAllRead: () => void
  emptyMessage: string
  getActionsForNotification: (notification: Notification) => NotificationAction[]
}

export function NotificationsMenu({
  anchorEl,
  open,
  onClose,
  menuTitle,
  unreadCount,
  notifications,
  onMarkAllRead,
  emptyMessage,
  getActionsForNotification,
}: NotificationsMenuProps) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
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
        <Typography variant="subtitle2">{menuTitle}</Typography>
        {unreadCount > 0 ? (
          <Button size="small" color="inherit" onClick={onMarkAllRead}>
            Mark all as read
          </Button>
        ) : null}
      </Box>
      <Divider />
      {unreadCount === 0 ? (
        <Box sx={{ px: 2.5, py: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {emptyMessage}
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
            const chipLabel =
              notification.type === 'incident'
                ? 'Incident'
                : notification.type === 'visitor'
                  ? 'Visitor'
                  : 'Announcement'

            return (
              <Box key={notification.id} sx={{ px: 2.5, py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip size="small" color={chipColor} label={chipLabel} />
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
  )
}
