import { Box, Button, Chip, Menu, MenuItem, Paper, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import TimelineIcon from '@mui/icons-material/Timeline'
import DomainIcon from '@mui/icons-material/Domain'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import type { AnalyticsParams, Granularity, SiteScope } from './analytics.types'

interface AnalyticsFilterBarProps {
  value: AnalyticsParams
  onChange: (next: AnalyticsParams) => void
  availableSites?: Array<{ id: string; name: string }>
}

const PRESETS = [
  {
    key: 'today',
    label: 'Hoy',
    getDates: () => ({
      from: new Date().setHours(0, 0, 0, 0).toString(),
      to: new Date().toISOString(),
    }),
  },
  {
    key: '7d',
    label: '7 días',
    getDates: () => ({
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      to: new Date().toISOString(),
    }),
  },
  {
    key: 'mtd',
    label: 'Este mes',
    getDates: () => ({
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
      to: new Date().toISOString(),
    }),
  },
  {
    key: '30d',
    label: '30 días',
    getDates: () => ({
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      to: new Date().toISOString(),
    }),
  },
  {
    key: '90d',
    label: '90 días',
    getDates: () => ({
      from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      to: new Date().toISOString(),
    }),
  },
]

export function AnalyticsFilterBar({ value, onChange, availableSites }: AnalyticsFilterBarProps) {
  const [anchorGranularity, setAnchorGranularity] = useState<null | HTMLElement>(null)
  const [anchorSite, setAnchorSite] = useState<null | HTMLElement>(null)

  const handlePresetClick = (preset: (typeof PRESETS)[0]) => {
    const dates = preset.getDates()
    onChange({ ...value, date_from: dates.from, date_to: dates.to })
  }

  const handleGranularitySelect = (granularity: Granularity) => {
    onChange({ ...value, granularity })
    setAnchorGranularity(null)
  }

  const handleSiteSelect = (siteScope: SiteScope) => {
    onChange({ ...value, site_scope: siteScope })
    setAnchorSite(null)
  }

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Stack spacing={2}>
        {/* Date Presets */}
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <CalendarTodayIcon fontSize="small" color="action" />
            <Typography variant="body2" fontWeight={500} color="text.secondary">
              Rango de fechas
            </Typography>
          </Stack>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {PRESETS.map((preset) => (
              <Button
                key={preset.key}
                variant="outlined"
                size="small"
                onClick={() => handlePresetClick(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Granularity and Site Scope */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-start' }}>
          <Box>
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
              <TimelineIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                Granularidad
              </Typography>
            </Stack>
            <Chip
              label={value.granularity === 'auto' ? 'Auto' : value.granularity}
              onClick={(e) => setAnchorGranularity(e.currentTarget)}
              icon={<ArrowDropDownIcon />}
              variant="outlined"
              size="small"
            />
            <Menu
              anchorEl={anchorGranularity}
              open={Boolean(anchorGranularity)}
              onClose={() => setAnchorGranularity(null)}
            >
              {(['auto', 'day', 'week', 'month'] as Granularity[]).map((opt) => (
                <MenuItem
                  key={opt}
                  onClick={() => handleGranularitySelect(opt)}
                  selected={value.granularity === opt}
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Box>
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
              <DomainIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                Alcance
              </Typography>
            </Stack>
            <Chip
              label={
                value.site_scope === 'current'
                  ? 'Sitio actual'
                  : value.site_scope === 'all'
                    ? 'Todos'
                    : 'Específico'
              }
              onClick={(e) => setAnchorSite(e.currentTarget)}
              icon={<ArrowDropDownIcon />}
              variant="outlined"
              size="small"
            />
            <Menu
              anchorEl={anchorSite}
              open={Boolean(anchorSite)}
              onClose={() => setAnchorSite(null)}
            >
              <MenuItem
                onClick={() => handleSiteSelect('current')}
                selected={value.site_scope === 'current'}
              >
                Sitio actual
              </MenuItem>
              <MenuItem
                onClick={() => handleSiteSelect('all')}
                selected={value.site_scope === 'all'}
              >
                Todos
              </MenuItem>
              {availableSites?.map((site) => (
                <MenuItem
                  key={site.id}
                  onClick={() => handleSiteSelect(site.id)}
                  selected={value.site_scope === site.id}
                >
                  {site.name}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Box>
      </Stack>
    </Paper>
  )
}
