import { Fragment } from 'react'
import {
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Divider,
} from '@mui/material'
import type { ReactNode } from 'react'
import type { SxProps, Theme } from '@mui/material'

type TimelineItem = {
  key: string
  avatarSx: SxProps<Theme>
  icon: ReactNode
  primary: string
  secondary: string
  chipLabel: string
  chipColor: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
}

interface TimelineCardProps {
  timelineItems: TimelineItem[]
  title: string
}

export function TimelineCard({ timelineItems, title }: TimelineCardProps) {
  return (
    <>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
        {title}
      </Typography>
      <List dense>
        {timelineItems.map((item, index) => (
          <Fragment key={item.key}>
            <ListItem disableGutters>
              <ListItemAvatar>
                <Avatar sx={item.avatarSx}>{item.icon}</Avatar>
              </ListItemAvatar>
              <ListItemText primary={item.primary} secondary={item.secondary} />
              <Chip size="small" color={item.chipColor} label={item.chipLabel} />
            </ListItem>
            {index === timelineItems.length - 1 ? null : <Divider sx={{ my: 1 }} />}
          </Fragment>
        ))}
      </List>
    </>
  )
}
