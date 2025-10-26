import { type ReactNode } from 'react'
import { Box, Stack, Typography, Chip, useMediaQuery, useTheme } from '@mui/material'

type PageHeaderProps = {
  title: string
  mobileTitle?: string
  subtitle?: string
  badges?: Array<{
    label: string
    color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
    variant?: 'filled' | 'outlined'
  }>
  rightActions?: ReactNode
  mobileBackButton?: ReactNode
  mobileActions?: ReactNode
  description?: string
  avatar?: ReactNode
}

export default function PageHeader({
  title,
  mobileTitle,
  subtitle,
  badges = [],
  rightActions,
  mobileBackButton,
  mobileActions,
  description,
  avatar,
}: PageHeaderProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Box sx={{ position: 'relative', mb: isMobile ? 1 : 2 }}>
      {/* Mobile buttons positioned absolutely in top-right */}
      {isMobile && (mobileActions || mobileBackButton) && (
        <Box
          sx={{
            position: 'absolute',
            top: isMobile ? 0 : 0,
            right: 0,
            display: 'flex',
            flexDirection: 'row',
            gap: 0.5,
            alignItems: 'flex-start',
            zIndex: 1,
            minWidth: 'auto',
            width: 'auto',
          }}
        >
          {mobileActions ? <Box>{mobileActions}</Box> : null}
          {mobileActions && mobileBackButton ? (
            <Box sx={{ width: '1px', height: '24px', bgcolor: 'divider', mx: 0.5 }} />
          ) : null}
          {mobileBackButton ? <Box>{mobileBackButton}</Box> : null}
        </Box>
      )}

      <Stack
        direction={{ xs: 'row', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={1.5}
      >
        {/* Avatar for desktop */}
        {avatar && <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexShrink: 0 }}>{avatar}</Box>}

        {/* Left side: title, badges, and subtitle */}
        <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
          {/* On mobile: title and badges stack vertically */}
          <Stack spacing={0.75}>
            <Typography
              variant={isMobile ? 'h6' : 'h5'}
              fontWeight={600}
              sx={{
                overflow: 'hidden',
                textOverflow:
                  isMobile && (mobileActions || mobileBackButton) ? 'ellipsis' : 'ellipsis',
                whiteSpace: isMobile && (mobileActions || mobileBackButton) ? 'normal' : 'nowrap',
                wordBreak:
                  isMobile && (mobileActions || mobileBackButton) ? 'break-word' : 'normal',
                overflowWrap: 'break-word',
                flex: 1,
                minWidth: 0,
                pr: isMobile && (mobileActions || mobileBackButton) ? 8 : 0,
                maxWidth:
                  isMobile && (mobileActions || mobileBackButton) ? 'calc(100% - 80px)' : '100%',
              }}
            >
              {isMobile && mobileTitle ? mobileTitle : title}
            </Typography>

            {badges.length > 0 && (
              <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" gap={0.5}>
                {badges.map((badge, index) => (
                  <Chip
                    key={index}
                    size="small"
                    label={badge.label}
                    color={badge.color ?? 'default'}
                    variant={badge.variant ?? 'filled'}
                  />
                ))}
              </Stack>
            )}
          </Stack>

          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}

          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
        </Stack>

        {/* Right side: action buttons for desktop */}
        {rightActions && (
          <Box sx={{ flexShrink: 0, display: { xs: 'none', sm: 'block' } }}>{rightActions}</Box>
        )}
      </Stack>
    </Box>
  )
}
