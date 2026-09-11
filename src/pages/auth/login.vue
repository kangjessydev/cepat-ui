<template>
  <div class="auth-page">
    <h1 class="auth-title">Welcome back 👋</h1>
    <p class="auth-subtitle">Sign in to your account to continue</p>

    <form class="auth-form" novalidate @submit.prevent="handleLogin">
      <!-- Email -->
      <div class="form-field">
        <label for="email" class="field-label">Email</label>
        <div class="input-wrapper" :class="{ error: errors.email }">
          <Mail :size="16" class="input-icon" />
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="field-input"
            placeholder="you@example.com"
            autocomplete="email"
            @blur="validateEmail"
          />
        </div>
        <p v-if="errors.email" class="field-error">{{ errors.email }}</p>
      </div>

      <!-- Password -->
      <div class="form-field">
        <label for="password" class="field-label">
          Password
          <router-link to="/forgot-password" class="forgot-link">Forgot password?</router-link>
        </label>
        <div class="input-wrapper" :class="{ error: errors.password }">
          <Lock :size="16" class="input-icon" />
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            class="field-input"
            placeholder="••••••••"
            autocomplete="current-password"
          />
          <button type="button" class="input-action" @click="showPassword = !showPassword">
            <Eye v-if="!showPassword" :size="15" />
            <EyeOff v-else :size="15" />
          </button>
        </div>
        <p v-if="errors.password" class="field-error">{{ errors.password }}</p>
      </div>

      <!-- Remember me -->
      <label class="remember-label">
        <input v-model="form.remember" type="checkbox" class="remember-checkbox" />
        <span>Remember me</span>
      </label>

      <!-- Submit -->
      <button type="submit" class="btn-submit" :disabled="auth.isLoading.value">
        <span v-if="auth.isLoading.value" class="spinner" />
        <span v-else>Sign in</span>
      </button>
    </form>

    <!-- Demo credentials -->
    <div class="demo-hint">
      <p class="demo-hint-title">Demo credentials</p>
      <div class="demo-rows">
        <button class="demo-row" @click="fillCredentials('admin@example.com')">
          <span class="demo-badge admin">Admin</span>
          <code>admin@example.com</code>
          <span class="demo-sep">/</span>
          <code>password</code>
        </button>
        <button class="demo-row" @click="fillCredentials('user@example.com')">
          <span class="demo-badge user">User</span>
          <code>user@example.com</code>
          <span class="demo-sep">/</span>
          <code>password</code>
        </button>
      </div>
    </div>

    <p class="auth-footer-link">
      Don't have an account?
      <router-link to="/register">Create one</router-link>
    </p>
  </div>
</template>

<script setup lang="ts">
import { Eye, EyeOff, Lock, Mail } from '@lucide/vue'
import { useAuth } from '@/core/composables/useAuth'
import { useToast } from '@/core/composables/useToast'
import appConfig from '@/app.config'

const auth = useAuth()
const toast = useToast()
const router = useRouter()
const route = useRoute()

const showPassword = ref(false)
const form = reactive({ email: '', password: '', remember: false })
const errors = reactive({ email: '', password: '' })

function validateEmail() {
  if (!form.email) { errors.email = 'Email is required'; return false }
  if (!/\S+@\S+\.\S+/.test(form.email)) { errors.email = 'Please enter a valid email'; return false }
  errors.email = ''
  return true
}

function validateForm() {
  let valid = validateEmail()
  if (!form.password) { errors.password = 'Password is required'; valid = false }
  else errors.password = ''
  return valid
}

async function handleLogin() {
  if (!validateForm()) return

  const success = await auth.login({ email: form.email, password: form.password, remember: form.remember })
  if (success) {
    toast.success(`Welcome back, ${auth.user.value?.name}!`, 'Signed in')
    const redirect = route.query.redirect as string | undefined
    await router.push(redirect ?? appConfig.auth.defaultRedirect)
  }
}

function fillCredentials(email: string) {
  form.email = email
  form.password = 'password'
}
</script>

<style scoped>
.auth-page { width: 100%; }

.auth-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.375rem;
}

.auth-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 1.75rem;
}

.auth-form { display: flex; flex-direction: column; gap: 1rem; }

.form-field { display: flex; flex-direction: column; gap: 0.375rem; }

.field-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.forgot-link {
  font-size: 0.8125rem;
  color: #059669;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.15s;
}
.forgot-link:hover { opacity: 0.8; }

.input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-surface);
  transition: border-color 0.15s, box-shadow 0.15s;
  overflow: hidden;
}

.input-wrapper:focus-within {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgb(16 185 129 / 0.12);
}

.input-wrapper.error {
  border-color: #ef4444;
}

.input-wrapper.error:focus-within {
  box-shadow: 0 0 0 3px rgb(239 68 68 / 0.12);
}

.input-icon {
  flex-shrink: 0;
  color: var(--text-muted);
  margin-left: 0.75rem;
}

.field-input {
  flex: 1;
  height: 40px;
  padding: 0 0.75rem;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 0.875rem;
  outline: none;
  font-family: inherit;
  min-width: 0;
}

.field-input::placeholder { color: var(--text-muted); }

.input-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  flex-shrink: 0;
  transition: color 0.15s;
}
.input-action:hover { color: var(--text-secondary); }

.field-error {
  font-size: 0.75rem;
  color: #ef4444;
  margin: 0;
}

.remember-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  cursor: pointer;
}

.remember-checkbox {
  width: 15px;
  height: 15px;
  accent-color: #10b981;
}

.btn-submit {
  height: 42px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.25rem;
  font-family: inherit;
}
.btn-submit:hover:not(:disabled) { opacity: 0.9; }
.btn-submit:active:not(:disabled) { transform: scale(0.98); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgb(255 255 255 / 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Demo hint */
.demo-hint {
  margin-top: 1.25rem;
  padding: 0.75rem;
  background: var(--bg-surface-raised);
  border: 1px solid var(--border-color);
  border-radius: 10px;
}

.demo-hint-title {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  margin: 0 0 0.5rem;
}

.demo-rows {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.demo-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 7px;
  background: var(--bg-surface);
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s, border-color 0.15s;
  text-align: left;
}
.demo-row:hover { background: var(--border-color); border-color: var(--text-muted); }

.demo-badge {
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.125rem 0.375rem;
  border-radius: 999px;
}
.demo-badge.admin { background: #dcfce7; color: #15803d; }
.demo-badge.user { background: #eff6ff; color: #1d4ed8; }

.demo-row code {
  font-size: 0.75rem;
  color: var(--text-secondary);
}
.demo-sep { color: var(--text-muted); font-size: 0.75rem; }

.auth-footer-link {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  text-align: center;
  margin-top: 1.25rem;
}
.auth-footer-link a { color: #059669; text-decoration: none; font-weight: 500; }
.auth-footer-link a:hover { text-decoration: underline; }
</style>
