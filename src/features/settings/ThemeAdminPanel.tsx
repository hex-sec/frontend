import React, { useMemo } from 'react'
import {
  Box,
  Stack,
  Typography,
  TextField,
  MenuItem,
  Paper,
  Divider,
  Grid2 as Grid,
} from '@mui/material'
import { useThemeStore } from '@store/theme.store'

function Swatch({ color, label }: { color: string; label: string }): JSX.Element {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          width: 32,
          height: 24,
          borderRadius: 1,
          bgcolor: color,
          border: '1px solid rgba(0,0,0,0.12)',
        }}
      />
      <Typography variant="caption">{label}</Typography>
    </Box>
  )
}

const EMPTY_STATE = (
  <Paper sx={{ p: 3 }} elevation={0}>
    <Typography variant="subtitle1">No hay temas disponibles</Typography>
    <Typography variant="body2" color="text.secondary">
      Agrega presets en src/assets/themes.json o recarga la página si recién los añadiste.
    </Typography>
  </Paper>
)

export default function ThemeAdminPanel(): JSX.Element {
  const { presets, currentId, setCurrent } = useThemeStore((state) => ({
    presets: state.presets,
    currentId: state.currentId,
    setCurrent: state.setCurrent,
  }))

  const groupedPresets = useMemo(() => {
    const light = presets.filter((preset) => preset.palette.mode !== 'dark')
    const dark = presets.filter((preset) => preset.palette.mode === 'dark')
    return [
      { key: 'light', label: 'Temas claros', items: light },
      { key: 'dark', label: 'Temas oscuros', items: dark },
    ].filter((group) => group.items.length > 0)
  }, [presets])

  const activePreset = useMemo(
    () => presets.find((preset) => preset.id === currentId),
    [presets, currentId],
  )

  if (!presets.length) {
    return EMPTY_STATE
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 640 }}>
      <Box>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          Tema de la organización
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Selecciona una paleta aprobada para todos los módulos administrativos.
        </Typography>
      </Box>

      <TextField
        select
        label="Seleccionar tema"
        value={currentId}
        onChange={(event) => setCurrent(event.target.value)}
      >
        {groupedPresets.flatMap((group) =>
          group.items.map((preset) => (
            <MenuItem key={preset.id} value={preset.id}>
              {preset.label}
            </MenuItem>
          )),
        )}
      </TextField>

      {activePreset ? (
        <Paper sx={{ p: 3 }} elevation={0}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Vista previa
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Swatch color={activePreset.palette.primary.main} label="Primary" />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Swatch color={activePreset.palette.secondary.main} label="Secondary" />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Swatch color={activePreset.palette.background.default} label="Background" />
            </Grid>
            {activePreset.palette.success ? (
              <Grid size={{ xs: 12, sm: 4 }}>
                <Swatch color={activePreset.palette.success.main} label="Success" />
              </Grid>
            ) : null}
            {activePreset.palette.warning ? (
              <Grid size={{ xs: 12, sm: 4 }}>
                <Swatch color={activePreset.palette.warning.main} label="Warning" />
              </Grid>
            ) : null}
            {activePreset.palette.error ? (
              <Grid size={{ xs: 12, sm: 4 }}>
                <Swatch color={activePreset.palette.error.main} label="Error" />
              </Grid>
            ) : null}
          </Grid>

          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 2,
              bgcolor: activePreset.palette.background.paper,
              border: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: activePreset.palette.text?.primary ?? 'inherit' }}
            >
              {activePreset.label}
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 1, color: activePreset.palette.text?.secondary ?? 'inherit' }}
            >
              {activePreset.palette.mode === 'dark'
                ? 'Este tema emplea un modo oscuro balanceado para salas con iluminación baja.'
                : 'Este tema mantiene fondos claros y contraste alto para espacios luminosos.'}
            </Typography>
          </Box>
        </Paper>
      ) : null}
    </Stack>
  )
}
