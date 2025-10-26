import { ReactNode, useMemo } from 'react'
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
}: ConfigurableTableProps<T>) {
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

  return (
    <Stack spacing={2}>
      {toolbar}

      <TableContainer>
        <Table size={size}>
          <TableHead>
            <TableRow>
              {resolvedColumnState.visibleColumns.map((column: ColumnDefinition<T>) => (
                <TableCell key={column.id} align={column.align} sx={{ minWidth: column.minWidth }}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumnCount}>
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
    </Stack>
  )
}
