<template>
  <div class="base-card" :class="[`variant-${variant}`, `padding-${padding}`]">
    <!-- Card Header -->
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <div class="header-content">
          <h3 v-if="title" class="card-title">{{ title }}</h3>
          <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
        </div>
      </slot>

      <div v-if="$slots['header-actions']" class="header-actions">
        <slot name="header-actions" />
      </div>
    </div>

    <!-- Card Body -->
    <div class="card-body">
      <slot />
    </div>

    <!-- Card Footer -->
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
  variant?: 'default' | 'elevated' | 'bordered'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
})
</script>

<style scoped>
.base-card {
  background: var(--bg-surface);
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

/* Variants */
.variant-default {
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-card);
}

.variant-elevated {
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
}

.variant-bordered {
  border: 2px solid var(--border-color);
  box-shadow: none;
}

/* Padding variants for body */
.padding-none .card-body {
  padding: 0;
}
.padding-sm .card-body {
  padding: 0.875rem;
}
.padding-md .card-body {
  padding: 1.25rem;
}
.padding-lg .card-body {
  padding: 1.75rem;
}

/* Header */
.card-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.35;
}

.card-subtitle {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Body */
.card-body {
  flex: 1;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
}

/* Footer */
.card-footer {
  padding: 0.875rem 1.25rem;
  border-top: 1px solid var(--border-color);
  background: var(--bg-surface-raised);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
}
</style>
