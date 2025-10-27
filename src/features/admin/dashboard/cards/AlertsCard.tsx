import { Typography, Button, Stack, Box } from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

type AlertCard = {
  key: string
  borderColor: 'warning.light' | 'error.light' | 'info.light'
  title: string
  description: string
  actionLabel: string
  actionColor: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
}

interface AlertsCardProps {
  alertCards: AlertCard[]
  title: string
  ctaLabel: string
}

export function AlertsCard({ alertCards, title, ctaLabel }: AlertsCardProps) {
  return (
    <>
      <Typography
        variant="subtitle1"
        fontWeight={600}
        sx={{ mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        {title}
        <Button size="small" endIcon={<ArrowForwardIcon fontSize="small" />}>
          {ctaLabel}
        </Button>
      </Typography>
      <Stack spacing={1.5}>
        {alertCards.map((card) => (
          <Stack
            key={card.key}
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'stretch', sm: 'flex-start' }}
            sx={{
              borderRadius: 2,
              border: '1px dashed',
              borderColor: card.borderColor,
              p: 1.5,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                {card.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {card.description}
              </Typography>
            </Box>
            <Button
              size="small"
              color={card.actionColor}
              sx={{ alignSelf: { xs: 'flex-end', sm: 'flex-start' }, px: 1.5 }}
            >
              {card.actionLabel}
            </Button>
          </Stack>
        ))}
      </Stack>
    </>
  )
}
