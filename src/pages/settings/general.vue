<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">General Settings</h1>
      <p class="page-subtitle">Manage your application preferences</p>
    </div>

    <div class="settings-layout">
      <!-- Profile section -->
      <div class="settings-section card">
        <div class="section-header">
          <h2 class="section-title">Profile</h2>
          <p class="section-desc">Update your personal information</p>
        </div>
        <AutoForm
          :schema="profileSchema"
          :model-value="profileValues"
          :loading="loading"
          @update:model-value="profileValues = $event"
          @submit="handleProfileSave"
        />
      </div>

      <!-- App preferences -->
      <div class="settings-section card">
        <div class="section-header">
          <h2 class="section-title">Preferences</h2>
          <p class="section-desc">Customize how the app behaves</p>
        </div>
        <AutoForm
          :schema="prefsSchema"
          :model-value="prefsValues"
          :loading="loading"
          @update:model-value="prefsValues = $event"
          @submit="handlePrefsSave"
        />
      </div>

      <!-- Danger zone -->
      <div class="settings-section card danger-zone">
        <div class="section-header">
          <h2 class="section-title danger-title">Danger Zone</h2>
          <p class="section-desc">Irreversible actions. Proceed with caution.</p>
        </div>
        <div class="danger-actions">
          <div class="danger-item">
            <div>
              <p class="danger-item-label">Delete Account</p>
              <p class="danger-item-desc">Permanently delete your account and all data.</p>
            </div>
            <BaseButton variant="danger" size="sm" @click="showDeleteModal = true">
              Delete Account
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete confirmation -->
    <BaseModal v-model="showDeleteModal" title="Delete Account" size="sm" persistent>
      <p style="color: var(--text-secondary); font-size: 0.875rem; margin: 0">
        This will permanently delete your account. This action <strong>cannot be undone</strong>.
      </p>
      <template #footer>
        <BaseButton variant="ghost" @click="showDeleteModal = false">Cancel</BaseButton>
        <BaseButton variant="danger" @click="showDeleteModal = false">I understand, delete</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { AutoForm } from '@/components/AutoForm'
import type { FormSchema } from '@/components/AutoForm'
import { useToast } from '@/core/composables/useToast'
import { useAuth } from '@/core/composables/useAuth'

const toast = useToast()
const auth = useAuth()

const loading = ref(false)
const showDeleteModal = ref(false)

const profileValues = ref<Record<string, unknown>>({
  name: auth.user.value?.name ?? '',
  email: auth.user.value?.email ?? '',
  bio: '',
})

const prefsValues = ref<Record<string, unknown>>({
  language: 'en',
  timezone: 'Asia/Jakarta',
  email_notifications: true,
  marketing_emails: false,
})

const profileSchema: FormSchema = {
  fields: [
    { name: 'name', type: 'text', label: 'Full Name', required: true },
    { name: 'email', type: 'email', label: 'Email', required: true },
    { name: 'bio', type: 'textarea', label: 'Bio', placeholder: 'Tell us about yourself...', span: 2 },
    { name: 'current_password', type: 'password', label: 'Current Password', placeholder: 'Only if changing password' },
    { name: 'new_password', type: 'password', label: 'New Password', placeholder: 'Leave blank to keep current' },
  ],
  columns: 2,
  submitLabel: 'Save Profile',
}

const prefsSchema: FormSchema = {
  fields: [
    {
      name: 'language', type: 'select', label: 'Language',
      options: [{ label: 'English', value: 'en' }, { label: 'Bahasa Indonesia', value: 'id' }],
    },
    {
      name: 'timezone', type: 'select', label: 'Timezone',
      options: ['Asia/Jakarta', 'Asia/Singapore', 'UTC', 'America/New_York'],
    },
    { name: 'email_notifications', type: 'toggle', label: 'Email Notifications', span: 2 },
    { name: 'marketing_emails', type: 'toggle', label: 'Marketing Emails', span: 2 },
  ],
  columns: 2,
  submitLabel: 'Save Preferences',
}

async function handleProfileSave() {
  loading.value = true
  await new Promise(r => setTimeout(r, 700))
  toast.success('Profile updated successfully')
  loading.value = false
}

async function handlePrefsSave() {
  loading.value = true
  await new Promise(r => setTimeout(r, 500))
  toast.success('Preferences saved')
  loading.value = false
}
</script>

<style scoped>
.page-header { margin-bottom: 1.5rem; }
.page-title { font-size: 1.375rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.25rem; }
.page-subtitle { font-size: 0.875rem; color: var(--text-secondary); margin: 0; }

.settings-layout { display: flex; flex-direction: column; gap: 1.25rem; }

.settings-section { padding: 1.5rem; }

.section-header { margin-bottom: 1.5rem; }
.section-title { font-size: 1rem; font-weight: 600; color: var(--text-primary); margin: 0 0 0.25rem; }
.section-desc { font-size: 0.875rem; color: var(--text-secondary); margin: 0; }

.danger-zone { border-color: #fecaca; }
.danger-title { color: #dc2626; }

.danger-actions { display: flex; flex-direction: column; gap: 0.75rem; }

.danger-item {
  display: flex; align-items: center; justify-content: space-between;
  gap: 1rem; padding: 1rem; background: #fef2f2;
  border: 1px solid #fecaca; border-radius: 8px;
}

.danger-item-label { font-size: 0.875rem; font-weight: 500; color: #b91c1c; margin: 0 0 0.25rem; }
.danger-item-desc { font-size: 0.8125rem; color: #dc2626; margin: 0; opacity: 0.8; }
</style>
