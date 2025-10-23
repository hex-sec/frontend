import { type ReactNode } from 'react'
import {
  alpha,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  Grid,
  Link as MLink,
  Stack,
  Typography,
  type ChipProps,
} from '@mui/material'
import LaunchIcon from '@mui/icons-material/Launch'
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt'
import { Link as RouterLink } from 'react-router-dom'

export type SiteCardDetail = {
  label: string
  value: string
}

export type SiteCardMetric = {
  label: string
  value: string
  icon?: ReactNode
}

type SiteCardProps = {
  name: string
  href: string
  statusLabel: string
  statusColor?: ChipProps['color']
  isCurrent?: boolean
  currentLabel?: string
  description?: string
  details?: SiteCardDetail[]
  metrics?: SiteCardMetric[]
  metricsLabel?: string
  actionsLabel?: string
  viewLabel: string
  inviteLabel: string
  setCurrentLabel: string
  onInvite: () => void
  onSetCurrent: () => void
}

export default function SiteCard({
  name,
  href,
  statusLabel,
  statusColor = 'default',
  isCurrent,
  currentLabel,
  description,
  details = [],
  metrics = [],
  metricsLabel = 'Key metrics',
  actionsLabel,
  viewLabel,
  inviteLabel,
  setCurrentLabel,
  onInvite,
  onSetCurrent,
}: SiteCardProps) {
  const showHeaderBadge = Boolean(isCurrent && currentLabel)
  const showDetails = details.length > 0
  const showMetrics = metrics.length > 0

  return (
    <Card
      variant="outlined"
      sx={(muiTheme) => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderColor: isCurrent ? muiTheme.palette.primary.main : muiTheme.palette.divider,
        boxShadow: isCurrent
          ? `0 0 0 1px ${alpha(muiTheme.palette.primary.main, 0.24)}, 0 10px 24px ${alpha(
              muiTheme.palette.primary.main,
              0.14,
            )}`
          : 'none',
        backgroundImage:
          muiTheme.palette.mode === 'light'
            ? 'radial-gradient(circle at top, rgba(25,118,210,0.06), transparent 55%)'
            : 'radial-gradient(circle at top, rgba(144,202,249,0.12), transparent 55%)',
        transition: muiTheme.transitions.create(['transform', 'box-shadow'], {
          duration: muiTheme.transitions.duration.short,
        }),
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: isCurrent
            ? `0 0 0 1px ${alpha(muiTheme.palette.primary.main, 0.24)}, 0 14px 32px ${alpha(
                muiTheme.palette.primary.main,
                0.2,
              )}`
            : muiTheme.shadows[4],
        },
      })}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Stack spacing={1.5}>
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            spacing={1.5}
          >
            <Stack spacing={0.5} sx={{ minWidth: 0 }}>
              <MLink
                component={RouterLink}
                to={href}
                underline="hover"
                color="inherit"
                variant="h6"
                sx={{ fontWeight: 600, lineHeight: 1.2 }}
              >
                {name}
              </MLink>
              {description ? (
                <Typography variant="body2" color="text.secondary">
                  {description}
                </Typography>
              ) : null}
            </Stack>
            <Stack spacing={0.5} alignItems="flex-end">
              <Chip size="small" label={statusLabel} color={statusColor} />
              {showHeaderBadge ? (
                <Chip size="small" variant="outlined" label={currentLabel} />
              ) : null}
            </Stack>
          </Stack>

          {showDetails ? (
            <Stack spacing={0.75}>
              {details.map((detail) => (
                <Stack
                  key={`${detail.label}-${detail.value}`}
                  direction="row"
                  spacing={1}
                  justifyContent="space-between"
                  alignItems="baseline"
                >
                  <Typography variant="caption" color="text.secondary">
                    {detail.label}
                  </Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ textAlign: 'right' }}>
                    {detail.value}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          ) : null}

          {showMetrics ? (
            <Box>
              <Typography
                variant="overline"
                component="div"
                color="text.secondary"
                sx={{ letterSpacing: 0.5 }}
              >
                {metricsLabel}
              </Typography>
              <Grid container spacing={1.5} columns={12} sx={{ mt: 0.5 }}>
                {metrics.map((metric) => (
                  <Grid item xs={6} key={`${metric.label}-${metric.value}`}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {metric.icon ? (
                        <Box sx={{ color: 'text.secondary' }}>{metric.icon}</Box>
                      ) : null}
                      <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                        <Typography variant="body1" fontWeight={600} noWrap>
                          {metric.value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {metric.label}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : null}
        </Stack>
      </CardContent>
      <Divider sx={{ borderStyle: 'dashed', mx: 3 }} />
      <CardActions sx={{ px: 3, pb: 3 }}>
        <Stack spacing={1.5} sx={{ width: '100%' }}>
          {actionsLabel ? (
            <Typography variant="caption" color="text.secondary">
              {actionsLabel}
            </Typography>
          ) : null}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <Button variant="outlined" startIcon={<PersonAddAltIcon />} onClick={onInvite}>
              {inviteLabel}
            </Button>
            <Button variant="outlined" onClick={onSetCurrent}>
              {setCurrentLabel}
            </Button>
          </Stack>
          <MLink
            component={RouterLink}
            to={href}
            underline="hover"
            color="primary"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontWeight: 500 }}
          >
            {viewLabel}
            <LaunchIcon fontSize="small" sx={{ fontSize: 16 }} />
          </MLink>
        </Stack>
      </CardActions>
    </Card>
  )
}
