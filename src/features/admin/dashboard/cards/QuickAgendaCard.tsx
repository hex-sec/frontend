import {
  Avatar,
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Typography,
  type SxProps,
  type Theme,
} from '@mui/material'

interface AgendaItem {
  key: string
  icon: React.ReactNode
  primary: string
  secondary: string
}

interface QuickAgendaCardProps {
  title: string
  todayLabel: string
  agendaItems: AgendaItem[]
}

const surfaceCard: SxProps<Theme> = {
  p: 2,
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
}

export function QuickAgendaCard({ title, todayLabel, agendaItems }: QuickAgendaCardProps) {
  return (
    <Paper sx={{ ...surfaceCard }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        <Chip size="small" label={todayLabel} color="primary" />
      </Stack>
      <List dense sx={{ mt: 1 }}>
        {agendaItems.map((item, index) => (
          <Box key={item.key} component="li" sx={{ listStyle: 'none' }}>
            <ListItem disableGutters>
              <ListItemAvatar>
                <Avatar>{item.icon}</Avatar>
              </ListItemAvatar>
              <ListItemText primary={item.primary} secondary={item.secondary} />
            </ListItem>
            {index === agendaItems.length - 1 ? null : <Divider flexItem component="div" />}
          </Box>
        ))}
      </List>
    </Paper>
  )
}
