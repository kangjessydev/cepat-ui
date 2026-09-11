// src/components/index.ts
// Main barrel export untuk semua UI components

// Primitives
export { default as BaseButton } from './BaseButton.vue'
export { default as BaseBadge } from './BaseBadge.vue'
export { default as BaseModal } from './BaseModal.vue'
export { default as StatCard } from './StatCard.vue'

// DataTable
export { DataTable } from './DataTable'
export type { DataTableColumn, DataTableAction, SortState } from './DataTable'

// AutoForm
export { AutoForm, FormField } from './AutoForm'
export type { FormSchema, FieldSchema, FieldType } from './AutoForm'
