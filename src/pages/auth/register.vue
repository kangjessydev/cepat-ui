<template>
  <div class="auth-page">
    <h1 class="auth-title">Create an account</h1>
    <p class="auth-subtitle">Fill in the form below to get started</p>

    <form class="auth-form" novalidate @submit.prevent="handleRegister">
      <div class="form-field">
        <label for="name" class="field-label">Full name</label>
        <div class="input-wrapper" :class="{ error: errors.name }">
          <User :size="16" class="input-icon" />
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="field-input"
            placeholder="Your name"
            autocomplete="name"
          />
        </div>
        <p v-if="errors.name" class="field-error">{{ errors.name }}</p>
      </div>

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
          />
        </div>
        <p v-if="errors.email" class="field-error">{{ errors.email }}</p>
      </div>

      <div class="form-field">
        <label for="password" class="field-label">Password</label>
        <div class="input-wrapper" :class="{ error: errors.password }">
          <Lock :size="16" class="input-icon" />
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            class="field-input"
            placeholder="Min. 8 characters"
            autocomplete="new-password"
          />
          <button type="button" class="input-action" @click="showPassword = !showPassword">
            <Eye v-if="!showPassword" :size="15" />
            <EyeOff v-else :size="15" />
          </button>
        </div>
        <p v-if="errors.password" class="field-error">{{ errors.password }}</p>
        <!-- Password strength indicator -->
        <div v-if="form.password" class="strength-bar">
          <div
            class="strength-fill"
            :class="passwordStrength.class"
            :style="{ width: passwordStrength.width }"
          />
          <span class="strength-label" :class="passwordStrength.class">{{ passwordStrength.label }}</span>
        </div>
      </div>

      <button type="submit" class="btn-submit" :disabled="auth.isLoading.value">
        <span v-if="auth.isLoading.value" class="spinner" />
        <span v-else>Create account</span>
      </button>
    </form>

    <p class="auth-footer-link">
      Already have an account?
      <router-link to="/login">Sign in</router-link>
    </p>
  </div>
</template>

<script setup lang="ts">
import { Eye, EyeOff, Lock, Mail, User } from '@lucide/vue'
import { useAuth } from '@/core/composables/useAuth'
import { useToast } from '@/core/composables/useToast'
import appConfig from '@/app.config'

const auth = useAuth()
const toast = useToast()
const router = useRouter()
const showPassword = ref(false)

const form = reactive({ name: '', email: '', password: '' })
const errors = reactive({ name: '', email: '', password: '' })

const passwordStrength = computed(() => {
  const p = form.password
  if (p.length === 0) return { label: '', class: '', width: '0%' }
  const score = [p.length >= 8, /[A-Z]/.test(p), /[0-9]/.test(p), /[^A-Za-z0-9]/.test(p)].filter(Boolean).length
  if (score <= 1) return { label: 'Weak', class: 'weak', width: '25%' }
  if (score === 2) return { label: 'Fair', class: 'fair', width: '50%' }
  if (score === 3) return { label: 'Good', class: 'good', width: '75%' }
  return { label: 'Strong', class: 'strong', width: '100%' }
})

function validate() {
  let valid = true
  errors.name = form.name.trim() ? '' : 'Name is required'
  if (!form.name.trim()) valid = false

  errors.email = ''
  if (!form.email) { errors.email = 'Email is required'; valid = false }
  else if (!/\S+@\S+\.\S+/.test(form.email)) { errors.email = 'Invalid email'; valid = false }

  errors.password = ''
  if (!form.password) { errors.password = 'Password is required'; valid = false }
  else if (form.password.length < 8) { errors.password = 'Password must be at least 8 characters'; valid = false }

  return valid
}

async function handleRegister() {
  if (!validate()) return
  const success = await auth.register({
    name: form.name,
    email: form.email,
    password: form.password,
    password_confirmation: form.password,
  })
  if (success) {
    toast.success('Account created successfully!', 'Welcome!')
    await router.push(appConfig.auth.defaultRedirect)
  }
}
</script>

<style scoped>
.auth-page { width: 100%; }
.auth-title { font-size: 1.375rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.375rem; }
.auth-subtitle { font-size: 0.875rem; color: var(--text-secondary); margin: 0 0 1.75rem; }
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
  color: var(--text-primary); font-size: 0.875rem; outline: none; font-family: inherit; min-width: 0;
}
.field-input::placeholder { color: var(--text-muted); }

.input-action {
  display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;
  border: none; background: transparent; color: var(--text-muted); cursor: pointer; transition: color 0.15s;
}
.input-action:hover { color: var(--text-secondary); }

.field-error { font-size: 0.75rem; color: #ef4444; margin: 0; }

/* Password strength */
.strength-bar { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem; }
.strength-fill { height: 3px; border-radius: 999px; transition: width 0.3s, background 0.3s; }
.strength-fill.weak { background: #ef4444; }
.strength-fill.fair { background: #f59e0b; }
.strength-fill.good { background: #10b981; }
.strength-fill.strong { background: #059669; }
.strength-label { font-size: 0.6875rem; font-weight: 600; }
.strength-label.weak { color: #ef4444; }
.strength-label.fair { color: #f59e0b; }
.strength-label.good { color: #10b981; }
.strength-label.strong { color: #059669; }

.btn-submit {
  height: 42px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none;
  border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer;
  transition: opacity 0.15s, transform 0.1s; display: flex; align-items: center;
  justify-content: center; margin-top: 0.25rem; font-family: inherit;
}
.btn-submit:hover:not(:disabled) { opacity: 0.9; }
.btn-submit:active:not(:disabled) { transform: scale(0.98); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

.spinner {
  width: 16px; height: 16px; border: 2px solid rgb(255 255 255 / 0.3);
  border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.auth-footer-link { font-size: 0.8125rem; color: var(--text-secondary); text-align: center; margin-top: 1.25rem; }
.auth-footer-link a { color: #059669; text-decoration: none; font-weight: 500; }
</style>
