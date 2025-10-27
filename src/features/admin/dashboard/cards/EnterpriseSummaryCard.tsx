import { Box, Paper, Stack, Typography, type SxProps, type Theme } from '@mui/material'

interface EnterpriseSummaryCardProps {
  activeSites: number
  totalResidents: string
  mrr: string
  arr: string
  onActiveSitesClick?: () => void
  onTotalResidentsClick?: () => void
  onMrrClick?: () => void
  onArrClick?: () => void
  isDesktop?: boolean
}

const surfaceCard: SxProps<Theme> = {
  p: 2,
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
}

export function EnterpriseSummaryCard({
  activeSites,
  totalResidents,
  mrr,
  arr,
  isDesktop = false,
}: EnterpriseSummaryCardProps) {
  const isTablet = !isDesktop

  return (
    <Paper
      sx={{
        ...surfaceCard,
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
            : `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
        color: 'primary.contrastText',
      }}
    >
      <Stack spacing={1}>
        <Typography variant="subtitle2" color="inherit" sx={{ opacity: 0.9 }}>
          Enterprise Overview
        </Typography>
        {isTablet ? (
          <Stack direction="row" spacing={4} sx={{ mt: 1, flexWrap: 'wrap' }}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography variant="h5" fontWeight={600} color="inherit">
                  {activeSites}
                </Typography>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: 'success.light',
                  }}
                />
              </Stack>
              <Typography variant="caption" color="inherit" sx={{ opacity: 0.8 }}>
                Active Sites
              </Typography>
            </Box>
            <Box>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography variant="h5" fontWeight={600} color="inherit">
                  {totalResidents}
                </Typography>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: 'info.light',
                  }}
                />
              </Stack>
              <Typography variant="caption" color="inherit" sx={{ opacity: 0.8 }}>
                Total Residents
              </Typography>
            </Box>
            <Box>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography variant="h5" fontWeight={600} color="inherit">
                  {mrr}
                </Typography>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: 'warning.light',
                  }}
                />
              </Stack>
              <Typography variant="caption" color="inherit" sx={{ opacity: 0.8 }}>
                MRR
              </Typography>
            </Box>
            <Box>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography variant="h5" fontWeight={600} color="inherit">
                  {arr}
                </Typography>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: 'error.light',
                  }}
                />
              </Stack>
              <Typography variant="caption" color="inherit" sx={{ opacity: 0.8 }}>
                ARR (Projected)
              </Typography>
            </Box>
          </Stack>
        ) : (
          <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
            <Box>
              <Typography variant="h5" fontWeight={600} color="inherit">
                {activeSites}
              </Typography>
              <Typography variant="caption" color="inherit" sx={{ opacity: 0.8 }}>
                Active Sites
              </Typography>
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={600} color="inherit">
                {totalResidents}
              </Typography>
              <Typography variant="caption" color="inherit" sx={{ opacity: 0.8 }}>
                Total Residents
              </Typography>
            </Box>
          </Stack>
        )}
      </Stack>
    </Paper>
  )
}
