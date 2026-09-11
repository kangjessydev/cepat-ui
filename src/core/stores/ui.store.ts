// src/core/stores/ui.store.ts
import { defineStore } from 'pinia'
import appConfig from '@/app.config'

export const useUiStore = defineStore('ui', () => {
  // Sidebar state
  const sidebarCollapsed = ref(appConfig.sidebar.defaultCollapsed)
  const sidebarMobileOpen = ref(false)

  // Dark mode state
  const isDarkMode = ref(false)

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function toggleMobileSidebar() {
    sidebarMobileOpen.value = !sidebarMobileOpen.value
  }

  function closeMobileSidebar() {
    sidebarMobileOpen.value = false
  }

  function toggleDarkMode() {
    if (!appConfig.features.darkMode) return
    isDarkMode.value = !isDarkMode.value
    applyDarkMode()
    localStorage.setItem('cepat-ui-dark', isDarkMode.value ? '1' : '0')
  }

  function applyDarkMode() {
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  function initDarkMode() {
    if (!appConfig.features.darkMode) return
    const saved = localStorage.getItem('cepat-ui-dark')
    if (saved !== null) {
      isDarkMode.value = saved === '1'
    } else {
      isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyDarkMode()
  }

  return {
    sidebarCollapsed,
    sidebarMobileOpen,
    isDarkMode,
    toggleSidebar,
    toggleMobileSidebar,
    closeMobileSidebar,
    toggleDarkMode,
    initDarkMode,
  }
})
