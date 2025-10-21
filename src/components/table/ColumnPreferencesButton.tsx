import { useState, type MouseEvent } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  Tooltip,
  Typography,
} from '@mui/material'
import ViewColumnIcon from '@mui/icons-material/ViewColumn'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import type { ColumnDefinition } from './useColumnPreferences'

type ColumnPreferencesButtonProps<T> = {
  columns: ColumnDefinition<T>[]
  hiddenColumns: string[]
  onToggleColumn: (id: string) => void
  onMoveColumn: (id: string, toIndex: number) => void
  onReset: () => void
  title?: string
}

export function ColumnPreferencesButton<T>({
  columns,
  hiddenColumns,
  onToggleColumn,
  onMoveColumn,
  onReset,
  title = 'Customize columns',
}: ColumnPreferencesButtonProps<T>) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <Tooltip title={title}>
        <IconButton color="inherit" onClick={handleOpen} aria-label="Customize table columns">
          <ViewColumnIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 280, p: 1 } } }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1,
            py: 0.5,
          }}
        >
          <Typography variant="subtitle2">Columns</Typography>
          <Button
            size="small"
            startIcon={<RestartAltIcon fontSize="small" />}
            onClick={() => onReset()}
          >
            Reset
          </Button>
        </Box>
        <Divider sx={{ my: 1 }} />
        <List dense disablePadding>
          {columns.map((column, index) => {
            const checked = !hiddenColumns.includes(column.id)
            const isFirst = index === 0
            const isLast = index === columns.length - 1
            return (
              <ListItem key={column.id} disablePadding sx={{ pr: 0 }}>
                <ListItemButton
                  sx={{ pr: 5 }}
                  onClick={() => (!column.disableToggle ? onToggleColumn(column.id) : undefined)}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Checkbox
                      edge="start"
                      size="small"
                      checked={checked}
                      disabled={column.disableToggle}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                    primary={column.label}
                    secondary={column.description}
                  />
                </ListItemButton>
                <Box sx={{ display: 'flex', alignItems: 'center', pr: 1.5, gap: 0.5 }}>
                  <Tooltip title="Move up">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => onMoveColumn(column.id, index - 1)}
                        disabled={isFirst}
                        sx={{ opacity: isFirst ? 0.4 : 1 }}
                      >
                        <ArrowUpwardIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Move down">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => onMoveColumn(column.id, index + 1)}
                        disabled={isLast}
                        sx={{ opacity: isLast ? 0.4 : 1 }}
                      >
                        <ArrowDownwardIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              </ListItem>
            )
          })}
        </List>
      </Menu>
    </>
  )
}
