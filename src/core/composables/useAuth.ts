// src/core/composables/useAuth.ts
import type { LoginPayload, RegisterPayload } from '@/core/auth'
import { useAuthStore } from '@/core/stores/auth.store'
import { useToast } from '@/core/composables/useToast'
import { authAdapter } from '@/plugins/auth'
import appConfig from '@/app.config'

/**
 * Composable for auth state and actions.
 * The actual login/logout logic is delegated to the configured auth adapter.
 *
 * @example Switch adapter in src/plugins/auth.ts
 *
 * @example Usage:
 * const auth = useAuth()
 * await auth.login({ email, password })
 * if (auth.isAuthenticated.value) { ... }
 * auth.can('users.create')
 */
export function useAuth() {
  const store = useAuthStore()
  const toast = useToast()
  const router = useRouter()

  /**
   * Login with credentials via the configured auth adapter.
   * Returns true on success, false on failure.
   */
  async function login(payload: LoginPayload): Promise<boolean> {
    store.isLoading = true
    try {
      const response = await authAdapter.login(payload)
      store.setAuth(response.user, response.token)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      toast.error(message, 'Sign in failed')
      return false
    } finally {
      store.isLoading = false
    }
  }

  /**
   * Register a new user via the configured auth adapter.
   * Returns true on success, false on failure.
   */
  async function register(payload: RegisterPayload): Promise<boolean> {
    if (!authAdapter.register) {
      toast.error('Registration is not supported by the current auth adapter.')
      return false
    }

    store.isLoading = true
    try {
      const response = await authAdapter.register(payload)
      store.setAuth(response.user, response.token)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      toast.error(message, 'Registration failed')
      return false
    } finally {
      store.isLoading = false
    }
  }

  /**
   * Send forgot password email via the configured auth adapter.
   * Returns true on success, false on failure.
   */
  async function forgotPassword(email: string): Promise<boolean> {
    if (!authAdapter.forgotPassword) {
      toast.error('Password reset is not supported by the current auth adapter.')
      return false
    }

    store.isLoading = true
    try {
      const response = await authAdapter.forgotPassword(email)
      toast.success(response.message, 'Email sent')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Request failed'
      toast.error(message, 'Reset password failed')
      return false
    } finally {
      store.isLoading = false
    }
  }

  /**
   * Logout and redirect to login page.
   */
  async function logout(): Promise<void> {
    store.isLoading = true
    try {
      await authAdapter.logout()
    } catch {
      // Ignore logout errors — still clear local state
    } finally {
      store.isLoading = false
    }
    store.clearAuth()
    await router.push(appConfig.auth.loginRoute)
  }

  /**
   * Try to restore user session by fetching from adapter.
   * Called on app init if token exists in storage.
   */
  async function restoreSession(): Promise<void> {
    if (!store.token) return
    try {
      const user = await authAdapter.getUser()
      store.user = user
    } catch {
      store.clearAuth()
    }
  }

  function can(permission: string): boolean {
    return store.hasPermission(permission)
  }

  function cannot(permission: string): boolean {
    return !can(permission)
  }

  function hasRole(role: string): boolean {
    return store.hasRole(role)
  }

  return {
    // State (reactive)
    user: computed(() => store.user),
    isAuthenticated: computed(() => store.isAuthenticated),
    isLoading: computed(() => store.isLoading),

    // Actions
    login,
    register,
    forgotPassword,
    logout,
    restoreSession,
    setAuth: store.setAuth,

    // RBAC helpers
    can,
    cannot,
    hasRole,
  }
}
