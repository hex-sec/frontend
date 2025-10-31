import { Paper, Typography, Stack, Box, Chip, Avatar, Button } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import PersonIcon from '@mui/icons-material/Person'
import HomeIcon from '@mui/icons-material/Home'
import type { AccessEvent } from '@features/shared/types/access.types'

interface AccessResultCardProps {
  data: AccessEvent
  onAllow?: () => void
  onDeny?: () => void
  showActions?: boolean
}

/**
 * Access Result Card - Displays access check result
 * Shows person info, permissions, unit, and allow/deny actions if applicable
 */
export function AccessResultCard({
  data,
  onAllow,
  onDeny,
  showActions = false,
}: AccessResultCardProps) {
  const isAllowed = data.result === 'allowed'
  const isEntry = data.direction === 'in'

  return (
    <Paper
      sx={{
        p: 3,
        border: 2,
        borderColor: isAllowed ? 'success.main' : 'error.main',
        bgcolor: isAllowed ? 'success.light' : 'error.light',
      }}
    >
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isAllowed ? (
            <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main' }} />
          ) : (
            <CancelIcon sx={{ fontSize: 48, color: 'error.main' }} />
          )}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">
              {isAllowed ? 'Acceso Permitido' : 'Acceso Denegado'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isEntry ? 'Entrada' : 'Salida'} • {data.medium.toUpperCase()}
            </Typography>
          </Box>
          <Chip
            label={data.result.toUpperCase()}
            color={isAllowed ? 'success' : 'error'}
            variant="filled"
          />
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            src={data.person.avatarUrl}
            sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}
          >
            {data.person.avatarUrl ? null : <PersonIcon sx={{ fontSize: 32 }} />}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {data.person.name}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
              <Chip label={data.person.type} size="small" variant="outlined" />
              {data.person.unit && (
                <>
                  <HomeIcon fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    {data.person.unit}
                  </Typography>
                </>
              )}
            </Stack>
          </Box>
        </Stack>

        {data.reason && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Razón:
            </Typography>
            <Typography variant="body2">{data.reason}</Typography>
          </Box>
        )}

        {data.evidenceUrl && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Evidencia:
            </Typography>
            <Box
              component="img"
              src={data.evidenceUrl}
              alt="Evidence"
              sx={{
                width: '100%',
                maxHeight: 200,
                objectFit: 'contain',
                borderRadius: 1,
                mt: 1,
              }}
            />
          </Box>
        )}

        {showActions && (
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="success"
              fullWidth
              onClick={onAllow}
              disabled={isAllowed}
            >
              Permitir
            </Button>
            <Button
              variant="contained"
              color="error"
              fullWidth
              onClick={onDeny}
              disabled={!isAllowed}
            >
              Denegar
            </Button>
          </Stack>
        )}

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          {new Date(data.at).toLocaleString()}
        </Typography>
      </Stack>
    </Paper>
  )
}
