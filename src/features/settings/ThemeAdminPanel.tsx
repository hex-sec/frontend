import { Stack, TextField, Button, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useState } from 'react'
import { useThemeStore } from '@store/theme.store'

export default function ThemeAdminPanel() {
  const { setKind, setBrand } = useThemeStore()
  const [primary, setPrimary] = useState('#0D47A1')
  const [secondary, setSecondary] = useState('#FFC107')

  return (
    <Stack gap={2} maxWidth={480}>
      <ToggleButtonGroup exclusive onChange={(_, v) => v && setKind(v)} size="small">
        <ToggleButton value="light">Light</ToggleButton>
        <ToggleButton value="dark">Dark</ToggleButton>
        <ToggleButton value="high-contrast">B/N Alto</ToggleButton>
        <ToggleButton value="brand">Brand</ToggleButton>
      </ToggleButtonGroup>

      <TextField label="Primario" value={primary} onChange={(e) => setPrimary(e.target.value)} />
      <TextField
        label="Secundario"
        value={secondary}
        onChange={(e) => setSecondary(e.target.value)}
      />

      <Button
        variant="contained"
        onClick={() =>
          setBrand({
            name: 'Mi Empresa',
            primary,
            secondary,
            contrastMode: 'normal',
            borderRadius: 8,
          })
        }
      >
        Guardar tema Brand
      </Button>
    </Stack>
  )
}
