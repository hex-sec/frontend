import React, { useEffect, useMemo } from 'react'
import { useTheme } from '@mui/material/styles'
import {
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Box,
  Typography,
  Slider,
  TextField,
  InputAdornment,
  Paper,
  Tooltip,
  Grid2 as Grid,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useUIStore } from '@store/ui.store'
import MenuIcon from '@mui/icons-material/Menu'
import AccountCircle from '@mui/icons-material/AccountCircle'

function Swatch({ kind, opacity }: { kind: string; opacity: number }) {
  const op = Math.max(0, Math.min(1, opacity))
  return (
    <Box
      sx={(theme) => {
        const overlay = alpha(theme.palette.getContrastText(theme.palette.primary.main), op)
        let bgImage: string | undefined
        let bgSize = '28px 28px'
        if (kind === 'subtle-diagonal') {
          bgImage = `linear-gradient(135deg, ${overlay} 25%, transparent 25%, transparent 50%, ${overlay} 50%, ${overlay} 75%, transparent 75%, transparent)`
        }
        if (kind === 'subtle-dots') {
          bgImage = `radial-gradient(${overlay} 1px, transparent 1px)`
          bgSize = '8px 8px'
        }
        if (kind === 'geometry') {
          bgImage = `linear-gradient(45deg, ${overlay} 25%, transparent 25%), linear-gradient(-45deg, ${overlay} 25%, transparent 25%)`
        }
        return {
          width: 48,
          height: 28,
          borderRadius: 1,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.primary.main,
          backgroundImage: bgImage,
          backgroundSize: bgSize,
        }
      }}
    />
  )
}

export default function PatternSelector({
  embedded,
  previewOnly,
}: { embedded?: boolean; previewOnly?: boolean } = {}) {
  const appliedPattern = useUIStore((s) => ({
    enabled: s.patternEnabled,
    setEnabled: s.setPatternEnabled,
    kind: s.patternKind,
    setKind: s.setPatternKind,
    opacity: s.patternOpacity,
    setOpacity: s.setPatternOpacity,
    backgroundSource: s.patternBackgroundSource,
    setBackgroundSource: s.setPatternBackgroundSource,
    customColor: s.patternCustomColor,
    setCustomColor: s.setPatternCustomColor,
    scale: s.patternScale,
    setScale: s.setPatternScale,
  }))
  const draftPattern = useUIStore((s) => ({
    enabled: s.patternDraftEnabled,
    setEnabled: s.setPatternDraftEnabled,
    kind: s.patternDraftKind,
    setKind: s.setPatternDraftKind,
    opacity: s.patternDraftOpacity,
    setOpacity: s.setPatternDraftOpacity,
    backgroundSource: s.patternDraftBackgroundSource,
    setBackgroundSource: s.setPatternDraftBackgroundSource,
    customColor: s.patternDraftCustomColor,
    setCustomColor: s.setPatternDraftCustomColor,
    scale: s.patternDraftScale,
    setScale: s.setPatternDraftScale,
  }))
  const resetPatternDraft = useUIStore((s) => s.resetPatternDraft)

  useEffect(() => {
    if (embedded) {
      resetPatternDraft()
    }
  }, [embedded, resetPatternDraft])

  const {
    enabled: patternEnabled,
    setEnabled: setPatternEnabled,
    kind: patternKind,
    setKind: setPatternKind,
    opacity: patternOpacity,
    setOpacity: setPatternOpacity,
    backgroundSource: bgSource,
    setBackgroundSource: setBgSource,
    customColor,
    setCustomColor,
    scale,
    setScale,
  } = embedded ? draftPattern : appliedPattern

  const theme = useTheme()
  const bgColor = useMemo<string>(() => {
    if (bgSource === 'primary') return theme.palette.primary.main
    if (bgSource === 'secondary') return theme.palette.secondary.main
    return customColor
  }, [bgSource, customColor, theme.palette.primary.main, theme.palette.secondary.main])

  // parent toggle controls whether children are enabled
  const disabled = !patternEnabled

  // inner controls/layout (stacked rows)
  const inner = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle2">Pattern</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Toggle decorative pattern on the top bar">
            <FormControlLabel
              control={
                <Switch
                  checked={patternEnabled}
                  onChange={(e) => setPatternEnabled(e.target.checked)}
                />
              }
              label=""
            />
          </Tooltip>
          <Tooltip title="Reset pattern settings to defaults">
            <IconButton
              size="small"
              onClick={() => {
                setPatternEnabled(true)
                setPatternKind('subtle-diagonal')
                setPatternOpacity(0.08)
                setBgSource('primary')
                setCustomColor('#1976d2')
                setScale(28)
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 6v6l4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Typography sx={{ minWidth: 220 }}>Pattern</Typography>
        <FormControl fullWidth size="small">
          <InputLabel id="pattern-select-label">Pattern</InputLabel>
          <Select
            labelId="pattern-select-label"
            value={patternKind}
            label="Pattern"
            onChange={(e) => setPatternKind(e.target.value)}
            disabled={disabled}
          >
            <MenuItem value="none">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Swatch kind="none" opacity={patternOpacity} />
                <Typography>None</Typography>
              </Box>
            </MenuItem>
            <MenuItem value="subtle-diagonal">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Swatch kind="subtle-diagonal" opacity={patternOpacity} />
                <Typography>Subtle diagonal</Typography>
              </Box>
            </MenuItem>
            <MenuItem value="subtle-dots">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Swatch kind="subtle-dots" opacity={patternOpacity} />
                <Typography>Subtle dots</Typography>
              </Box>
            </MenuItem>
            <MenuItem value="geometry">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Swatch kind="geometry" opacity={patternOpacity} />
                <Typography>Geometry</Typography>
              </Box>
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Typography sx={{ minWidth: 220 }}>Opacity</Typography>
        <Slider
          value={patternOpacity}
          min={0}
          max={1}
          step={0.01}
          onChange={(_, v) => setPatternOpacity(typeof v === 'number' ? v : v[0])}
          sx={{ flex: 1, maxWidth: 420 }}
          disabled={disabled}
        />
        <TextField
          size="small"
          value={Math.round(patternOpacity * 100)}
          onChange={(e) => {
            const num = Math.max(0, Math.min(100, Number(e.target.value || 0)))
            setPatternOpacity(num / 100)
          }}
          InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
          sx={{ width: 80 }}
          disabled={disabled}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Typography sx={{ minWidth: 220 }}>Background</Typography>
        <ToggleButtonGroup
          size="small"
          value={bgSource}
          exclusive
          onChange={(_, v) => v && setBgSource(v)}
          sx={{ flexWrap: 'wrap' }}
          disabled={disabled}
        >
          <ToggleButton value="primary">Primary</ToggleButton>
          <ToggleButton value="secondary">Secondary</ToggleButton>
          <ToggleButton value="custom">Custom</ToggleButton>
        </ToggleButtonGroup>
        {bgSource === 'custom' && (
          <TextField
            size="small"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            sx={{ width: { xs: '100%', md: 160 } }}
            disabled={disabled}
          />
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Typography sx={{ minWidth: 220 }}>Scale</Typography>
        <Slider
          value={scale}
          min={8}
          max={64}
          step={1}
          onChange={(_, v) => setScale(Array.isArray(v) ? v[0] : (v as number))}
          sx={{ width: { xs: 120, md: 200 } }}
          disabled={disabled}
        />
        <TextField
          size="small"
          value={scale}
          onChange={(e) => setScale(Math.max(8, Math.min(64, Number(e.target.value || 28))))}
          sx={{ width: 80 }}
          disabled={disabled}
        />
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
          Preview
        </Typography>
        <Box
          sx={{
            width: '100%',
            maxWidth: { xs: '100%', md: 640 },
            height: 64,
            borderRadius: 1,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            mt: 0.5,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box
            sx={(t) => ({
              width: '100%',
              height: '100%',
              bgcolor: bgColor,
              display: 'flex',
              alignItems: 'center',
              px: 2,
              color: t.palette.getContrastText(bgColor),
            })}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <MenuIcon fontSize="small" />
              <Typography variant="subtitle2" sx={{ ml: 2, flex: 1 }}>
                App title
              </Typography>
              <AccountCircle />
            </Box>
          </Box>
          <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {!disabled && patternKind === 'subtle-diagonal' && (
              <Box
                sx={(t) => ({
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `linear-gradient(135deg, ${alpha(t.palette.getContrastText(bgColor), patternOpacity)} 25%, transparent 25%, transparent 50%, ${alpha(t.palette.getContrastText(bgColor), patternOpacity)} 50%, ${alpha(t.palette.getContrastText(bgColor), patternOpacity)} 75%, transparent 75%, transparent)`,
                  backgroundSize: `${scale}px ${scale}px`,
                })}
              />
            )}
            {!disabled && patternKind === 'subtle-dots' && (
              <Box
                sx={(t) => ({
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `radial-gradient(${alpha(t.palette.getContrastText(bgColor), patternOpacity)} 1px, transparent 1px)`,
                  backgroundSize: `${Math.max(6, Math.round(scale / 4))}px ${Math.max(6, Math.round(scale / 4))}px`,
                })}
              />
            )}
            {!disabled && patternKind === 'geometry' && (
              <Box
                sx={(t) => ({
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `linear-gradient(45deg, ${alpha(t.palette.getContrastText(bgColor), patternOpacity)} 25%, transparent 25%), linear-gradient(-45deg, ${alpha(t.palette.getContrastText(bgColor), patternOpacity)} 25%, transparent 25%)`,
                  backgroundSize: `${scale}px ${scale}px`,
                })}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )

  if (previewOnly) {
    return (
      <Box>
        <Paper elevation={0} sx={{ p: 2, mb: 2 }}>
          {inner}
        </Paper>
      </Box>
    )
  }

  return (
    <Box>
      {embedded ? (
        <Box sx={{ p: 0 }}>{inner}</Box>
      ) : (
        <Paper elevation={0} sx={{ p: 2, mb: 2 }}>
          {inner}
        </Paper>
      )}
    </Box>
  )

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Topbar appearance
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title="Toggle decorative pattern on the top bar">
                <FormControlLabel
                  control={
                    <Switch
                      checked={patternEnabled}
                      onChange={(e) => setPatternEnabled(e.target.checked)}
                    />
                  }
                  label="Pattern"
                />
              </Tooltip>
              <Tooltip title="Reset pattern settings to defaults">
                <IconButton
                  size="small"
                  onClick={() => {
                    setPatternEnabled(true)
                    setPatternKind('subtle-diagonal')
                    setPatternOpacity(0.08)
                    setBgSource('primary')
                    setCustomColor('#1976d2')
                    setScale(28)
                  }}
                >
                  {/* simple reset */}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 6v6l4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </IconButton>
              </Tooltip>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="pattern-select-label">Pattern</InputLabel>
              <Select
                labelId="pattern-select-label"
                value={patternKind}
                label="Pattern"
                onChange={(e) => setPatternKind(e.target.value)}
              >
                <MenuItem value="none">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Swatch kind="none" opacity={patternOpacity} />
                    <Typography>None</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="subtle-diagonal">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Swatch kind="subtle-diagonal" opacity={patternOpacity} />
                    <Typography>Subtle diagonal</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="subtle-dots">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Swatch kind="subtle-dots" opacity={patternOpacity} />
                    <Typography>Subtle dots</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="geometry">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Swatch kind="geometry" opacity={patternOpacity} />
                    <Typography>Geometry</Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Opacity
              </Typography>
              <Slider
                value={patternOpacity}
                min={0}
                max={1}
                step={0.01}
                onChange={(_, v) => setPatternOpacity(typeof v === 'number' ? v : v[0])}
                sx={{ width: 160 }}
              />
              <TextField
                size="small"
                value={Math.round(patternOpacity * 100)}
                onChange={(e) => {
                  const num = Math.max(0, Math.min(100, Number(e.target.value || 0)))
                  setPatternOpacity(num / 100)
                }}
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                sx={{ width: 64 }}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Background
              </Typography>
              <ToggleButtonGroup
                size="small"
                value={bgSource}
                exclusive
                onChange={(_, v) => v && setBgSource(v)}
                sx={{ mt: 1 }}
              >
                <ToggleButton value="primary">Primary</ToggleButton>
                <ToggleButton value="secondary">Secondary</ToggleButton>
                <ToggleButton value="custom">Custom</ToggleButton>
              </ToggleButtonGroup>
              {bgSource === 'custom' && (
                <TextField
                  size="small"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  sx={{ mt: 1 }}
                />
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                Live preview
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 420,
                  height: 64,
                  borderRadius: 1,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  mt: 0.5,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <Box
                  sx={(t) => ({
                    width: '100%',
                    height: '100%',
                    bgcolor: bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    color: t.palette.getContrastText(bgColor),
                  })}
                >
                  {/* small topbar mock with hamburger, title and avatar */}
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <MenuIcon fontSize="small" />
                    <Typography variant="subtitle2" sx={{ ml: 2, flex: 1 }}>
                      App title
                    </Typography>
                    <AccountCircle />
                  </Box>

                  {/* pattern overlay covers the full inset */}
                  <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    {patternKind === 'subtle-diagonal' && (
                      <Box
                        sx={(t) => ({
                          position: 'absolute',
                          inset: 0,
                          backgroundImage: `linear-gradient(135deg, ${alpha(t.palette.getContrastText(bgColor), patternOpacity)} 25%, transparent 25%, transparent 50%, ${alpha(t.palette.getContrastText(bgColor), patternOpacity)} 50%, ${alpha(t.palette.getContrastText(bgColor), patternOpacity)} 75%, transparent 75%, transparent)`,
                          backgroundSize: `${scale}px ${scale}px`,
                        })}
                      />
                    )}
                    {patternKind === 'subtle-dots' && (
                      <Box
                        sx={(t) => ({
                          position: 'absolute',
                          inset: 0,
                          backgroundImage: `radial-gradient(${alpha(t.palette.getContrastText(bgColor), patternOpacity)} 1px, transparent 1px)`,
                          backgroundSize: `${Math.max(6, Math.round(scale / 4))}px ${Math.max(6, Math.round(scale / 4))}px`,
                        })}
                      />
                    )}
                    {patternKind === 'geometry' && (
                      <Box
                        sx={(t) => ({
                          position: 'absolute',
                          inset: 0,
                          backgroundImage: `linear-gradient(45deg, ${alpha(t.palette.getContrastText(bgColor), patternOpacity)} 25%, transparent 25%), linear-gradient(-45deg, ${alpha(t.palette.getContrastText(bgColor), patternOpacity)} 25%, transparent 25%)`,
                          backgroundSize: `${scale}px ${scale}px`,
                        })}
                      />
                    )}
                  </Box>
                </Box>
              </Box>
              <Box sx={{ mt: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Scale
                </Typography>
                <Slider
                  value={scale}
                  min={8}
                  max={64}
                  step={1}
                  onChange={(_, v) => setScale(Array.isArray(v) ? v[0] : (v as number))}
                  sx={{ width: 160 }}
                />
                <TextField
                  size="small"
                  value={scale}
                  onChange={(e) =>
                    setScale(Math.max(8, Math.min(64, Number(e.target.value || 28))))
                  }
                  sx={{ width: 80 }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}
