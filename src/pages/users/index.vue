<template>
  <div>
    <!-- Page header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Users</h1>
        <p class="page-subtitle">Manage users and their roles</p>
      </div>
      <BaseButton @click="openCreateModal">
        <template #icon-left><UserPlus :size="15" /></template>
        Add User
      </BaseButton>
    </div>

    <!-- DataTable -->
    <DataTable
      :data="users"
      :columns="columns"
      :actions="actions"
      :bulk-actions="bulkActions"
      :loading="false"
      selectable
      row-key="id"
      @select="selectedRows = $event"
    >
      <!-- Custom cell: name with avatar -->
      <template #cell-name="{ row }">
        <div class="user-cell">
          <div class="user-avatar-sm" :style="{ background: getAvatarColor(row.name as string) }">
            {{ getInitials(row.name as string) }}
          </div>
          <div>
            <p class="user-name">{{ row.name }}</p>
            <p class="user-email">{{ row.email }}</p>
          </div>
        </div>
      </template>

      <!-- Custom cell: role badge -->
      <template #cell-role="{ row }">
        <BaseBadge :variant="row.role === 'admin' ? 'primary' : 'default'">
          {{ row.role }}
        </BaseBadge>
      </template>

      <!-- Custom cell: status -->
      <template #cell-status="{ row }">
        <BaseBadge :variant="row.status === 'active' ? 'success' : 'danger'">
          {{ row.status }}
        </BaseBadge>
      </template>
    </DataTable>

    <!-- Create/Edit Modal -->
    <BaseModal v-model="showModal" :title="editingUser ? 'Edit User' : 'Create User'" size="md">
      <AutoForm
        :schema="userSchema"
        :model-value="formValues"
        :loading="formLoading"
        @update:model-value="formValues = $event"
        @submit="handleSubmit"
        @cancel="showModal = false"
      />
    </BaseModal>

    <!-- Delete confirmation modal -->
    <BaseModal v-model="showDeleteModal" title="Delete User" size="sm" persistent>
      <p style="color: var(--text-secondary); font-size: 0.875rem; margin: 0 0 1.25rem">
        Are you sure you want to delete <strong>{{ deletingUser?.name }}</strong>? This action cannot be undone.
      </p>
      <template #footer>
        <BaseButton variant="ghost" @click="showDeleteModal = false">Cancel</BaseButton>
        <BaseButton variant="danger" :loading="formLoading" @click="handleDelete">Delete</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { UserPlus } from '@lucide/vue'
import { DataTable } from '@/components/DataTable'
import type { DataTableColumn, DataTableAction } from '@/components/DataTable'
import { AutoForm } from '@/components/AutoForm'
import type { FormSchema } from '@/components/AutoForm'
import { useToast } from '@/core/composables/useToast'

const toast = useToast()

interface User {
  id: number
  name: string
  email: string
  role: string
  status: string
  joined: string
}

const users = ref<User[]>([
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin', status: 'active', joined: '2024-01-15' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'user', status: 'active', joined: '2024-02-20' },
  { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'user', status: 'inactive', joined: '2024-03-10' },
  { id: 4, name: 'David Lee', email: 'david@example.com', role: 'user', status: 'active', joined: '2024-04-05' },
  { id: 5, name: 'Eva Brown', email: 'eva@example.com', role: 'admin', status: 'active', joined: '2024-05-01' },
  { id: 6, name: 'Frank Chen', email: 'frank@example.com', role: 'user', status: 'active', joined: '2024-06-12' },
  { id: 7, name: 'Grace Kim', email: 'grace@example.com', role: 'user', status: 'inactive', joined: '2024-07-08' },
  { id: 8, name: 'Henry Park', email: 'henry@example.com', role: 'user', status: 'active', joined: '2024-08-22' },
])

const columns: DataTableColumn<User>[] = [
  { key: 'name', label: 'User', sortable: true },
  { key: 'role', label: 'Role', sortable: true, width: '120px' },
  { key: 'status', label: 'Status', sortable: true, width: '110px' },
  { key: 'joined', label: 'Joined', sortable: true, width: '130px' },
]

const actions: DataTableAction<User>[] = [
  { label: 'Edit', icon: 'Pencil', onClick: (row) => openEditModal(row) },
  { label: 'Delete', icon: 'Trash2', variant: 'danger', onClick: (row) => openDeleteModal(row) },
]

const bulkActions = [
  {
    label: 'Delete selected',
    variant: 'danger' as const,
    onClick: (rows: User[]) => {
      users.value = users.value.filter(u => !rows.includes(u))
      toast.success(`Deleted ${rows.length} users`)
      selectedRows.value = []
    },
  },
]

// Modal state
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingUser = ref<User | null>(null)
const deletingUser = ref<User | null>(null)
const formLoading = ref(false)
const selectedRows = ref<User[]>([])
const formValues = ref<Record<string, unknown>>({})

const userSchema: FormSchema = {
  fields: [
    { name: 'name', type: 'text', label: 'Full Name', required: true, placeholder: 'John Doe' },
    { name: 'email', type: 'email', label: 'Email', required: true, placeholder: 'john@example.com' },
    { name: 'role', type: 'select', label: 'Role', required: true, options: ['admin', 'user'], default: 'user' },
    { name: 'status', type: 'select', label: 'Status', required: true, options: ['active', 'inactive'], default: 'active' },
    {
      name: 'password', type: 'password', label: 'Password', placeholder: 'Leave blank to keep current',
      showIf: () => !editingUser.value,
    },
  ],
  columns: 2,
  submitLabel: 'Save User',
  cancelLabel: 'Cancel',
}

function openCreateModal() {
  editingUser.value = null
  formValues.value = {}
  showModal.value = true
}

function openEditModal(user: User) {
  editingUser.value = user
  formValues.value = { ...user }
  showModal.value = true
}

function openDeleteModal(user: User) {
  deletingUser.value = user
  showDeleteModal.value = true
}

async function handleSubmit(values: Record<string, unknown>) {
  formLoading.value = true
  await new Promise(r => setTimeout(r, 600))

  if (editingUser.value) {
    Object.assign(editingUser.value, values)
    toast.success('User updated successfully')
  } else {
    users.value.push({ id: Date.now(), ...values } as User)
    toast.success('User created successfully')
  }

  formLoading.value = false
  showModal.value = false
}

async function handleDelete() {
  if (!deletingUser.value) return
  formLoading.value = true
  await new Promise(r => setTimeout(r, 400))
  users.value = users.value.filter(u => u.id !== deletingUser.value!.id)
  toast.success(`${deletingUser.value.name} deleted`)
  formLoading.value = false
  showDeleteModal.value = false
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

const avatarColors = ['#059669', '#2563eb', '#9333ea', '#ea580c', '#0891b2', '#be185d']
function getAvatarColor(name: string) {
  return avatarColors[name.charCodeAt(0) % avatarColors.length]
}
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
}
.page-title { font-size: 1.375rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.25rem; }
.page-subtitle { font-size: 0.875rem; color: var(--text-secondary); margin: 0; }

.user-cell { display: flex; align-items: center; gap: 0.625rem; }

.user-avatar-sm {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 0.6875rem; font-weight: 700; flex-shrink: 0;
}

.user-name { font-size: 0.875rem; font-weight: 500; color: var(--text-primary); margin: 0; }
.user-email { font-size: 0.75rem; color: var(--text-muted); margin: 0; }
</style>
