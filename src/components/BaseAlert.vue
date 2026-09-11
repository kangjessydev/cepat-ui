<template>
  <Transition name="alert-fade">
    <div v-if="visible" class="base-alert" :class="`alert-${variant}`" role="alert">
      <!-- Alert Icon -->
      <div v-if="showIcon" class="alert-icon">
        <component :is="resolvedIcon" :size="18" />
      </div>

      <!-- Content -->
      <div class="alert-content">
        <div v-if="title" class="alert-title">{{ title }}</div>
        <div class="alert-body">
          <slot />
        </div>
      </div>

      <!-- Dismiss button -->
      <button
        v-if="dismissible"
        type="button"
        class="alert-close"
        title="Dismiss alert"
        @click="dismiss"
      >
        <X :size="15" />
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, type Component } from 'vue'
import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from '@lucide/vue'
import * as LucideIcons from '@lucide/vue'

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger'

interface Props {
  variant?: AlertVariant
  title?: string
  dismissible?: boolean
  icon?: boolean | string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info',
  dismissible: false,
  icon: true,
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const visible = ref(true)

const showIcon = computed(() => props.icon !== false)

const resolvedIcon = computed((): Component => {
  if (typeof props.icon === 'string') {
    const custom = (LucideIcons as unknown as Record<string, Component>)[props.icon]
    if (custom) return custom
  }

  switch (props.variant) {
    case 'success':
      return CheckCircle2
    case 'warning':
      return AlertTriangle
    case 'danger':
      return AlertCircle
    case 'info':
    default:
      return Info
  }
})

function dismiss() {
  visible.value = false
  emit('close')
}
</script>

<style scoped>
.base-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  line-height: 1.45;
  position: relative;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.alert-icon {
  flex-shrink: 0;
  margin-top: 0.0625rem;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.alert-body {
  color: inherit;
  opacity: 0.92;
}

.alert-close {
  flex-shrink: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  margin: -0.25rem -0.25rem -0.25rem auto;
  border-radius: 4px;
  color: inherit;
  opacity: 0.6;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s ease, background-color 0.15s ease;
}

.alert-close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.06);
}

/* Info Variant */
.alert-info {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
}
:root.dark .alert-info,
.dark .alert-info {
  background: rgba(30, 58, 138, 0.25);
  border-color: rgba(59, 130, 246, 0.3);
  color: #93c5fd;
}

/* Success Variant */
.alert-success {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
}
:root.dark .alert-success,
.dark .alert-success {
  background: rgba(6, 78, 59, 0.25);
  border-color: rgba(16, 185, 129, 0.3);
  color: #6ee7b7;
}

/* Warning Variant */
.alert-warning {
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
}
:root.dark .alert-warning,
.dark .alert-warning {
  background: rgba(120, 53, 15, 0.25);
  border-color: rgba(245, 158, 11, 0.3);
  color: #fcd34d;
}

/* Danger Variant */
.alert-danger {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}
:root.dark .alert-danger,
.dark .alert-danger {
  background: rgba(127, 29, 29, 0.25);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

/* Transitions */
.alert-fade-enter-active,
.alert-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.alert-fade-enter-from,
.alert-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
