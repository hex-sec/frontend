import {
  Avatar,
  Box,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  type SxProps,
  type Theme,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

interface QuickAction {
  key: string
  label: string
  description: string
  icon: React.ReactNode
  href: string
}

interface QuickAccessCardProps {
  title: string
  customizeTooltip: string
  quickActions: QuickAction[]
}

const surfaceCard: SxProps<Theme> = {
  p: 2,
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
}

export function QuickAccessCard({ title, customizeTooltip, quickActions }: QuickAccessCardProps) {
  return (
    <Paper sx={{ ...surfaceCard }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        <Tooltip title={customizeTooltip}>
          <IconButton size="small" color="primary">
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      <Stack spacing={1.5} sx={{ mt: 2 }}>
        {quickActions.map((action) => (
          <Paper
            key={action.key}
            variant="outlined"
            sx={{ p: 1.5, borderRadius: 2, borderColor: 'divider' }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ bgcolor: 'primary.main', color: 'common.white' }}>{action.icon}</Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  {action.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {action.description}
                </Typography>
              </Box>
              <IconButton size="small" color="primary" href={action.href}>
                <ArrowForwardIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Paper>
  )
}
