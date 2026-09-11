<template>
  <router-link
    :to="item.route ?? '#'"
    class="nav-item"
    :class="{ active: isActive, collapsed }"
    :title="collapsed ? item.title : undefined"
  >
    <!-- Icon -->
    <span class="nav-icon">
      <component :is="iconComponent" :size="18" />
    </span>

    <!-- Label + Badge -->
    <Transition name="label">
      <span v-if="!collapsed" class="nav-label">
        {{ item.title }}
        <span v-if="item.badge" class="nav-badge" :class="`badge-${item.badgeVariant ?? 'default'}`">
          {{ item.badge }}
        </span>
      </span>
    </Transition>

    <!-- Active indicator dot (collapsed mode) -->
    <span v-if="collapsed && isActive" class="active-dot" />
  </router-link>
</template>

<script setup lang="ts">
import type { NavItem } from '@/core/types'
import * as LucideIcons from '@lucide/vue'
import { type Component } from 'vue'

const props = defineProps<{
  item: NavItem
  collapsed: boolean
}>()

const route = useRoute()

const isActive = computed(() =>
  props.item.route ? route.path === props.item.route || route.path.startsWith(props.item.route + '/') : false
)

const iconComponent = computed((): Component | string => {
  if (!props.item.icon) return 'span'
  const icon = (LucideIcons as unknown as Record<string, Component>)[props.item.icon]
  return icon ?? 'span'
})
</script>

<style scoped>
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.625rem;
  border-radius: 7px;
  color: var(--text-sidebar);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  position: relative;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
  overflow: hidden;
  margin-bottom: 1px;
}

.nav-item:hover {
  background: var(--border-color);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--bg-sidebar-active);
  color: var(--text-sidebar-active);
}

.nav-item.collapsed {
  justify-content: center;
  padding: 0.5rem;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-sidebar-icon);
  flex-shrink: 0;
  transition: color 0.15s;
}

.nav-item.active .nav-icon {
  color: var(--text-sidebar-icon-active);
}

.nav-label {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.nav-badge {
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 999px;
}

.badge-default { background: var(--border-color); color: var(--text-secondary); }
.badge-success { background: #dcfce7; color: #15803d; }
.badge-warning { background: #fef3c7; color: #b45309; }
.badge-danger { background: #fee2e2; color: #b91c1c; }

.active-dot {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #10b981;
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
