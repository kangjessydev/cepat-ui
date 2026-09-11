// src/core/stores/auth.store.ts
import type { User } from '@/core/types'
import appConfig from '@/app.config'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // Persist token based on config
  const storage = appConfig.auth.persistStrategy === 'sessionStorage'
    ? sessionStorage
    : localStorage

  function setAuth(userData: User, authToken: string) {
    user.value = userData
    token.value = authToken
    storage.setItem('cepat-ui-token', authToken)
    storage.setItem('cepat-ui-user', JSON.stringify(userData))
  }

  function clearAuth() {
    user.value = null
    token.value = null
    storage.removeItem('cepat-ui-token')
    storage.removeItem('cepat-ui-user')
  }

  function initAuth() {
    const savedToken = storage.getItem('cepat-ui-token')
    const savedUser = storage.getItem('cepat-ui-user')
    if (savedToken && savedUser) {
      try {
        token.value = savedToken
        user.value = JSON.parse(savedUser) as User
      } catch {
        clearAuth()
      }
    }
  }

  function hasRole(role: string): boolean {
    return user.value?.roles.includes(role) ?? false
  }

  function hasPermission(permission: string): boolean {
    return user.value?.permissions.includes(permission) ?? false
  }

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    setAuth,
    clearAuth,
    initAuth,
    hasRole,
    hasPermission,
  }
})
