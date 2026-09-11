// src/core/composables/useToast.ts
import { useToastStore } from '@/core/stores/toast.store'

/**
 * Composable for showing toast notifications.
 *
 * @example
 * const toast = useToast()
 * toast.success('Berhasil disimpan!')
 * toast.error('Terjadi kesalahan', 'Error')
 */
export function useToast() {
  const store = useToastStore()
  return {
    success: store.success,
    error: store.error,
    warning: store.warning,
    info: store.info,
    remove: store.remove,
  }
}
