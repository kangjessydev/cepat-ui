<template>
  <Teleport to="body">
    <Transition name="bottom-sheet">
      <div
        v-if="modelValue"
        class="sheet-backdrop"
        @click.self="handleBackdropClick"
      >
        <div
          class="sheet-panel"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <!-- Grab handle bar -->
          <div v-if="showGrabHandle" class="sheet-grab-bar" @click="handleGrabClick">
            <span class="grab-indicator" />
          </div>

          <!-- Header -->
          <div v-if="title || $slots.header" class="sheet-header">
            <slot name="header">
              <div class="sheet-header-text">
                <h3 v-if="title" class="sheet-title">{{ title }}</h3>
                <p v-if="subtitle" class="sheet-subtitle">{{ subtitle }}</p>
              </div>
            </slot>

            <button
              v-if="showClose"
              type="button"
              class="sheet-close-btn"
              title="Close"
              @click="close"
            >
              <X :size="18" />
            </button>
          </div>

          <!-- Body -->
          <div class="sheet-body">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="sheet-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue'
import { X } from '@lucide/vue'

interface Props {
  modelValue: boolean
  title?: string
  subtitle?: string
  showClose?: boolean
  showGrabHandle?: boolean
  persistent?: boolean
  maxHeight?: string
}

const props = withDefaults(defineProps<Props>(), {
  showClose: true,
  showGrabHandle: true,
  persistent: false,
  maxHeight: '85vh',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}>()

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function handleBackdropClick() {
  if (!props.persistent) {
    close()
  }
}

function handleGrabClick() {
  if (!props.persistent) {
    close()
  }
}

// Touch swipe down to dismiss
let startY = 0
let currentY = 0

function handleTouchStart(e: TouchEvent) {
  startY = e.touches[0].clientY
  currentY = startY
}

function handleTouchMove(e: TouchEvent) {
  currentY = e.touches[0].clientY
}

function handleTouchEnd() {
  const deltaY = currentY - startY
  // If swiped down more than 70px, close
  if (deltaY > 70 && !props.persistent) {
    close()
  }
  startY = 0
  currentY = 0
}

// Escape key listener
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.modelValue && !props.persistent) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = ''
})

// Body scroll lock
watch(() => props.modelValue, (isOpen) => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  }
})
</script>

<style scoped>
.sheet-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 250;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
}

.sheet-panel {
  width: 100%;
  max-width: 600px;
  max-height: 85vh;
  background: var(--bg-surface);
  border-top: 1px solid var(--border-color);
  border-left: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  will-change: transform;
}

/* Grab Indicator */
.sheet-grab-bar {
  width: 100%;
  padding-top: 0.75rem;
  padding-bottom: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  touch-action: none;
}

.grab-indicator {
  width: 38px;
  height: 4px;
  border-radius: 999px;
  background: var(--border-color);
  transition: background-color 0.15s ease;
}

.sheet-grab-bar:hover .grab-indicator {
  background: var(--text-muted);
}

/* Header */
.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1.25rem 0.875rem;
  border-bottom: 1px solid var(--border-color);
  gap: 1rem;
}

.sheet-header-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.sheet-title {
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.35;
}

.sheet-subtitle {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin: 0;
}

.sheet-close-btn {
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.375rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.sheet-close-btn:hover {
  background: var(--border-color);
  color: var(--text-primary);
}

/* Body */
.sheet-body {
  padding: 1.25rem;
  overflow-y: auto;
  flex: 1;
}

/* Footer */
.sheet-footer {
  padding: 0.875rem 1.25rem;
  border-top: 1px solid var(--border-color);
  background: var(--bg-surface-raised);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* Transitions */
.bottom-sheet-enter-active,
.bottom-sheet-leave-active {
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.bottom-sheet-enter-active .sheet-panel {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.bottom-sheet-leave-active .sheet-panel {
  transition: transform 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.bottom-sheet-enter-from,
.bottom-sheet-leave-to {
  opacity: 0;
}

.bottom-sheet-enter-from .sheet-panel,
.bottom-sheet-leave-to .sheet-panel {
  transform: translateY(100%);
}
</style>
