<template>
  <!-- Dynamic layout system -->
  <component :is="currentLayout">
    <router-view v-slot="{ Component, route }">
      <transition name="page" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </component>

  <!-- Global Toast Container -->
  <AppToastContainer />
</template>

<script setup lang="ts">
import DashboardLayout from '@/core/layouts/DashboardLayout.vue'
import AuthLayout from '@/core/layouts/AuthLayout.vue'
import BlankLayout from '@/core/layouts/BlankLayout.vue'
import AppToastContainer from '@/core/components/AppToastContainer.vue'
import { useUiStore } from '@/core/stores/ui.store'

const route = useRoute()
const uiStore = useUiStore()

// Dynamic layout based on route meta
const currentLayout = computed(() => {
  const layout = route.meta.layout as string | undefined
  if (layout === 'auth') return AuthLayout
  if (layout === 'blank') return BlankLayout
  return DashboardLayout
})

// Initialize dark mode on app start
onMounted(() => {
  uiStore.initDarkMode()
})
</script>
