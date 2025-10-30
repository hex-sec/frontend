import { ReactNode, useMemo, useEffect, useState } from 'react'
import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Fade,
  Skeleton,
} from '@mui/material'
import { ColumnPreferencesButton } from '../../../components/table/ColumnPreferencesButton'
import {
  useColumnPreferences,
  type ColumnDefinition,
  type UseColumnPreferencesReturn,
} from '../../../components/table/useColumnPreferences'

type EmptyStateConfig = {
  title: string
  description?: string
  action?: ReactNode
}

type RenderToolbarArgs<T> = {
  ColumnPreferencesTrigger: ReactNode
  orderedColumns: ColumnDefinition<T>[]
  visibleColumns: ColumnDefinition<T>[]
  hiddenColumns: string[]
  toggleColumnVisibility: (id: string) => void
  moveColumn: (id: string, toIndex: number) => void
  resetColumns: () => void
}

type ConfigurableTableProps<T> = {
  storageKey: string
  columns: ColumnDefinition<T>[]
  rows: T[]
  getRowId: (row: T, index: number) => string
  size?: 'small' | 'medium'
  emptyState?: EmptyStateConfig
  renderToolbar?: (args: RenderToolbarArgs<T>) => ReactNode
  onRowClick?: (row: T) => void
  columnState?: UseColumnPreferencesReturn<T>
  renderRowStartAction?: (row: T) => ReactNode
  startActionHeader?: ReactNode
  isLoading?: boolean
  initialSkeletonMs?: number
  skeletonPadding?: number | { xs?: number; sm?: number; md?: number; lg?: number }
  skeletonMinHeight?: number
  skeletonRows?: number
}

const DEFAULT_EMPTY_STATE: EmptyStateConfig = {
  title: 'No records',
  description: 'Try adjusting your filters or search query.',
}

export function ConfigurableTable<T>({
  storageKey,
  columns,
  rows,
  getRowId,
  size = 'medium',
  emptyState = DEFAULT_EMPTY_STATE,
  renderToolbar,
  onRowClick,
  columnState,
  renderRowStartAction,
  startActionHeader,
  isLoading = false,
  initialSkeletonMs = 0,
  skeletonPadding = 0,
  skeletonMinHeight = 280,
  skeletonRows = 4,
}: ConfigurableTableProps<T>) {
  const [localLoading, setLocalLoading] = useState<boolean>(false)

  useEffect(() => {
    if (initialSkeletonMs > 0) {
      setLocalLoading(true)
      const timer = setTimeout(() => setLocalLoading(false), initialSkeletonMs)
      return () => clearTimeout(timer)
    }
    return
  }, [initialSkeletonMs])

  const activeLoading = isLoading || localLoading
  const resolvedColumnState = columnState ?? useColumnPreferences<T>(storageKey, columns)

  const columnPreferencesTrigger = useMemo(
    () => (
      <ColumnPreferencesButton
        columns={resolvedColumnState.orderedColumns}
        hiddenColumns={resolvedColumnState.hiddenColumns}
        onToggleColumn={resolvedColumnState.toggleColumnVisibility}
        onMoveColumn={resolvedColumnState.moveColumn}
        onReset={resolvedColumnState.resetColumns}
      />
    ),
    [
      resolvedColumnState.hiddenColumns,
      resolvedColumnState.moveColumn,
      resolvedColumnState.orderedColumns,
      resolvedColumnState.resetColumns,
      resolvedColumnState.toggleColumnVisibility,
    ],
  )

  const toolbar = renderToolbar
    ? renderToolbar({
        ColumnPreferencesTrigger: columnPreferencesTrigger,
        orderedColumns: resolvedColumnState.orderedColumns,
        visibleColumns: resolvedColumnState.visibleColumns,
        hiddenColumns: resolvedColumnState.hiddenColumns,
        toggleColumnVisibility: resolvedColumnState.toggleColumnVisibility,
        moveColumn: resolvedColumnState.moveColumn,
        resetColumns: resolvedColumnState.resetColumns,
      })
    : null

  const visibleColumnCount = resolvedColumnState.visibleColumns.length || 1
  const hasStartAction = Boolean(renderRowStartAction)

  const renderSkeleton = () => (
    <Box>
      <Skeleton variant="rectangular" height={28} sx={{ mb: 1, maxWidth: '100%' }} />
      {[...Array(skeletonRows)].map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={44} sx={{ mb: 1, maxWidth: '100%' }} />
      ))}
    </Box>
  )

  return (
    <Stack spacing={2}>
      {toolbar}
      <Box sx={{ position: 'relative', minHeight: activeLoading ? skeletonMinHeight : undefined }}>
        <Fade in={activeLoading} timeout={{ enter: 0, exit: 300 }} unmountOnExit>
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              bgcolor: 'background.paper',
              p: skeletonPadding,
            }}
          >
            {renderSkeleton()}
          </Box>
        </Fade>

        <Fade in={!activeLoading} timeout={{ enter: 400, exit: 0 }} mountOnEnter unmountOnExit>
          <TableContainer
            sx={{
              overflowX: 'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: (theme) => `${theme.palette.action.disabled} transparent`,
              '&::-webkit-scrollbar': { height: 6 },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'action.disabled',
                borderRadius: 999,
              },
              '&::-webkit-scrollbar-track': { backgroundColor: 'transparent !important' },
              '&::-webkit-scrollbar-track-piece': { backgroundColor: 'transparent !important' },
              '&::-webkit-scrollbar-corner': { background: 'transparent' },
            }}
          >
            <Table size={size}>
              <TableHead>
                <TableRow>
                  {hasStartAction ? (
                    <TableCell
                      key="_rowStartAction"
                      sx={{ width: 48, minWidth: 48 }}
                      align="center"
                    >
                      {startActionHeader ?? ''}
                    </TableCell>
                  ) : null}
                  {resolvedColumnState.visibleColumns.map((column: ColumnDefinition<T>) => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      sx={{ minWidth: column.minWidth }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={visibleColumnCount + (hasStartAction ? 1 : 0)}>
                      <Stack spacing={1} alignItems="center" sx={{ py: 5 }}>
                        <Typography variant="subtitle1">{emptyState.title}</Typography>
                        {emptyState.description ? (
                          <Typography variant="body2" color="text.secondary">
                            {emptyState.description}
                          </Typography>
                        ) : null}
                        {emptyState.action ? <Box>{emptyState.action}</Box> : null}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row, index) => (
                    <TableRow
                      key={getRowId(row, index)}
                      hover={Boolean(onRowClick)}
                      onClick={() => {
                        if (onRowClick) {
                          onRowClick(row)
                        }
                      }}
                    >
                      {hasStartAction ? (
                        <TableCell
                          key={`_rowStartAction-${getRowId(row, index)}`}
                          align="center"
                          sx={{ width: 48, minWidth: 48 }}
                        >
                          {renderRowStartAction?.(row)}
                        </TableCell>
                      ) : null}
                      {resolvedColumnState.visibleColumns.map((column: ColumnDefinition<T>) => (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          sx={{ minWidth: column.minWidth }}
                        >
                          {column.render(row)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Fade>
      </Box>
    </Stack>
  )
}
