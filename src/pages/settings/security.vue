<template>
  <div class="security-page">
    <div class="page-header">
      <h1 class="page-title">Security Settings</h1>
      <p class="page-subtitle">Manage your account authentication, password, and active sessions</p>
    </div>

    <div class="settings-layout">
      <!-- Change Password -->
      <div class="settings-section card">
        <div class="section-header">
          <h2 class="section-title">Change Password</h2>
          <p class="section-desc">Ensure your account is using a long, random password to stay secure.</p>
        </div>
        <AutoForm
          :schema="passwordSchema"
          :model-value="passwordValues"
          :loading="loadingPassword"
          @update:model-value="passwordValues = $event"
          @submit="handlePasswordSave"
        />
      </div>

      <!-- Two-Factor Authentication -->
      <div class="settings-section card">
        <div class="section-header">
          <div class="flex-header">
            <div>
              <h2 class="section-title">Two-Factor Authentication</h2>
              <p class="section-desc">Add additional security to your account using TOTP two-factor authentication.</p>
            </div>
            <BaseBadge :variant="twoFactorEnabled ? 'success' : 'default'">
              {{ twoFactorEnabled ? 'Enabled' : 'Disabled' }}
            </BaseBadge>
          </div>
        </div>

        <div class="two-factor-content">
          <p class="text-info">
            When two-factor authentication is enabled, you will be prompted for a secure, random token during authentication from your Google Authenticator or 1Password app.
          </p>
          <div class="two-factor-actions">
            <BaseButton
              :variant="twoFactorEnabled ? 'danger' : 'primary'"
              size="sm"
              @click="toggleTwoFactor"
            >
              {{ twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA' }}
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Browser Sessions -->
      <div class="settings-section card">
        <div class="section-header">
          <h2 class="section-title">Active Sessions</h2>
          <p class="section-desc">Manage and log out your active sessions on other browsers and devices.</p>
        </div>

        <div class="sessions-list">
          <div v-for="session in sessions" :key="session.id" class="session-item">
            <div class="session-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <div class="session-details">
              <div class="session-agent">
                <span class="font-medium">{{ session.device }}</span>
                <BaseBadge v-if="session.current" variant="success" size="sm">This device</BaseBadge>
              </div>
              <p class="session-meta">{{ session.ip }} &bull; {{ session.location }} &bull; Last active {{ session.lastActive }}</p>
            </div>
          </div>
        </div>

        <div class="session-actions">
          <BaseButton variant="outline" size="sm" @click="handleRevokeSessions">
            Log Out Other Browser Sessions
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AutoForm } from '@/components/AutoForm'
import type { FormSchema } from '@/components/AutoForm'
import { useToast } from '@/core/composables/useToast'

const toast = useToast()

const loadingPassword = ref(false)
const twoFactorEnabled = ref(false)

const passwordValues = ref<Record<string, unknown>>({
  current_password: '',
  new_password: '',
  new_password_confirmation: '',
})

const passwordSchema: FormSchema = {
  fields: [
    {
      name: 'current_password',
      type: 'password',
      label: 'Current Password',
      required: true,
      placeholder: 'Enter your current password',
    },
    {
      name: 'new_password',
      type: 'password',
      label: 'New Password',
      required: true,
      placeholder: 'Minimum 8 characters',
    },
    {
      name: 'new_password_confirmation',
      type: 'password',
      label: 'Confirm New Password',
      required: true,
      placeholder: 'Repeat your new password',
    },
  ],
  columns: 1,
  submitLabel: 'Update Password',
}

const sessions = ref([
  {
    id: '1',
    device: 'Chrome on Linux (Ubuntu)',
    ip: '127.0.0.1',
    location: 'Localhost',
    lastActive: 'Just now',
    current: true,
  },
  {
    id: '2',
    device: 'Safari on iPhone 15 Pro',
    ip: '192.168.1.45',
    location: 'Jakarta, Indonesia',
    lastActive: '2 days ago',
    current: false,
  },
])

async function handlePasswordSave(values: Record<string, unknown>) {
  if (values.new_password !== values.new_password_confirmation) {
    toast.error('New password and confirmation do not match', 'Validation Error')
    return
  }
  loadingPassword.value = true
  await new Promise(r => setTimeout(r, 600))
  toast.success('Password updated successfully')
  passwordValues.value = {
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  }
  loadingPassword.value = false
}

function toggleTwoFactor() {
  twoFactorEnabled.value = !twoFactorEnabled.value
  if (twoFactorEnabled.value) {
    toast.success('Two-factor authentication enabled')
  } else {
    toast.info('Two-factor authentication disabled')
  }
}

function handleRevokeSessions() {
  sessions.value = sessions.value.filter(s => s.current)
  toast.success('Logged out from all other sessions')
}
</script>

<style scoped>
.page-header { margin-bottom: 1.5rem; }
.page-title { font-size: 1.375rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.25rem; }
.page-subtitle { font-size: 0.875rem; color: var(--text-secondary); margin: 0; }

.settings-layout { display: flex; flex-direction: column; gap: 1.25rem; }
.settings-section { padding: 1.5rem; }

.section-header { margin-bottom: 1.25rem; }
.section-title { font-size: 1rem; font-weight: 600; color: var(--text-primary); margin: 0 0 0.25rem; }
.section-desc { font-size: 0.875rem; color: var(--text-secondary); margin: 0; }

.flex-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.two-factor-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.text-info {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.two-factor-actions {
  display: flex;
  align-items: center;
}

.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  margin-bottom: 1.25rem;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md, 8px);
}

.session-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.session-details {
  flex: 1;
}

.session-agent {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.font-medium {
  font-weight: 500;
}

.session-meta {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 0.25rem 0 0;
}

.session-actions {
  display: flex;
  align-items: center;
}
</style>
