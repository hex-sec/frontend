import { useState, MouseEvent } from 'react'
import { IconButton, Menu, MenuItem, ListItemText, Tooltip, Box, Button } from '@mui/material'
import TranslateIcon from '@mui/icons-material/Translate'
import CheckIcon from '@mui/icons-material/Check'
import { useI18nStore } from '@store/i18n.store'
import { useTranslate } from '@i18n/useTranslate'
import type { SupportedLanguage } from '@i18n/i18n'

const LANGUAGE_OPTIONS: Array<{ value: SupportedLanguage; labelKey: string }> = [
  { value: 'es', labelKey: 'languages.es' },
  { value: 'en', labelKey: 'languages.en' },
]

type LanguageMenuProps = {
  variant?: 'icon' | 'button'
  buttonLabel?: string
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
  onLanguageSelect?: (language: SupportedLanguage) => void
}

export function LanguageMenu({
  variant = 'icon',
  buttonLabel,
  size = 'small',
  fullWidth = false,
  onLanguageSelect,
}: LanguageMenuProps) {
  const { language, setLanguage } = useI18nStore()
  const { t } = useTranslate()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => setAnchorEl(null)

  const triggerLabel =
    buttonLabel ??
    (variant === 'icon'
      ? t('languageSwitcher.aria')
      : `${t('languageSwitcher.label')}: ${t(`languages.${language}`)}`)

  return (
    <>
      {variant === 'icon' ? (
        <Tooltip title={triggerLabel}>
          <IconButton color="inherit" onClick={handleOpen} aria-label={triggerLabel} size={size}>
            <TranslateIcon fontSize={size === 'large' ? 'medium' : 'small'} />
          </IconButton>
        </Tooltip>
      ) : (
        <Button
          variant="outlined"
          startIcon={<TranslateIcon fontSize="small" />}
          onClick={handleOpen}
          size={size}
          fullWidth={fullWidth}
          aria-label={triggerLabel}
        >
          {triggerLabel}
        </Button>
      )}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {LANGUAGE_OPTIONS.map((option) => {
          const isSelected = option.value === language
          return (
            <MenuItem
              key={option.value}
              selected={isSelected}
              onClick={() => {
                setLanguage(option.value)
                onLanguageSelect?.(option.value)
                handleClose()
              }}
            >
              <Box sx={{ width: 20, display: 'flex', alignItems: 'center', mr: 1 }}>
                <CheckIcon
                  fontSize="small"
                  sx={{ visibility: isSelected ? 'visible' : 'hidden' }}
                />
              </Box>
              <ListItemText primary={t(option.labelKey)} />
            </MenuItem>
          )
        })}
      </Menu>
    </>
  )
}
