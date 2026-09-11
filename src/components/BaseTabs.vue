<template>
  <div class="base-tabs" :class="`variant-${variant}`" role="tablist">
    <button
      v-for="item in items"
      :key="item.key"
      type="button"
      role="tab"
      :aria-selected="modelValue === item.key"
      :disabled="item.disabled"
      class="tab-item"
      :class="{
        active: modelValue === item.key,
        disabled: item.disabled,
      }"
      @click="selectTab(item.key)"
    >
      <!-- Optional Icon -->
      <component
        :is="getIcon(item.icon)"
        v-if="item.icon && getIcon(item.icon)"
        :size="16"
        class="tab-icon"
      />

      <!-- Label -->
      <span>{{ item.label }}</span>

      <!-- Optional Badge -->
      <span v-if="item.badge !== undefined" class="tab-badge">
        {{ item.badge }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import * as LucideIcons from '@lucide/vue'

export interface TabItem {
  key: string
  label: string
  icon?: string
  badge?: string | number
  disabled?: boolean
}

interface Props {
  items: TabItem[]
  modelValue: string
  variant?: 'pills' | 'underline'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'pills',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

function selectTab(key: string) {
  emit('update:modelValue', key)
  emit('change', key)
}

function getIcon(name?: string): Component | null {
  if (!name) return null
  return ((LucideIcons as unknown as Record<string, Component>)[name]) ?? null
}
</script>

<style scoped>
.base-tabs {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
}

.base-tabs::-webkit-scrollbar {
  display: none;
}

/* Common tab button */
.tab-item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  transition: all 0.15s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.tab-item.disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.tab-icon {
  flex-shrink: 0;
}

.tab-badge {
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  background: var(--border-color);
  color: var(--text-secondary);
}

/* Pills Variant */
.variant-pills {
  background: var(--bg-surface-raised);
  padding: 0.25rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.variant-pills .tab-item {
  padding: 0.375rem 0.875rem;
  border-radius: 6px;
}

.variant-pills .tab-item:hover:not(.disabled) {
  color: var(--text-primary);
}

.variant-pills .tab-item.active {
  background: var(--bg-surface);
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
  font-weight: 600;
}

.variant-pills .tab-item.active .tab-badge {
  background: #ecfdf5;
  color: #047857;
}
:root.dark .variant-pills .tab-item.active .tab-badge,
.dark .variant-pills .tab-item.active .tab-badge {
  background: #064e3b;
  color: #6ee7b7;
}

/* Underline Variant */
.variant-underline {
  border-bottom: 1px solid var(--border-color);
  gap: 1.5rem;
}

.variant-underline .tab-item {
  padding: 0.625rem 0.25rem;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.variant-underline .tab-item:hover:not(.disabled) {
  color: var(--text-primary);
  border-bottom-color: var(--text-muted);
}

.variant-underline .tab-item.active {
  color: #10b981;
  border-bottom-color: #10b981;
  font-weight: 600;
}

.variant-underline .tab-item.active .tab-badge {
  background: #ecfdf5;
  color: #047857;
}
</style>
