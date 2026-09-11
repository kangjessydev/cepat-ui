<template>
  <aside class="sidebar" :class="{ collapsed: uiStore.sidebarCollapsed, 'mobile-open': uiStore.sidebarMobileOpen }">
    <!-- Header: Logo + toggle -->
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <div class="logo-mark">C</div>
        <span v-if="!uiStore.sidebarCollapsed" class="logo-text">Cepat UI</span>
      </div>

      <!-- Desktop collapse/expand button -->
      <button
        class="toggle-btn desktop-toggle"
        :title="uiStore.sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        @click="uiStore.toggleSidebar()"
      >
        <component :is="uiStore.sidebarCollapsed ? PanelLeftOpen : PanelLeftClose" :size="16" />
      </button>

      <!-- Mobile close button -->
      <button
        class="toggle-btn mobile-close"
        title="Close sidebar"
        @click="uiStore.closeMobileSidebar()"
      >
        <X :size="18" />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <template v-for="item in filteredNavItems" :key="item.title">
        <!-- Item with children (nested group) -->
        <SidebarGroup v-if="item.children" :item="item" :collapsed="uiStore.sidebarCollapsed" />

        <!-- Single nav item -->
        <SidebarItem v-else :item="item" :collapsed="uiStore.sidebarCollapsed" />
      </template>
    </nav>

    <!-- Footer: User info -->
    <div class="sidebar-footer">
      <div class="user-info" :class="{ collapsed: uiStore.sidebarCollapsed }">
        <div class="user-avatar">
          <span>{{ userInitials }}</span>
        </div>
        <Transition name="label">
          <div v-if="!uiStore.sidebarCollapsed" class="user-meta">
            <span class="user-name">{{ user?.name ?? 'Guest' }}</span>
            <span class="user-email">{{ user?.email ?? '' }}</span>
          </div>
        </Transition>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { PanelLeftClose, PanelLeftOpen, X } from '@lucide/vue'
import { useUiStore } from '@/core/stores/ui.store'
import { useAuth } from '@/core/composables/useAuth'
import { navigationItems } from '@/core/router/navigation'
import SidebarItem from './SidebarItem.vue'
import SidebarGroup from './SidebarGroup.vue'

const uiStore = useUiStore()
const { user, hasRole } = useAuth()
const route = useRoute()

// Auto close mobile sidebar when navigating
watch(() => route.path, () => {
  uiStore.closeMobileSidebar()
})

// Filter nav items based on user roles
const filteredNavItems = computed(() =>
  navigationItems
    .filter(item => {
      if (!item.roles) return true
      return item.roles.some(role => hasRole(role))
    })
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
)

const userInitials = computed(() => {
  const name = user.value?.name ?? 'G'
  return name
    .split(' ')
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
})
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--sidebar-width);
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-sidebar);
  display: flex;
  flex-direction: column;
  z-index: 50;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

/* Mobile: hide off-screen */
@media (max-width: 1024px) {
  .sidebar {
    width: var(--sidebar-width) !important;
    transform: translateX(-100%);
    box-shadow: 4px 0 24px rgb(0 0 0 / 0.15);
  }
  .sidebar.mobile-open {
    transform: translateX(0);
  }
  /* In mobile, never allow collapsed 64px width */
  .sidebar.collapsed {
    width: var(--sidebar-width) !important;
  }
  .sidebar.collapsed .sidebar-header {
    justify-content: space-between !important;
    padding: 1rem 0.875rem !important;
  }
  .sidebar.collapsed .sidebar-logo {
    display: flex !important;
  }
  .desktop-toggle {
    display: none !important;
  }
  .mobile-close {
    display: flex !important;
  }
}

@media (min-width: 1025px) {
  .mobile-close {
    display: none !important;
  }
}

/* Header */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0.875rem;
  border-bottom: 1px solid var(--border-sidebar);
  min-height: 60px;
}

/* Desktop collapsed state: hide logo and center toggle button to prevent overlapping */
.sidebar.collapsed .sidebar-header {
  justify-content: center;
  padding: 1rem 0;
}

.sidebar.collapsed .sidebar-logo {
  display: none;
}

.sidebar.collapsed .desktop-toggle {
  margin: 0 auto;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  overflow: hidden;
}

.logo-mark {
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.logo-text {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
}

.toggle-btn {
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
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
}

.toggle-btn:hover {
  background: var(--border-color);
  color: var(--text-secondary);
}

/* Nav */
.sidebar-nav {
  flex: 1;
  padding: 0.5rem 0.5rem;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Footer */
.sidebar-footer {
  padding: 0.75rem 0.625rem;
  border-top: 1px solid var(--border-sidebar);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.375rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.user-info:hover {
  background: var(--border-color);
}

.user-info.collapsed {
  justify-content: center;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #059669);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.user-meta {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 0.6875rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Label slide transition */
.label-enter-active,
.label-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.label-enter-from,
.label-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
</style>
