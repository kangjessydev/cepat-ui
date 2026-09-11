// src/components/index.ts
// Main barrel export untuk semua UI components

// Primitives
export { default as BaseButton } from './BaseButton.vue'
export { default as BaseBadge } from './BaseBadge.vue'
export { default as BaseModal } from './BaseModal.vue'
export { default as BaseBottomSheet } from './BaseBottomSheet.vue'
export { default as BaseCard } from './BaseCard.vue'
export { default as BaseAlert } from './BaseAlert.vue'
export type { AlertVariant } from './BaseAlert.vue'
export { default as BaseTabs } from './BaseTabs.vue'
export type { TabItem } from './BaseTabs.vue'
export { default as BaseDatePicker } from './BaseDatePicker.vue'
export { default as StatCard } from './StatCard.vue'

// DataTable
export { DataTable } from './DataTable'
export type { DataTableColumn, DataTableAction, SortState } from './DataTable'

// AutoForm
export { AutoForm, FormField } from './AutoForm'
export type { FormSchema, FieldSchema, FieldType } from './AutoForm'

