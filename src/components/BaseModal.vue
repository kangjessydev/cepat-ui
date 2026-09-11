<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-backdrop" @click.self="onBackdropClick">
        <div
          class="modal-panel"
          :class="`modal-${size}`"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
        >
          <!-- Header -->
          <div v-if="title || $slots.header" class="modal-header">
            <slot name="header">
              <h2 class="modal-title">{{ title }}</h2>
            </slot>
            <button v-if="!hideClose" class="modal-close" @click="$emit('update:modelValue', false)">
              <X :size="16" />
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body" :class="{ 'no-header': !title && !$slots.header }">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from '@lucide/vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  persistent?: boolean
  hideClose?: boolean
}>(), {
  size: 'md',
  persistent: false,
  hideClose: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'close': []
}>()

function onBackdropClick() {
  if (!props.persistent) {
    emit('update:modelValue', false)
    emit('close')
  }
}

// Close on Escape
onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.modelValue && !props.persistent) {
      emit('update:modelValue', false)
      emit('close')
    }
  }
  document.addEventListener('keydown', handler)
  onUnmounted(() => document.removeEventListener('keydown', handler))
})

// Lock body scroll when open
watch(() => props.modelValue, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 0.45);
  backdrop-filter: blur(3px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-panel {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  box-shadow: 0 24px 64px rgb(0 0 0 / 0.18);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 2rem);
  width: 100%;
  overflow: hidden;
}

.modal-sm   { max-width: 400px; }
.modal-md   { max-width: 540px; }
.modal-lg   { max-width: 720px; }
.modal-xl   { max-width: 960px; }
.modal-full { max-width: calc(100vw - 2rem); max-height: calc(100vh - 2rem); }

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem 1rem;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.modal-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}
.modal-close:hover { background: var(--border-color); color: var(--text-primary); }

.modal-body {
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
  flex: 1;
}
.modal-body.no-header { padding-top: 1.5rem; }

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}

/* Transitions */
.modal-enter-active { transition: opacity 0.2s ease; }
.modal-leave-active { transition: opacity 0.15s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

.modal-enter-active .modal-panel {
  animation: modal-slide-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-leave-active .modal-panel {
  animation: modal-slide-out 0.15s ease forwards;
}

@keyframes modal-slide-in {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes modal-slide-out {
  from { opacity: 1; transform: scale(1) translateY(0); }
  to   { opacity: 0; transform: scale(0.95) translateY(10px); }
}

/* Mobile */
@media (max-width: 640px) {
  .modal-backdrop {
    padding: 0.75rem;
  }
  .modal-panel {
    max-width: calc(100vw - 1.5rem);
    border-radius: 12px;
  }
}
</style>
