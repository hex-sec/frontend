import { type ReactNode } from 'react'
import {
  Box,
  Button,
  Chip,
  Divider,
  Link as MLink,
  Paper,
  Stack,
  Typography,
  type ChipProps,
} from '@mui/material'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import LaunchIcon from '@mui/icons-material/Launch'
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined'
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
    <Paper
      elevation={3}
      sx={(theme) => ({
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 1, sm: 1.5 },
        height: '100%',
        border: '1px solid',
        borderColor: isCurrent ? 'primary.main' : 'divider',
        transition: theme.transitions.create(['box-shadow', 'transform'], { duration: 180 }),
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        '&:hover': {
          [theme.breakpoints.up('md')]: {
            transform: 'translateY(-3px)',
            boxShadow: theme.shadows[6],
          },
        },
      })}
    >
      <Stack spacing={{ xs: 1, sm: 1.5 }} sx={{ flexGrow: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
          <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 0, flex: 1 }}>
            <HomeOutlinedIcon fontSize="small" />
            <MLink
              component={RouterLink}
              to={href}
              underline="hover"
              color="inherit"
              sx={{ minWidth: 0 }}
            >
              <Typography
                variant="h6"
                component="span"
                sx={(theme) => ({
                  display: 'block',
                  fontWeight: 600,
                  maxWidth: { xs: 180, sm: 260, md: 300 },
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: {
                    xs: theme.typography.subtitle1.fontSize,
                    md: theme.typography.h6.fontSize,
                  },
                })}
              >
                {name}
              </Typography>
            </MLink>
          </Stack>
          <Stack direction="row" alignItems="center" gap={0.5} sx={{ flexShrink: 0 }}>
            <Chip size="small" label={statusLabel} color={statusColor} />
            {showHeaderBadge ? (
              <Chip size="small" variant="outlined" label={currentLabel} color="primary" />
            ) : null}
          </Stack>
        </Stack>

        {description ? (
          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
            sx={{ textOverflow: 'ellipsis' }}
          >
            {description}
          </Typography>
        ) : null}

        {showDetails ? (
          <Stack spacing={0.75}>
            {details.map((detail, index) => (
              <Stack
                key={`${detail.label ?? 'detail'}-${index}`}
                direction="row"
                spacing={0.75}
                justifyContent="space-between"
                alignItems="baseline"
                sx={{ minWidth: 0 }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  sx={{ textOverflow: 'ellipsis' }}
                >
                  {detail.label}
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  noWrap
                  sx={{ textAlign: 'right', textOverflow: 'ellipsis' }}
                >
                  {detail.value}
                </Typography>
              </Stack>
            ))}
          </Stack>
        ) : null}

        {showMetrics ? (
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.4 }}>
              {metricsLabel}
            </Typography>
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              {metrics.map((metric, index) => (
                <Stack
                  key={`${metric.label ?? 'metric'}-${index}`}
                  direction="row"
                  spacing={0.75}
                  alignItems="center"
                  sx={{
                    minWidth: 0,
                    maxWidth: { xs: '100%', sm: '48%' },
                  }}
                >
                  {metric.icon ? <Box sx={{ color: 'text.secondary' }}>{metric.icon}</Box> : null}
                  <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      noWrap
                      sx={{ textOverflow: 'ellipsis' }}
                    >
                      {metric.value}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      noWrap
                      sx={{ textOverflow: 'ellipsis' }}
                    >
                      {metric.label}
                    </Typography>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Stack>
        ) : null}
      </Stack>

      <Divider />

      <Stack spacing={1.25}>
        {actionsLabel ? (
          <Typography variant="caption" color="text.secondary">
            {actionsLabel}
          </Typography>
        ) : null}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1}
          alignItems={{ xs: 'stretch', md: 'center' }}
        >
          <Button
            variant="outlined"
            size="small"
            fullWidth
            startIcon={<PersonAddOutlinedIcon />}
            onClick={onInvite}
            aria-label={inviteLabel}
            sx={{ minHeight: 40 }}
          >
            {inviteLabel}
          </Button>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            startIcon={<SwapHorizOutlinedIcon />}
            onClick={onSetCurrent}
            aria-label={setCurrentLabel}
            sx={{ minHeight: 40 }}
          >
            {setCurrentLabel}
          </Button>
        </Stack>

        <Divider />

        <Box>
          <MLink
            component={RouterLink}
            to={href}
            underline="hover"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
          >
            <Typography variant="body2" fontWeight={600}>
              {viewLabel}
            </Typography>
            <LaunchIcon fontSize="small" />
          </MLink>
        </Box>
      </Stack>
    </Paper>
  )
}
