import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  FormControlLabel,
  Box,
} from '@mui/material'
import { useTranslate } from '../../../../i18n/useTranslate'
import type { SiteMode } from '@store/site.store'
import type { Site } from '@store/site.store'

interface ModeSwitchDialogProps {
  open: boolean
  onClose: () => void
  selectedMode: SiteMode
  onModeChange: (mode: SiteMode) => void
  selectedSiteSlug: string
  onSiteChange: (slug: string) => void
  onConfirm: () => void
  canSelectSite: boolean
  disableConfirm: boolean
  sites: Site[]
}

export function ModeSwitchDialog({
  open,
  onClose,
  selectedMode,
  onModeChange,
  selectedSiteSlug,
  onSiteChange,
  onConfirm,
  canSelectSite,
  disableConfirm,
  sites,
}: ModeSwitchDialogProps) {
  const { t } = useTranslate()
  const showSiteSelect = selectedMode === 'site'

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('topnav.modeDialog.title')}</DialogTitle>
      <DialogContent dividers>
        <RadioGroup
          value={selectedMode}
          onChange={(event) => onModeChange(event.target.value as SiteMode)}
        >
          <FormControlLabel
            value="enterprise"
            control={<Radio />}
            label={t('topnav.modeDialog.enterpriseOption')}
          />
          <FormControlLabel
            value="site"
            control={<Radio />}
            label={t('topnav.modeDialog.siteOption')}
            disabled={!canSelectSite}
          />
        </RadioGroup>
        {showSiteSelect ? (
          <Box sx={{ mt: 2 }}>
            <TextField
              select
              label={t('topnav.modeDialog.selectSite')}
              value={selectedSiteSlug}
              onChange={(event) => onSiteChange(event.target.value)}
              fullWidth
              helperText={!canSelectSite ? t('topnav.modeDialog.noSites') : undefined}
            >
              {canSelectSite ? (
                sites.map((site) => (
                  <MenuItem key={site.slug} value={site.slug}>
                    {site.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="" disabled>
                  {t('topnav.modeDialog.noSites')}
                </MenuItem>
              )}
            </TextField>
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button variant="contained" onClick={onConfirm} disabled={disableConfirm}>
          {t('common.apply')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
