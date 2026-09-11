<template>
  <div class="page-container">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Products</h1>
        <p class="page-subtitle">Manage, filter, and inspect your products</p>
      </div>
      <BaseButton variant="primary" @click="openCreateModal">
        <template #icon>
          <Plus :size="16" />
        </template>
        Add Products
      </BaseButton>
    </div>

    <!-- Data Table -->
    <DataTable
      :columns="columns"
      :data="items"
      :actions="actions"
      :bulk-actions="bulkActions"
      selectable
      search-placeholder="Search products..."
    >
      <!-- Custom status cell -->
      <template #cell-status="{ value }">
        <BaseBadge
          :variant="value === 'Active' ? 'success' : value === 'Pending' ? 'warning' : 'default'"
          dot
        >
          {{ value }}
        </BaseBadge>
      </template>
    </DataTable>

    <!-- Create / Edit Modal -->
    <BaseModal
      v-model="modalOpen"
      :title="editingItem ? 'Edit Products' : 'Add New Products'"
      :subtitle="editingItem ? 'Update details below' : 'Fill in the details below'"
      size="md"
    >
      <AutoForm
        :schema="formSchema"
        :initial-values="editingItem ?? {}"
        :submit-label="editingItem ? 'Save Changes' : 'Create Products'"
        @submit="handleSubmit"
        @cancel="modalOpen = false"
      />
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseModal
      v-model="deleteModalOpen"
      title="Delete Products"
      subtitle="Are you sure you want to delete this record? This action cannot be undone."
      size="sm"
    >
      <div class="flex justify-end gap-2 pt-2">
        <BaseButton variant="secondary" @click="deleteModalOpen = false">
          Cancel
        </BaseButton>
        <BaseButton variant="danger" @click="confirmDelete">
          Delete
        </BaseButton>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@lucide/vue'
import type { DataTableColumn, DataTableAction } from '@/components/DataTable'
import type { FormSchema } from '@/components/AutoForm'
import { useToast } from '@/core/composables/useToast'

const toast = useToast()

interface ProductsItem extends Record<string, unknown> {
  id: number
  name: string
  category: string
  status: string
}

// Table columns
const columns: DataTableColumn<ProductsItem>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
]

// Mock data
const items = ref<ProductsItem[]>([
  {
    "id": 1,
    "name": "Sample name 1",
    "category": "Active",
    "status": "Active"
  },
  {
    "id": 2,
    "name": "Sample name 2",
    "category": "Pending",
    "status": "Pending"
  },
])

// Form Schema for AutoForm
const formSchema: FormSchema = {
  columns: 1,
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'Enter name...',
      required: true,
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      options: ['Active', 'Pending', 'Archived'],
      required: true,
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: ['Active', 'Pending', 'Archived'],
      required: true,
    },
  ],
}

// Modal state
const modalOpen = ref(false)
const deleteModalOpen = ref(false)
const editingItem = ref<ProductsItem | null>(null)
const itemToDelete = ref<ProductsItem | null>(null)

function openCreateModal() {
  editingItem.value = null
  modalOpen.value = true
}

function openEditModal(item: ProductsItem) {
  editingItem.value = { ...item }
  modalOpen.value = true
}

function openDeleteModal(item: ProductsItem) {
  itemToDelete.value = item
  deleteModalOpen.value = true
}

function handleSubmit(values: Record<string, unknown>) {
  if (editingItem.value) {
    const idx = items.value.findIndex(i => i.id === editingItem.value!.id)
    if (idx !== -1) {
      items.value[idx] = { ...items.value[idx], ...values } as ProductsItem
      toast.success('Products updated successfully')
    }
  } else {
    const newItem: ProductsItem = {
      id: Date.now(),
      ...values,
    } as ProductsItem
    items.value.unshift(newItem)
    toast.success('New products created successfully')
  }
  modalOpen.value = false
}

function confirmDelete() {
  if (itemToDelete.value) {
    items.value = items.value.filter(i => i.id !== itemToDelete.value!.id)
    toast.success('Products deleted')
  }
  deleteModalOpen.value = false
}

// Row actions
const actions: DataTableAction<ProductsItem>[] = [
  { label: 'Edit', icon: 'Pencil', onClick: openEditModal },
  { label: 'Delete', icon: 'Trash2', variant: 'danger', onClick: openDeleteModal },
]

// Bulk actions
const bulkActions = [
  {
    label: 'Delete Selected',
    variant: 'danger' as const,
    onClick: (selected: ProductsItem[]) => {
      items.value = items.value.filter(i => !selected.some(s => s.id === i.id))
      toast.success(`${selected.length} items deleted`)
    },
  },
]
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.page-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--color-gray-900);
  margin: 0;
}

.page-subtitle {
  font-size: 0.875rem;
  color: var(--color-gray-500);
  margin: 0.25rem 0 0;
}
</style>
