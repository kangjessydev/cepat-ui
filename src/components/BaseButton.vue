<template>
  <button
    :type="type"
    class="base-btn"
    :class="[`btn-${variant}`, `btn-${size}`, { 'btn-loading': loading, 'btn-icon-only': iconOnly }]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <span v-if="loading" class="btn-spinner" />
    <slot v-else name="icon-left" />
    <slot />
    <slot name="icon-right" />
  </button>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
  disabled?: boolean
  iconOnly?: boolean
}>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  loading: false,
  disabled: false,
  iconOnly: false,
})
</script>

<style scoped>
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  font-family: inherit;
  font-weight: 500;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s, opacity 0.15s, transform 0.1s, box-shadow 0.15s;
  white-space: nowrap;
  position: relative;
}

.base-btn:active:not(:disabled) { transform: scale(0.97); }
.base-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Sizes */
.btn-xs { height: 28px; padding: 0 0.625rem; font-size: 0.75rem; border-radius: 6px; gap: 0.25rem; }
.btn-sm { height: 34px; padding: 0 0.75rem; font-size: 0.8125rem; }
.btn-md { height: 40px; padding: 0 1rem; font-size: 0.875rem; }
.btn-lg { height: 46px; padding: 0 1.25rem; font-size: 0.9375rem; }

.btn-icon-only.btn-xs { padding: 0; width: 28px; }
.btn-icon-only.btn-sm { padding: 0; width: 34px; }
.btn-icon-only.btn-md { padding: 0; width: 40px; }
.btn-icon-only.btn-lg { padding: 0; width: 46px; }

/* Variants */
.btn-primary {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 1px 3px rgb(16 185 129 / 0.25);
}
.btn-primary:hover:not(:disabled) { opacity: 0.9; box-shadow: 0 4px 12px rgb(16 185 129 / 0.3); }

.btn-secondary {
  background: var(--bg-surface-raised);
  color: var(--text-primary);
  border-color: var(--border-color);
}
.btn-secondary:hover:not(:disabled) { background: var(--border-color); }

.btn-outline {
  background: transparent;
  color: #10b981;
  border-color: #10b981;
}
.btn-outline:hover:not(:disabled) { background: #ecfdf5; }

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border-color: transparent;
}
.btn-ghost:hover:not(:disabled) { background: var(--border-color); color: var(--text-primary); }

.btn-danger {
  background: #ef4444;
  color: white;
}
.btn-danger:hover:not(:disabled) { background: #dc2626; }

.btn-success {
  background: #22c55e;
  color: white;
}
.btn-success:hover:not(:disabled) { background: #16a34a; }

/* Loading */
.btn-loading { cursor: wait; }

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  opacity: 0.7;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
