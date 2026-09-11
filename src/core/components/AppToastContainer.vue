<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite" aria-label="Notifications">
      <TransitionGroup name="toast" tag="div" class="toast-list">
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          class="toast"
          :class="`toast-${toast.variant}`"
          role="alert"
        >
          <span class="toast-icon">
            <CheckCircle v-if="toast.variant === 'success'" :size="16" />
            <XCircle v-else-if="toast.variant === 'error'" :size="16" />
            <AlertTriangle v-else-if="toast.variant === 'warning'" :size="16" />
            <Info v-else :size="16" />
          </span>
          <div class="toast-body">
            <p v-if="toast.title" class="toast-title">{{ toast.title }}</p>
            <p class="toast-message">{{ toast.message }}</p>
          </div>
          <button class="toast-close" @click="toastStore.remove(toast.id)">
            <X :size="14" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { AlertTriangle, CheckCircle, Info, X, XCircle } from '@lucide/vue'
import { useToastStore } from '@/core/stores/toast.store'

const toastStore = useToastStore()
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 1.25rem;
  right: 1.25rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
}

.toast-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  max-width: 360px;
  pointer-events: all;
  backdrop-filter: blur(8px);
}

.toast-success { border-left: 3px solid #22c55e; }
.toast-error   { border-left: 3px solid #ef4444; }
.toast-warning { border-left: 3px solid #f59e0b; }
.toast-info    { border-left: 3px solid #3b82f6; }

.toast-icon {
  flex-shrink: 0;
  margin-top: 1px;
}

.toast-success .toast-icon { color: #22c55e; }
.toast-error   .toast-icon { color: #ef4444; }
.toast-warning .toast-icon { color: #f59e0b; }
.toast-info    .toast-icon { color: #3b82f6; }

.toast-body {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.125rem;
}

.toast-message {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin: 0;
}

.toast-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 4px;
  flex-shrink: 0;
  transition: background 0.15s;
}

.toast-close:hover {
  background: var(--border-color);
  color: var(--text-secondary);
}

/* Toast animation */
.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-leave-active {
  transition: all 0.2s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
.toast-move {
  transition: transform 0.3s ease;
}
</style>
