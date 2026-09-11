// src/core/stores/toast.store.ts
import type { Toast, ToastVariant } from '@/core/types'
import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])

  function add(message: string, variant: ToastVariant = 'info', title?: string, duration = 4000) {
    const id = `toast-${Date.now()}-${Math.random()}`
    toasts.value.push({ id, message, variant, title, duration })

    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }
    return id
  }

  function remove(id: string) {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  function success(message: string, title?: string) {
    return add(message, 'success', title)
  }

  function error(message: string, title?: string) {
    return add(message, 'error', title, 6000)
  }

  function warning(message: string, title?: string) {
    return add(message, 'warning', title)
  }

  function info(message: string, title?: string) {
    return add(message, 'info', title)
  }

  return { toasts, add, remove, success, error, warning, info }
})
