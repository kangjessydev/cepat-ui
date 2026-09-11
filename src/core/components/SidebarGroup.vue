<template>
  <div class="sidebar-group">
    <!-- Group trigger -->
    <button
      class="group-trigger"
      :class="{ collapsed, open: isOpen }"
      :title="collapsed ? item.title : undefined"
      @click="toggle"
    >
      <span class="nav-icon">
        <component :is="iconComponent" :size="18" />
      </span>
      <Transition name="label">
        <span v-if="!collapsed" class="group-label">
          {{ item.title }}
          <ChevronRight :size="14" class="chevron" :class="{ rotated: isOpen }" />
        </span>
      </Transition>
    </button>

    <!-- Children -->
    <Transition name="group-expand">
      <div v-if="isOpen && !collapsed" class="group-children">
        <SidebarItem
          v-for="child in item.children"
          :key="child.title"
          :item="child"
          :collapsed="false"
          class="child-item"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { NavItem } from '@/core/types'
import * as LucideIcons from '@lucide/vue'
import { ChevronRight } from '@lucide/vue'
import { type Component } from 'vue'
import SidebarItem from './SidebarItem.vue'

const props = defineProps<{
  item: NavItem
  collapsed: boolean
}>()

const route = useRoute()

// Auto-open if a child is active
const isOpen = ref(false)

watchEffect(() => {
  const hasActiveChild = props.item.children?.some(
    child => child.route && route.path.startsWith(child.route)
  ) ?? false
  if (hasActiveChild) isOpen.value = true
})

function toggle() {
  if (!props.collapsed) isOpen.value = !isOpen.value
}

const iconComponent = computed((): Component | string => {
  if (!props.item.icon) return 'span'
  const icon = (LucideIcons as unknown as Record<string, Component>)[props.item.icon]
  return icon ?? 'span'
})
</script>

<style scoped>
.group-trigger {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.5rem 0.625rem;
  border: none;
  background: transparent;
  border-radius: 7px;
  color: var(--text-sidebar);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
  overflow: hidden;
  margin-bottom: 1px;
}

.group-trigger:hover,
.group-trigger.open {
  background: var(--border-color);
  color: var(--text-primary);
}

.group-trigger.collapsed {
  justify-content: center;
  padding: 0.5rem;
}

.nav-icon {
  display: flex;
  align-items: center;
  color: var(--text-sidebar-icon);
  flex-shrink: 0;
  transition: color 0.15s;
}

.group-label {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chevron {
  transition: transform 0.2s ease;
  color: var(--text-muted);
}
.chevron.rotated {
  transform: rotate(90deg);
}

.group-children {
  padding-left: 0.75rem;
  margin-top: 1px;
}

.child-item {
  font-size: 0.8125rem;
}

/* expand transition */
.group-expand-enter-active,
.group-expand-leave-active {
  transition: max-height 0.25s ease, opacity 0.2s ease;
  overflow: hidden;
  max-height: 300px;
}
.group-expand-enter-from,
.group-expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.label-enter-active,
.label-leave-active {
  transition: opacity 0.15s ease;
}
.label-enter-from,
.label-leave-to {
  opacity: 0;
}
</style>
