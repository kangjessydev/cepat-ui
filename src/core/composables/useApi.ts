// src/core/composables/useApi.ts
import { useAuthStore } from '@/core/stores/auth.store'
import { useToast } from '@/core/composables/useToast'
import appConfig from '@/app.config'
import axios from 'axios'

// Base axios instance — configure baseURL via env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request interceptor — attach Bearer token
api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const auth = useAuthStore()
      auth.clearAuth()
      window.location.href = appConfig.auth.loginRoute
    }
    return Promise.reject(error)
  }
)

/**
 * Composable for making API requests with automatic auth headers,
 * error handling, and loading state.
 *
 * @example
 * const { get, post } = useApi()
 * const users = await get('/users')
 * await post('/users', { name: 'John' })
 */
export function useApi() {
  const toast = useToast()
  const isLoading = ref(false)

  async function request<T>(fn: () => Promise<T>): Promise<T | null> {
    isLoading.value = true
    try {
      return await fn()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message ?? error.message
        toast.error(message, 'Request Failed')
      }
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function get<T>(url: string, params?: Record<string, unknown>) {
    return request<T>(() => api.get<T>(url, { params }).then(r => r.data))
  }

  async function post<T>(url: string, data?: unknown) {
    return request<T>(() => api.post<T>(url, data).then(r => r.data))
  }

  async function put<T>(url: string, data?: unknown) {
    return request<T>(() => api.put<T>(url, data).then(r => r.data))
  }

  async function patch<T>(url: string, data?: unknown) {
    return request<T>(() => api.patch<T>(url, data).then(r => r.data))
  }

  async function del<T>(url: string) {
    return request<T>(() => api.delete<T>(url).then(r => r.data))
  }

  return { isLoading, get, post, put, patch, delete: del }
}

export { api }
