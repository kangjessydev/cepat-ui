// src/components/DataTable/types.ts

export interface DataTableColumn<T = Record<string, unknown>> {
  /** Unique key, matches object property */
  key: string
  /** Column header label */
  label: string
  /** Whether this column is sortable */
  sortable?: boolean
  /** Column width (CSS value) */
  width?: string
  /** Text alignment */
  align?: 'left' | 'center' | 'right'
  /** Custom render — return a string, or use named slot `cell-{key}` */
  format?: (value: unknown, row: T) => string
  /** Whether to hide this column by default in column toggle */
  hidden?: boolean
}

export interface DataTableAction<T = Record<string, unknown>> {
  label: string
  icon?: string
  variant?: 'default' | 'danger'
  show?: (row: T) => boolean
  onClick: (row: T) => void
}

export interface SortState {
  key: string
  direction: 'asc' | 'desc'
}

export interface PaginationState {
  page: number
  perPage: number
  total: number
}
