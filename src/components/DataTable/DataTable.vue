<template>
  <div class="data-table-wrapper">
    <!-- Toolbar -->
    <div class="table-toolbar">
      <!-- Search -->
      <div class="table-search">
        <Search :size="15" class="search-icon" />
        <input
          v-model="searchQuery"
          type="search"
          class="search-input"
          :placeholder="searchPlaceholder"
        />
      </div>

      <!-- Right side toolbar -->
      <div class="toolbar-right">
        <!-- Bulk actions -->
        <Transition name="fade">
          <div v-if="selectedRows.length > 0 && bulkActions.length > 0" class="bulk-actions">
            <span class="bulk-count">{{ selectedRows.length }} selected</span>
            <button
              v-for="action in bulkActions"
              :key="action.label"
              class="bulk-btn"
              :class="action.variant === 'danger' ? 'bulk-btn-danger' : ''"
              @click="action.onClick(selectedRows)"
            >
              {{ action.label }}
            </button>
          </div>
        </Transition>

        <!-- Column toggle -->
        <div v-if="columnToggle" class="col-toggle-wrapper">
          <button class="toolbar-btn" @click="colToggleOpen = !colToggleOpen" title="Toggle columns">
            <Columns3 :size="15" />
          </button>
          <div v-if="colToggleOpen" class="col-toggle-dropdown card">
            <p class="col-toggle-title">Visible columns</p>
            <label
              v-for="col in columns"
              :key="col.key"
              class="col-toggle-item"
            >
              <input v-model="visibleKeys" type="checkbox" :value="col.key" class="checkbox-native" />
              <span class="checkbox-box" :class="{ checked: visibleKeys.includes(col.key) }">
                <Check v-if="visibleKeys.includes(col.key)" :size="11" class="check-icon" />
              </span>
              <span>{{ col.label }}</span>
            </label>
          </div>
        </div>

        <slot name="toolbar-right" />
      </div>
    </div>

    <!-- Table -->
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <!-- Checkbox column -->
            <th v-if="selectable" class="th th-check">
              <label class="custom-checkbox" @click.stop>
                <input
                  type="checkbox"
                  class="checkbox-native"
                  :checked="allSelected"
                  :indeterminate="someSelected && !allSelected"
                  @change="toggleAll"
                />
                <span class="checkbox-box" :class="{ checked: allSelected, indeterminate: someSelected && !allSelected }">
                  <Check v-if="allSelected" :size="12" class="check-icon" />
                  <Minus v-else-if="someSelected" :size="12" class="minus-icon" />
                </span>
              </label>
            </th>

            <th
              v-for="col in visibleColumns"
              :key="col.key"
              class="th"
              :class="[`text-${col.align ?? 'left'}`, { sortable: col.sortable }]"
              :style="col.width ? { width: col.width } : {}"
              @click="col.sortable ? toggleSort(col.key) : undefined"
            >
              <span class="th-content">
                {{ col.label }}
                <span v-if="col.sortable" class="sort-icon">
                  <ArrowUp v-if="sort?.key === col.key && sort.direction === 'asc'" :size="12" />
                  <ArrowDown v-else-if="sort?.key === col.key && sort.direction === 'desc'" :size="12" />
                  <ChevronsUpDown v-else :size="12" class="sort-idle" />
                </span>
              </span>
            </th>

            <!-- Actions column -->
            <th v-if="actions.length > 0" class="th th-actions">Actions</th>
          </tr>
        </thead>

        <tbody>
          <!-- Empty state -->
          <tr v-if="paginatedData.length === 0">
            <td :colspan="totalCols" class="empty-cell">
              <div class="empty-state">
                <Inbox :size="36" />
                <p>{{ emptyText }}</p>
              </div>
            </td>
          </tr>

          <!-- Loading skeleton -->
          <template v-else-if="loading">
            <tr v-for="i in pagination.perPage" :key="i" class="skeleton-row">
              <td v-if="selectable" class="td-check"><div class="skeleton" style="width:15px;height:15px;border-radius:3px" /></td>
              <td v-for="col in visibleColumns" :key="col.key" class="td">
                <div class="skeleton" :style="{ width: `${Math.random() * 40 + 40}%` }" />
              </td>
              <td v-if="actions.length" class="td-actions"><div class="skeleton" style="width:60px" /></td>
            </tr>
          </template>

          <!-- Data rows -->
          <tr
            v-else
            v-for="(row, i) in paginatedData"
            :key="getRowKey(row, i)"
            class="tr"
            :class="{ selected: isSelected(row) }"
            @click="selectable ? toggleRow(row) : undefined"
          >
            <td v-if="selectable" class="td-check" @click.stop="toggleRow(row)">
              <label class="custom-checkbox" @click.stop>
                <input
                  type="checkbox"
                  class="checkbox-native"
                  :checked="isSelected(row)"
                  @change="toggleRow(row)"
                />
                <span class="checkbox-box" :class="{ checked: isSelected(row) }">
                  <Check v-if="isSelected(row)" :size="12" class="check-icon" />
                </span>
              </label>
            </td>

            <td
              v-for="col in visibleColumns"
              :key="col.key"
              class="td"
              :class="`text-${col.align ?? 'left'}`"
            >
              <!-- Named slot for custom cell rendering -->
              <slot :name="`cell-${col.key}`" :row="row" :value="getCellValue(row, col.key)">
                <span v-if="col.format">{{ col.format(getCellValue(row, col.key), row) }}</span>
                <span v-else>{{ getCellValue(row, col.key) }}</span>
              </slot>
            </td>

            <!-- Actions -->
            <td v-if="actions.length > 0" class="td td-actions" @click.stop>
              <div class="action-btns">
                <template v-for="action in actions" :key="action.label">
                  <button
                    v-if="!action.show || action.show(row)"
                    class="action-btn"
                    :class="action.variant === 'danger' ? 'action-danger' : ''"
                    :title="action.label"
                    @click.stop="action.onClick(row)"
                  >
                    <component :is="getActionIcon(action.icon)" :size="14" />
                  </button>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 0" class="table-pagination">
      <div class="pagination-info">
        Showing {{ paginationFrom }}–{{ paginationTo }} of {{ filteredData.length }} results
      </div>

      <div class="pagination-controls">
        <!-- Per page -->
        <select v-model.number="pagination.perPage" class="per-page-select" @change="pagination.page = 1">
          <option v-for="n in perPageOptions" :key="n" :value="n">{{ n }} / page</option>
        </select>

        <!-- Page buttons -->
        <button class="page-btn" :disabled="pagination.page <= 1" @click="pagination.page--">
          <ChevronLeft :size="15" />
        </button>

        <template v-for="p in pageNumbers" :key="p">
          <span v-if="p === '...'" class="page-ellipsis">…</span>
          <button
            v-else
            class="page-btn"
            :class="{ active: p === pagination.page }"
            @click="pagination.page = Number(p)"
          >{{ p }}</button>
        </template>

        <button class="page-btn" :disabled="pagination.page >= totalPages" @click="pagination.page++">
          <ChevronRight :size="15" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, unknown>">
import {
  ArrowDown, ArrowUp, Check, ChevronLeft, ChevronRight,
  ChevronsUpDown, Columns3, Inbox, Minus, Search,
} from '@lucide/vue'
import * as LucideIcons from '@lucide/vue'
import type { Component } from 'vue'
import type { DataTableAction, DataTableColumn, SortState } from './types'

const props = withDefaults(defineProps<{
  data: T[]
  columns: DataTableColumn<T>[]
  actions?: DataTableAction<T>[]
  bulkActions?: Array<{ label: string; variant?: 'default' | 'danger'; onClick: (rows: T[]) => void }>
  loading?: boolean
  selectable?: boolean
  columnToggle?: boolean
  searchPlaceholder?: string
  emptyText?: string
  rowKey?: keyof T | ((row: T) => string)
}>(), {
  actions: () => [],
  bulkActions: () => [],
  loading: false,
  selectable: false,
  columnToggle: true,
  searchPlaceholder: 'Search...',
  emptyText: 'No data found',
})

const emit = defineEmits<{
  'sort': [sort: SortState]
  'select': [rows: T[]]
}>()

// State
const searchQuery = ref('')
const sort = ref<SortState | null>(null)
const colToggleOpen = ref(false)
const selectedRows = shallowRef<T[]>([])
const visibleKeys = ref<string[]>(
  props.columns.filter(c => !c.hidden).map(c => c.key)
)
const perPageOptions = [10, 25, 50, 100]
const pagination = reactive({ page: 1, perPage: 10 })

// Filtered + sorted data
const filteredData = computed(() => {
  let result = [...props.data]
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(row =>
      Object.values(row).some(v => String(v).toLowerCase().includes(q))
    )
  }
  if (sort.value) {
    const { key, direction } = sort.value
    result.sort((a, b) => {
      const av = a[key]; const bv = b[key]
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
      return direction === 'asc' ? cmp : -cmp
    })
  }
  return result
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / pagination.perPage))
const paginatedData = computed(() => {
  const start = (pagination.page - 1) * pagination.perPage
  return filteredData.value.slice(start, start + pagination.perPage)
})
const paginationFrom = computed(() => Math.min((pagination.page - 1) * pagination.perPage + 1, filteredData.value.length))
const paginationTo = computed(() => Math.min(pagination.page * pagination.perPage, filteredData.value.length))

const visibleColumns = computed(() => props.columns.filter(c => visibleKeys.value.includes(c.key)))
const totalCols = computed(() => visibleColumns.value.length + (props.selectable ? 1 : 0) + (props.actions.length > 0 ? 1 : 0))

// Sorting
function toggleSort(key: string) {
  if (sort.value?.key === key) {
    sort.value = sort.value.direction === 'asc' ? { key, direction: 'desc' } : null
  } else {
    sort.value = { key, direction: 'asc' }
  }
  if (sort.value) emit('sort', sort.value)
  pagination.page = 1
}

// Selection
const allSelected = computed(() => paginatedData.value.length > 0 && paginatedData.value.every(isSelected))
const someSelected = computed(() => paginatedData.value.some(isSelected) && !allSelected.value)

function isSelected(row: T) { return selectedRows.value.includes(row) }

function toggleRow(row: T) {
  const idx = selectedRows.value.indexOf(row)
  if (idx === -1) selectedRows.value.push(row)
  else selectedRows.value.splice(idx, 1)
  emit('select', selectedRows.value)
}

function toggleAll() {
  if (allSelected.value) {
    paginatedData.value.forEach(row => {
      const idx = selectedRows.value.indexOf(row)
      if (idx !== -1) selectedRows.value.splice(idx, 1)
    })
  } else {
    paginatedData.value.forEach(row => { if (!isSelected(row)) selectedRows.value.push(row) })
  }
  emit('select', selectedRows.value)
}

// Page numbers with ellipsis
const pageNumbers = computed((): Array<number | '...'> => {
  const total = totalPages.value
  const current = pagination.page
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: Array<number | '...'> = [1]
  if (current > 3) pages.push('...')
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p)
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
})

// Helpers
function getCellValue(row: T, key: string): unknown { return row[key] }
function getRowKey(row: T, i: number): string {
  if (!props.rowKey) return String(i)
  if (typeof props.rowKey === 'function') return props.rowKey(row)
  return String(row[props.rowKey])
}
function getActionIcon(icon?: string): Component | string {
  if (!icon) return 'span'
  return (LucideIcons as unknown as Record<string, Component>)[icon] ?? 'span'
}

// Reset page on search
watch(searchQuery, () => { pagination.page = 1 })

// Close column toggle on outside click
onMounted(() => {
  document.addEventListener('click', (e) => {
    const el = document.querySelector('.col-toggle-wrapper')
    if (el && !el.contains(e.target as Node)) colToggleOpen.value = false
  })
})
</script>

<style scoped>
.data-table-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
}

/* Toolbar */
.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--border-color);
  gap: 0.75rem;
  flex-wrap: wrap;
}

.table-search {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 320px;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 34px;
  padding: 0 0.75rem 0 2.25rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-app);
  color: var(--text-primary);
  font-size: 0.8125rem;
  outline: none;
  font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.search-input:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgb(16 185 129 / 0.1); }
.search-input::placeholder { color: var(--text-muted); }

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bulk-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-surface-raised);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.25rem 0.625rem;
}

.bulk-count {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.bulk-btn {
  font-size: 0.8125rem;
  padding: 0.25rem 0.625rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-surface);
  color: var(--text-secondary);
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.bulk-btn:hover { background: var(--border-color); }
.bulk-btn-danger { color: #dc2626; border-color: #fecaca; }
.bulk-btn-danger:hover { background: #fef2f2; }

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-surface);
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.15s;
}
.toolbar-btn:hover { background: var(--border-color); }

.col-toggle-wrapper { position: relative; }

.col-toggle-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  width: 200px;
  padding: 0.75rem;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.col-toggle-title {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  margin: 0 0 0.25rem;
}

.col-toggle-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  cursor: pointer;
}

.col-checkbox { accent-color: #10b981; }

/* Table */
.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.table {
  width: 100%;
  min-width: 600px;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
  background: var(--bg-surface-raised);
  border-bottom: 1px solid var(--border-color);
}

.th.sortable { cursor: pointer; user-select: none; }
.th.sortable:hover { color: var(--text-primary); }

.th-check, .td-check {
  padding: 0.75rem 0.75rem 0.75rem 1.25rem;
  width: 44px;
  text-align: center;
  vertical-align: middle;
}

.th-actions {
  text-align: right;
  padding-right: 1.5rem;
  width: 1%;
  white-space: nowrap;
}

.td-actions {
  text-align: right;
  padding-right: 1.5rem !important;
  width: 1%;
  white-space: nowrap;
  vertical-align: middle;
}

.th-content {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.sort-idle { color: var(--text-muted); opacity: 0.5; }
.th.sortable:hover .sort-idle { opacity: 1; }

.tr {
  border-bottom: 1px solid var(--border-color);
  transition: background 0.1s;
}

.tr:last-child { border-bottom: none; }
.tr:hover { background: var(--bg-surface-raised); }
.tr.selected { background: rgba(16, 185, 129, 0.08); }

.td {
  padding: 0.875rem 1rem;
  color: var(--text-primary);
  vertical-align: middle;
}

.text-left   { text-align: left; }
.text-center { text-align: center; }
.text-right  { text-align: right; }

/* Custom Checkbox */
.custom-checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  position: relative;
  vertical-align: middle;
}

.checkbox-native {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  margin: 0;
  pointer-events: none;
}

.checkbox-box {
  width: 17px;
  height: 17px;
  border-radius: 4px;
  border: 1.5px solid var(--border-color);
  background-color: var(--bg-surface);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.custom-checkbox:hover .checkbox-box {
  border-color: #10b981;
  background-color: rgba(16, 185, 129, 0.06);
}

.checkbox-box.checked,
.checkbox-box.indeterminate {
  background-color: #10b981;
  border-color: #10b981;
  box-shadow: 0 1px 2px rgba(16, 185, 129, 0.25);
}

.checkbox-native:focus-visible + .checkbox-box {
  outline: 2px solid rgba(16, 185, 129, 0.5);
  outline-offset: 1px;
}

.check-icon,
.minus-icon {
  stroke-width: 3;
}

/* Action buttons */
.action-btns {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.375rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.action-btn:hover { background: var(--border-color); color: var(--text-primary); }
.action-danger:hover { background: #fef2f2; color: #dc2626; border-color: #fecaca; }

/* Empty & loading */
.empty-cell { padding: 3rem 1rem; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
}

.empty-state p {
  font-size: 0.875rem;
  margin: 0;
}

.skeleton-row td { padding: 0.875rem 1rem; }

.skeleton {
  height: 14px;
  background: linear-gradient(90deg, var(--border-color) 25%, var(--bg-surface-raised) 50%, var(--border-color) 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer { to { background-position: -200% 0; } }

/* Pagination */
.table-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  border-top: 1px solid var(--border-color);
  flex-wrap: wrap;
  gap: 0.75rem;
}

.pagination-info {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.per-page-select {
  height: 30px;
  padding: 0 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-size: 0.8125rem;
  font-family: inherit;
  cursor: pointer;
  margin-right: 0.5rem;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  height: 30px;
  padding: 0 0.375rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-size: 0.8125rem;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.page-btn:hover:not(:disabled) { background: var(--border-color); }
.page-btn.active { background: #10b981; color: white; border-color: #10b981; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.page-ellipsis { padding: 0 0.25rem; color: var(--text-muted); font-size: 0.875rem; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
