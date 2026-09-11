<template>
  <div class="dashboard-shell" :class="{ 'sidebar-collapsed': uiStore.sidebarCollapsed }">
    <!-- Mobile sidebar overlay -->
    <Transition name="fade">
      <div
        v-if="uiStore.sidebarMobileOpen"
        class="mobile-overlay"
        @click="uiStore.closeMobileSidebar()"
      />
    </Transition>

    <!-- Sidebar -->
    <AppSidebar />

    <!-- Main content area -->
    <div class="main-area">
      <!-- Top navbar -->
      <AppNavbar />

      <!-- Page content -->
      <main class="page-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from '@/core/components/AppSidebar.vue'
import AppNavbar from '@/core/components/AppNavbar.vue'
import { useUiStore } from '@/core/stores/ui.store'

const uiStore = useUiStore()
</script>

<style scoped>
.dashboard-shell {
  display: flex;
  min-height: 100vh;
  background: var(--bg-app);
}

.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 0.4);
  z-index: 40;
  backdrop-filter: blur(2px);
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin-left: var(--sidebar-width);
  transition: margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.dashboard-shell.sidebar-collapsed .main-area {
  margin-left: var(--sidebar-collapsed-width);
}

.page-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

/* Mobile */
@media (max-width: 1024px) {
  .main-area {
    margin-left: 0 !important;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
