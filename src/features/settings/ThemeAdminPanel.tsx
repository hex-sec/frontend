import React, { useMemo, useState, useEffect } from 'react'
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Slider,
  Stack,
  Paper,
  Divider,
  MenuItem,
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useThemeStore } from '@store/theme.store'
import { useTranslate } from '../../i18n/useTranslate'

function Swatch({
  color,
  onChange,
  label,
}: {
  color: string
  onChange: (v: string) => void
  label: string
}) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Box
          sx={(theme) => ({
            width: 40,
            height: 40,
            bgcolor: color,
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`,
            color: theme.palette.getContrastText(color),
          })}
        />
        <TextField value={color} onChange={(e) => onChange(e.target.value)} size="small" />
      </Box>
    </Box>
  )
}

export default function ThemeAdminPanel({ overlay }: { overlay?: boolean } = {}) {
  const [open, setOpen] = useState(true)
  const { setBrand, brandConfig } = useThemeStore()
  const { t } = useTranslate()
  // local themes persisted in localStorage
  const STORAGE_KEY = 'themeAdmin.themes'
  type ThemeRecord = {
    id: string
    name: string
    primary: string
    secondary: string
    info: string
    success: string
    warning: string
    error: string
    debug: string
    borderRadius: number
  }

  const loadThemesFromStorage = (): ThemeRecord[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      return JSON.parse(raw) as ThemeRecord[]
    } catch (e) {
      console.error('failed to load themes', e)
      return []
    }
  }

  const TEMPLATES: ThemeRecord[] = [
    {
      id: '__light',
      name: 'Light (template)',
      primary: '#1976d2',
      secondary: '#9c27b0',
      info: '#0288d1',
      success: '#2e7d32',
      warning: '#f9a825',
      error: '#d32f2f',
      debug: '#9e9e9e',
      borderRadius: 8,
    },
    {
      id: '__dark',
      name: 'Dark (template)',
      primary: '#90caf9',
      secondary: '#ce93d8',
      info: '#81d4fa',
      success: '#81c784',
      warning: '#ffb74d',
      error: '#e57373',
      debug: '#bdbdbd',
      borderRadius: 8,
    },
  ]

  const saveThemesToStorage = (arr: ThemeRecord[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr))
    } catch (e) {
      console.error('failed to save themes', e)
    }
  }

  const [themes, setThemes] = useState<ThemeRecord[]>(() => loadThemesFromStorage())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [primary, setPrimary] = useState(brandConfig?.primary ?? '#0D47A1')
  const [secondary, setSecondary] = useState(brandConfig?.secondary ?? '#FFC107')
  const [info, setInfo] = useState(brandConfig?.info ?? '#0288d1')
  const [success, setSuccess] = useState(brandConfig?.success ?? '#2e7d32')
  const [warning, setWarning] = useState(brandConfig?.warning ?? '#f9a825')
  const [error, setError] = useState(brandConfig?.error ?? '#d32f2f')
  const [debug, setDebug] = useState(brandConfig?.debug ?? '#9e9e9e')
  const [name, setName] = useState(brandConfig?.name ?? 'Company')
  const [borderRadius, setBorderRadius] = useState<number>(brandConfig?.borderRadius ?? 8)

  const previewStyles = useMemo(
    () => ({
      primary,
      secondary,
      info,
      success,
      warning,
      error,
      debug,
      borderRadius,
    }),
    [primary, secondary, info, success, warning, error, debug, borderRadius],
  )

  useEffect(() => {
    // merge templates + local themes for the selector and initial load
    const all = [...TEMPLATES, ...themes]

    if (all.length > 0 && !selectedId) {
      const first = all[0]
      setSelectedId(first.id)
      // load first (templates included)
      setPrimary(first.primary)
      setSecondary(first.secondary)
      setInfo(first.info)
      setSuccess(first.success)
      setWarning(first.warning)
      setError(first.error)
      setDebug(first.debug)
      setBorderRadius(first.borderRadius)
      setName(first.name)
    }

    if (themes.length === 0) {
      const initial: ThemeRecord = {
        id: Date.now().toString(),
        name: brandConfig?.name ?? 'Default',
        primary: brandConfig?.primary ?? primary,
        secondary: brandConfig?.secondary ?? secondary,
        info: brandConfig?.info ?? info,
        success: brandConfig?.success ?? success,
        warning: brandConfig?.warning ?? warning,
        error: brandConfig?.error ?? error,
        debug: brandConfig?.debug ?? debug,
        borderRadius: brandConfig?.borderRadius ?? borderRadius,
      }
      const next = [initial]
      setThemes(next)
      saveThemesToStorage(next)
      setSelectedId(initial.id)
      // load into editor
      setPrimary(initial.primary)
      setSecondary(initial.secondary)
      setInfo(initial.info)
      setSuccess(initial.success)
      setWarning(initial.warning)
      setError(initial.error)
      setDebug(initial.debug)
      setBorderRadius(initial.borderRadius)
      setName(initial.name)
    }
  }, [])

  const createNewTheme = () => {
    const r: ThemeRecord = {
      id: Date.now().toString(),
      name: `Theme ${themes.length + 1}`,
      primary,
      secondary,
      info,
      success,
      warning,
      error,
      debug,
      borderRadius,
    }
    const next = [...themes, r]
    setThemes(next)
    saveThemesToStorage(next)
    setSelectedId(r.id)
  }

  const saveCurrentTheme = () => {
    if (!selectedId) {
      createNewTheme()
      return
    }
    const updated = {
      id: selectedId,
      name,
      primary,
      secondary,
      info,
      success,
      warning,
      error,
      debug,
      borderRadius,
    }
    const next = themes.map((t) => (t.id === selectedId ? { ...t, ...updated } : t))
    setThemes(next)
    saveThemesToStorage(next)
    // apply the saved theme to the app immediately so TopNav and other brand-driven UI update
    setBrand({
      name,
      primary,
      secondary,
      borderRadius,
      contrastMode: 'normal',
      info,
      success,
      warning,
      error,
      debug,
    })
  }

  const deleteSelected = () => {
    if (!selectedId) return
    if (!window.confirm('Delete this theme?')) return
    const next = themes.filter((t) => t.id !== selectedId)
    setThemes(next)
    saveThemesToStorage(next)
    if (next.length > 0) {
      const pick = next[0]
      setSelectedId(pick.id)
      // load
      setPrimary(pick.primary)
      setSecondary(pick.secondary)
      setInfo(pick.info)
      setSuccess(pick.success)
      setWarning(pick.warning)
      setError(pick.error)
      setDebug(pick.debug)
      setBorderRadius(pick.borderRadius)
      setName(pick.name)
    } else {
      setSelectedId(null)
    }
  }

  const selectTheme = (id: string) => {
    setSelectedId(id)
    // templates
    if (id === '__light') {
      const t = TEMPLATES.find((x) => x.id === '__light')!
      setPrimary(t.primary)
      setSecondary(t.secondary)
      setInfo(t.info)
      setSuccess(t.success)
      setWarning(t.warning)
      setError(t.error)
      setDebug(t.debug)
      setBorderRadius(t.borderRadius)
      setName(t.name)
      return
    }
    if (id === '__dark') {
      const t = TEMPLATES.find((x) => x.id === '__dark')!
      setPrimary(t.primary)
      setSecondary(t.secondary)
      setInfo(t.info)
      setSuccess(t.success)
      setWarning(t.warning)
      setError(t.error)
      setDebug(t.debug)
      setBorderRadius(t.borderRadius)
      setName(t.name)
      return
    }
    const t = themes.find((x) => x.id === id)
    if (!t) return
    setPrimary(t.primary)
    setSecondary(t.secondary)
    setInfo(t.info)
    setSuccess(t.success)
    setWarning(t.warning)
    setError(t.error)
    setDebug(t.debug)
    setBorderRadius(t.borderRadius)
    setName(t.name)
  }

  const content = (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ mb: 2, p: 1 }} elevation={0}>
        <Typography variant="h6">{t('themeEditor.title')}</Typography>
        <Typography variant="caption" color="text.secondary">
          Edit and manage visual themes for your site
        </Typography>
      </Paper>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Grid item xs={12} sm={'auto'}>
                <TextField
                  select
                  size="small"
                  label="Select theme"
                  value={selectedId ?? ''}
                  onChange={(e) => selectTheme(e.target.value)}
                  sx={{ minWidth: { xs: '100%', sm: 200 } }}
                >
                  {TEMPLATES.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.name}
                    </MenuItem>
                  ))}
                  {themes.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item>
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" size="small" onClick={createNewTheme}>
                    New
                  </Button>
                  <Button variant="contained" size="small" onClick={saveCurrentTheme}>
                    Save
                  </Button>
                  <Button variant="text" color="error" size="small" onClick={deleteSelected}>
                    Delete
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => {
                      // clone template or current into saved themes
                      const srcId = selectedId
                      if (!srcId) return
                      let src: ThemeRecord | undefined
                      if (srcId === '__light')
                        src = {
                          id: Date.now().toString(),
                          name: 'Light copy',
                          primary: '#1976d2',
                          secondary: '#9c27b0',
                          info: '#0288d1',
                          success: '#2e7d32',
                          warning: '#f9a825',
                          error: '#d32f2f',
                          debug: '#9e9e9e',
                          borderRadius: 8,
                        }
                      else if (srcId === '__dark')
                        src = {
                          id: Date.now().toString(),
                          name: 'Dark copy',
                          primary: '#90caf9',
                          secondary: '#ce93d8',
                          info: '#81d4fa',
                          success: '#81c784',
                          warning: '#ffb74d',
                          error: '#e57373',
                          debug: '#bdbdbd',
                          borderRadius: 8,
                        }
                      else src = themes.find((t) => t.id === srcId)
                      if (!src) return
                      const next = [...themes, src]
                      setThemes(next)
                      saveThemesToStorage(next)
                      setSelectedId(src.id)
                    }}
                  >
                    Clone
                  </Button>
                </Stack>
              </Grid>
            </Grid>
            <Typography variant="h6">Theme editor</Typography>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Swatch label="Primary color" color={primary} onChange={setPrimary} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Swatch label="Secondary color" color={secondary} onChange={setSecondary} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Swatch label="Info color" color={info} onChange={setInfo} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Swatch label="Success color" color={success} onChange={setSuccess} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Swatch label="Warning color" color={warning} onChange={setWarning} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Swatch label="Error color" color={error} onChange={setError} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Swatch label="Debug color" color={debug} onChange={setDebug} />
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Typography variant="caption">Border radius: {borderRadius}px</Typography>
                <Slider
                  value={borderRadius}
                  min={0}
                  max={24}
                  onChange={(_, v) => setBorderRadius(Array.isArray(v) ? v[0] : (v as number))}
                />
              </Box>

              <TextField
                label="Brand name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                sx={{ mt: 2 }}
              />

              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Box sx={{ flex: 1 }} />
                <Button
                  variant="contained"
                  onClick={() => {
                    /* preview only - Save will apply the theme */
                  }}
                >
                  {t('themeEditor.apply')}
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Preview
            </Typography>
            <Box
              sx={(theme) => ({
                bgcolor: previewStyles.primary,
                color: theme.palette.getContrastText(previewStyles.primary),
                p: 2,
                borderRadius: `${previewStyles.borderRadius}px`,
              })}
            >
              <Typography variant="h6">{name}</Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                sx={{
                  bgcolor: previewStyles.primary,
                  borderRadius: `${previewStyles.borderRadius}px`,
                }}
              >
                Primary
              </Button>
              <Button
                variant="outlined"
                sx={{
                  color: previewStyles.primary,
                  borderColor: previewStyles.primary,
                  borderRadius: `${previewStyles.borderRadius}px`,
                }}
              >
                Outline
              </Button>
              <Button variant="text" sx={{ color: previewStyles.secondary }}>
                Text
              </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
              <Box
                sx={{
                  bgcolor: previewStyles.info,
                  color: (theme) => theme.palette.getContrastText(previewStyles.info),
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                }}
              >
                Info
              </Box>
              <Box
                sx={{
                  bgcolor: previewStyles.success,
                  color: (theme) => theme.palette.getContrastText(previewStyles.success),
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                }}
              >
                Success
              </Box>
              <Box
                sx={{
                  bgcolor: previewStyles.warning,
                  color: (theme) => theme.palette.getContrastText(previewStyles.warning),
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                }}
              >
                Warning
              </Box>
              <Box
                sx={{
                  bgcolor: previewStyles.error,
                  color: (theme) => theme.palette.getContrastText(previewStyles.error),
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                }}
              >
                Error
              </Box>
              <Box
                sx={{
                  bgcolor: previewStyles.debug,
                  color: (theme) => theme.palette.getContrastText(previewStyles.debug),
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                }}
              >
                Debug
              </Box>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h5">Heading</Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                This is a sample paragraph demonstrating body text with default styles. The preview
                reflects the current brand colors.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )

  if (overlay) {
    return (
      <Dialog
        fullScreen
        open={open}
        onClose={() => {
          setOpen(false)
          window.history.back()
        }}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => {
                setOpen(false)
                window.history.back()
              }}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6">
              Theme Editor
            </Typography>
            <Button
              autoFocus
              color="inherit"
              onClick={() => {
                /* preview only - Save will apply the theme */
              }}
            >
              Apply
            </Button>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 2 }}>{content}</Box>
      </Dialog>
    )
  }

  return content
}
