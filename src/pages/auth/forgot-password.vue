<template>
  <div class="auth-page">
    <!-- Sent state -->
    <template v-if="sent">
      <div class="success-icon">
        <CheckCircle :size="40" />
      </div>
      <h1 class="auth-title">Check your email</h1>
      <p class="auth-subtitle">
        We sent a password reset link to <strong>{{ sentEmail }}</strong>.
        Check your inbox and follow the instructions.
      </p>
      <button class="btn-submit" style="margin-top: 0.5rem" @click="sent = false">
        Try a different email
      </button>
    </template>

    <!-- Form state -->
    <template v-else>
      <h1 class="auth-title">Reset your password</h1>
      <p class="auth-subtitle">
        Enter the email associated with your account and we'll send a reset link.
      </p>

      <form class="auth-form" novalidate @submit.prevent="handleSubmit">
        <div class="form-field">
          <label for="email" class="field-label">Email</label>
          <div class="input-wrapper" :class="{ error: error }">
            <Mail :size="16" class="input-icon" />
            <input
              id="email"
              v-model="email"
              type="email"
              class="field-input"
              placeholder="you@example.com"
              autocomplete="email"
            />
          </div>
          <p v-if="error" class="field-error">{{ error }}</p>
        </div>

        <button type="submit" class="btn-submit" :disabled="auth.isLoading.value">
          <span v-if="auth.isLoading.value" class="spinner" />
          <span v-else>Send reset link</span>
        </button>
      </form>
    </template>

    <p class="auth-footer-link">
      <router-link to="/login">
        <ArrowLeft :size="13" style="vertical-align: middle" />
        Back to sign in
      </router-link>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, CheckCircle, Mail } from '@lucide/vue'
import { useAuth } from '@/core/composables/useAuth'

const auth = useAuth()
const email = ref('')
const error = ref('')
const sent = ref(false)
const sentEmail = ref('')

async function handleSubmit() {
  if (!email.value) { error.value = 'Email is required'; return }
  if (!/\S+@\S+\.\S+/.test(email.value)) { error.value = 'Invalid email'; return }
  error.value = ''

  const success = await auth.forgotPassword(email.value)
  if (success) {
    sentEmail.value = email.value
    sent.value = true
  }
}
</script>

<style scoped>
.auth-page { width: 100%; }
.auth-title { font-size: 1.375rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.375rem; }
.auth-subtitle { font-size: 0.875rem; color: var(--text-secondary); margin: 0 0 1.75rem; line-height: 1.6; }

.success-icon {
  color: #10b981;
  margin-bottom: 1rem;
}

.auth-form { display: flex; flex-direction: column; gap: 1rem; }
.form-field { display: flex; flex-direction: column; gap: 0.375rem; }
.field-label { font-size: 0.8125rem; font-weight: 500; color: var(--text-secondary); }

.input-wrapper {
  display: flex; align-items: center;
  border: 1px solid var(--border-color); border-radius: 8px;
  background: var(--bg-surface); transition: border-color 0.15s, box-shadow 0.15s; overflow: hidden;
}
.input-wrapper:focus-within { border-color: #10b981; box-shadow: 0 0 0 3px rgb(16 185 129 / 0.12); }
.input-wrapper.error { border-color: #ef4444; }
.input-icon { flex-shrink: 0; color: var(--text-muted); margin-left: 0.75rem; }
.field-input {
  flex: 1; height: 40px; padding: 0 0.75rem; border: none; background: transparent;
  color: var(--text-primary); font-size: 0.875rem; outline: none; font-family: inherit;
}
.field-input::placeholder { color: var(--text-muted); }
.field-error { font-size: 0.75rem; color: #ef4444; margin: 0; }

.btn-submit {
  height: 42px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none;
  border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer;
  transition: opacity 0.15s; display: flex; align-items: center; justify-content: center; font-family: inherit;
}
.btn-submit:hover:not(:disabled) { opacity: 0.9; }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

.spinner {
  width: 16px; height: 16px; border: 2px solid rgb(255 255 255 / 0.3);
  border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.auth-footer-link { font-size: 0.8125rem; text-align: center; margin-top: 1.25rem; }
.auth-footer-link a { color: var(--text-secondary); text-decoration: none; display: inline-flex; align-items: center; gap: 0.25rem; }
.auth-footer-link a:hover { color: var(--text-primary); }
</style>
