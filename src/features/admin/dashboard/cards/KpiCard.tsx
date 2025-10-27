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
  Stack,
} from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import type { ReactNode } from 'react'

type KpiItem = {
  label: string
  value: string
  delta: string
  sublabel: string
  icon: ReactNode
  accent: string
}

interface KpiCardProps {
  kpiData: KpiItem[]
  title: string
}

export function KpiCard({ kpiData, title }: KpiCardProps) {
  return (
    <>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
        {title}
      </Typography>
      <List dense>
        {kpiData.map((kpi, index) => (
          <Fragment key={kpi.label}>
            <ListItem disableGutters sx={{ alignItems: 'center' }}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: kpi.accent, color: 'common.white' }}>{kpi.icon}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="subtitle2" component="span">
                    {kpi.value}
                  </Typography>
                }
                secondary={
                  <Stack spacing={0.25}>
                    <Typography variant="caption" color="text.secondary">
                      {kpi.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {kpi.sublabel}
                    </Typography>
                  </Stack>
                }
                slotProps={{ secondary: { component: 'div' } }}
              />
              <Chip
                size="small"
                color="success"
                variant="outlined"
                label={kpi.delta}
                icon={<TrendingUpIcon fontSize="small" />}
                sx={{ '& .MuiChip-icon': { color: 'success.main' } }}
              />
            </ListItem>
            {index === kpiData.length - 1 ? null : <Divider sx={{ my: 1 }} />}
          </Fragment>
        ))}
      </List>
    </>
  )
}
