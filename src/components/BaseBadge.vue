<template>
  <span class="base-badge" :class="`badge-${variant}`">
    <slot />
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'outline'
}>(), { variant: 'default' })
</script>

<style scoped>
.base-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.1875rem 0.5rem;
  border-radius: 999px;
  font-size: 0.6875rem;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid transparent;
}

.badge-default  { background: var(--bg-surface-raised); color: var(--text-secondary); border-color: var(--border-color); }
.badge-primary  { background: #ecfdf5; color: #047857; border-color: #a7f3d0; }
.badge-success  { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
.badge-warning  { background: #fffbeb; color: #b45309; border-color: #fde68a; }
.badge-danger   { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
.badge-info     { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
.badge-outline  { background: transparent; color: var(--text-secondary); border-color: var(--border-color); }
</style>
