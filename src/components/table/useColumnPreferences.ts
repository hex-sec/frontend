import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

export type ColumnDefinition<T> = {
  id: string
  label: string
  description?: string
  defaultVisible?: boolean
  disableToggle?: boolean
  render: (row: T) => ReactNode
  minWidth?: number
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify'
}

export type ColumnPreferenceState = {
  order: string[]
  hidden: string[]
}

type UseColumnPreferencesReturn<T> = {
  orderedColumns: ColumnDefinition<T>[]
  visibleColumns: ColumnDefinition<T>[]
  hiddenColumns: string[]
  columnOrder: string[]
  toggleColumnVisibility: (id: string) => void
  moveColumn: (id: string, toIndex: number) => void
  resetColumns: () => void
  isColumnVisible: (id: string) => boolean
}

function sanitizeState(
  state: ColumnPreferenceState,
  defaults: ColumnPreferenceState,
  columnIds: string[],
  disableToggleMap: Map<string, boolean>,
): ColumnPreferenceState {
  let order = state.order.filter((id) => columnIds.includes(id))
  let hidden = state.hidden.filter((id) => columnIds.includes(id) && !disableToggleMap.get(id))

  const missing = columnIds.filter((id) => !order.includes(id))
  if (missing.length > 0) {
    order = [...order, ...missing]
  }

  const disabledHidden = columnIds.filter((id) => disableToggleMap.get(id))
  if (disabledHidden.some((id) => hidden.includes(id))) {
    hidden = hidden.filter((id) => !disabledHidden.includes(id))
  }

  const defaultHidden = defaults.hidden.filter((id) => !hidden.includes(id))
  if (defaultHidden.length > 0) {
    hidden = [...hidden, ...defaultHidden]
  }

  return { order, hidden }
}

export function useColumnPreferences<T>(
  storageKey: string,
  columns: ColumnDefinition<T>[],
): UseColumnPreferencesReturn<T> {
  const columnMap = useMemo(() => {
    const map = new Map<string, ColumnDefinition<T>>()
    columns.forEach((column) => {
      map.set(column.id, column)
    })
    return map
  }, [columns])

  const disableToggleMap = useMemo(() => {
    const map = new Map<string, boolean>()
    columns.forEach((column) => {
      if (column.disableToggle) {
        map.set(column.id, true)
      }
    })
    return map
  }, [columns])

  const defaults = useMemo<ColumnPreferenceState>(() => {
    const order = columns.map((column) => column.id)
    const hidden = columns
      .filter((column) => column.defaultVisible === false && !column.disableToggle)
      .map((column) => column.id)
    return { order, hidden }
  }, [columns])

  const columnIds = useMemo(() => columns.map((column) => column.id), [columns])

  const [state, setState] = useState<ColumnPreferenceState>(() => {
    if (typeof window === 'undefined') {
      return defaults
    }

    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw) as ColumnPreferenceState
        if (parsed && Array.isArray(parsed.order) && Array.isArray(parsed.hidden)) {
          return sanitizeState(parsed, defaults, columnIds, disableToggleMap)
        }
      }
    } catch (error) {
      console.warn(
        'Failed to parse column preferences from localStorage:',
        error instanceof Error ? error.message : error,
      )
      // ignore parsing errors and fall back to defaults
    }

    return defaults
  })

  useEffect(() => {
    setState((prev) => sanitizeState(prev, defaults, columnIds, disableToggleMap))
  }, [defaults, columnIds, disableToggleMap])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(storageKey, JSON.stringify(state))
  }, [state, storageKey])

  const toggleColumnVisibility = useCallback(
    (id: string) => {
      if (disableToggleMap.get(id)) return
      setState((prev) => {
        const hiddenSet = new Set(prev.hidden)
        if (hiddenSet.has(id)) {
          hiddenSet.delete(id)
        } else {
          hiddenSet.add(id)
        }
        return { ...prev, hidden: Array.from(hiddenSet) }
      })
    },
    [disableToggleMap],
  )

  const moveColumn = useCallback((id: string, toIndex: number) => {
    setState((prev) => {
      const order = [...prev.order]
      const fromIndex = order.indexOf(id)
      if (fromIndex === -1 || toIndex < 0 || toIndex >= order.length) {
        return prev
      }
      if (fromIndex === toIndex) {
        return prev
      }
      order.splice(fromIndex, 1)
      order.splice(toIndex, 0, id)
      return { ...prev, order }
    })
  }, [])

  const resetColumns = useCallback(() => {
    setState({ order: [...defaults.order], hidden: [...defaults.hidden] })
  }, [defaults])

  const hiddenColumns = state.hidden
  const orderedColumns = useMemo(
    () => state.order.map((id) => columnMap.get(id)).filter(Boolean) as ColumnDefinition<T>[],
    [state.order, columnMap],
  )
  const visibleColumns = useMemo(
    () => orderedColumns.filter((column) => !hiddenColumns.includes(column.id)),
    [orderedColumns, hiddenColumns],
  )

  const isColumnVisible = useCallback((id: string) => !hiddenColumns.includes(id), [hiddenColumns])

  return {
    orderedColumns,
    visibleColumns,
    hiddenColumns,
    columnOrder: state.order,
    toggleColumnVisibility,
    moveColumn,
    resetColumns,
    isColumnVisible,
  }
}
