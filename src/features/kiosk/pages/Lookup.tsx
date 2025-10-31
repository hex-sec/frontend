import { useState, useMemo } from 'react'
import {
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Alert,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { checkAccess } from '@features/guard/api/access.api'

/**
 * Kiosk Lookup Page
 * On-screen keyboard for name/host search with debounced suggestions
 */
export default function Lookup() {
  const navigate = useNavigate()
  const [nameQuery, setNameQuery] = useState('')
  const [hostQuery, setHostQuery] = useState('')
  const [selectedResult, setSelectedResult] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: checkAccess,
    onSuccess: (data) => {
      // Navigate to confirm with visitor data
      navigate(`/kiosk/confirm?code=${encodeURIComponent(data.id)}`)
    },
  })

  // Mock suggestions (in real app, this would come from API with debounce)
  const suggestions = useMemo(() => {
    // TODO: Implement real search API with debounce
    const mockSuggestions = [
      { id: '1', name: 'Juan Pérez', host: 'Residente A' },
      { id: '2', name: 'María García', host: 'Residente B' },
      { id: '3', name: 'Carlos López', host: 'Residente C' },
    ]

    if (!nameQuery && !hostQuery) return []

    return mockSuggestions.filter((s) => {
      const matchesName = !nameQuery || s.name.toLowerCase().includes(nameQuery.toLowerCase())
      const matchesHost = !hostQuery || s.host.toLowerCase().includes(hostQuery.toLowerCase())
      return matchesName && matchesHost
    })
  }, [nameQuery, hostQuery])

  const handleSelect = (id: string) => {
    setSelectedResult(id)
    mutation.mutate({ code: id, direction: 'in' })
  }

  const handleBack = () => {
    navigate('/kiosk/welcome')
  }

  // On-screen keyboard buttons
  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ]

  const handleKeyPress = (key: string) => {
    if (document.activeElement?.tagName === 'INPUT') {
      const input = document.activeElement as HTMLInputElement
      const cursorPos = input.selectionStart || 0
      const text = input.value
      const newText = text.slice(0, cursorPos) + key + text.slice(cursorPos)
      input.value = newText
      input.setSelectionRange(cursorPos + 1, cursorPos + 1)

      if (input.name === 'name') {
        setNameQuery(newText)
      } else if (input.name === 'host') {
        setHostQuery(newText)
      }

      input.dispatchEvent(new Event('input', { bubbles: true }))
    }
  }

  return (
    <Paper sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h3" fontWeight={700} sx={{ mb: 3, textAlign: 'center' }}>
        Buscar Visitante
      </Typography>

      <Stack spacing={3}>
        <TextField
          name="name"
          label="Nombre del visitante"
          fullWidth
          value={nameQuery}
          onChange={(e) => setNameQuery(e.target.value)}
          InputProps={{
            style: { fontSize: '1.5rem' },
          }}
          sx={{ mb: 2 }}
          autoFocus
        />

        <TextField
          name="host"
          label="Nombre del anfitrión"
          fullWidth
          value={hostQuery}
          onChange={(e) => setHostQuery(e.target.value)}
          InputProps={{
            style: { fontSize: '1.5rem' },
          }}
        />

        {suggestions.length > 0 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Resultados
            </Typography>
            <List>
              {suggestions.map((suggestion) => (
                <ListItem key={suggestion.id} disablePadding>
                  <ListItemButton onClick={() => handleSelect(suggestion.id)}>
                    <ListItemText
                      primary={suggestion.name}
                      secondary={`Anfitrión: ${suggestion.host}`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {mutation.error && (
          <Alert severity="error">
            {mutation.error instanceof Error ? mutation.error.message : 'Error al buscar visitante'}
          </Alert>
        )}

        {mutation.isPending && <Alert severity="info">Buscando...</Alert>}

        {/* On-screen keyboard */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Teclado en pantalla
          </Typography>
          <Stack spacing={1}>
            {keyboardRows.map((row, rowIndex) => (
              <Stack key={rowIndex} direction="row" spacing={1} justifyContent="center">
                {row.map((key) => (
                  <Button
                    key={key}
                    variant="outlined"
                    onClick={() => handleKeyPress(key)}
                    sx={{
                      minWidth: 60,
                      height: 60,
                      fontSize: '1.5rem',
                      fontWeight: 600,
                    }}
                  >
                    {key}
                  </Button>
                ))}
              </Stack>
            ))}
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  const input = document.activeElement as HTMLInputElement
                  if (input?.tagName === 'INPUT') {
                    const text = input.value
                    input.value = text.slice(0, -1)
                    input.dispatchEvent(new Event('input', { bubbles: true }))
                    if (input.name === 'name') {
                      setNameQuery(input.value)
                    } else if (input.name === 'host') {
                      setHostQuery(input.value)
                    }
                  }
                }}
                sx={{
                  minWidth: 120,
                  height: 60,
                  fontSize: '1.2rem',
                }}
              >
                ⌫ Borrar
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  const input = document.activeElement as HTMLInputElement
                  if (input?.tagName === 'INPUT') {
                    input.value += ' '
                    input.dispatchEvent(new Event('input', { bubbles: true }))
                    if (input.name === 'name') {
                      setNameQuery(input.value)
                    } else if (input.name === 'host') {
                      setHostQuery(input.value)
                    }
                  }
                }}
                sx={{
                  minWidth: 120,
                  height: 60,
                  fontSize: '1.2rem',
                }}
              >
                Espacio
              </Button>
            </Stack>
          </Stack>
        </Box>

        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
          <Button
            size="large"
            variant="contained"
            onClick={() => {
              if (selectedResult) {
                handleSelect(selectedResult)
              }
            }}
            disabled={!selectedResult || mutation.isPending}
            sx={{ minWidth: 200, py: 2, fontSize: '1.2rem' }}
          >
            Continuar
          </Button>
          <Button
            size="large"
            variant="outlined"
            onClick={handleBack}
            sx={{ minWidth: 200, py: 2, fontSize: '1.2rem' }}
          >
            Volver
          </Button>
        </Stack>
      </Stack>
    </Paper>
  )
}
