<template>
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <template v-for="(crumb, i) in breadcrumbs" :key="crumb.label">
      <ChevronRight v-if="i > 0" :size="13" class="separator" />
      <router-link v-if="crumb.to && i < breadcrumbs.length - 1" :to="crumb.to" class="crumb-link">
        {{ crumb.label }}
      </router-link>
      <span v-else class="crumb-current">{{ crumb.label }}</span>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { ChevronRight } from '@lucide/vue'
import type { BreadcrumbItem } from '@/core/types'
import { navigationItems } from '@/core/router/navigation'
import type { NavItem } from '@/core/types'

const route = useRoute()

function findNavItem(items: NavItem[], path: string): NavItem | null {
  for (const item of items) {
    if (item.route === path) return item
    if (item.children) {
      const found = findNavItem(item.children, path)
      if (found) return found
    }
  }
  return null
}

function findParent(items: NavItem[], child: NavItem): NavItem | null {
  for (const item of items) {
    if (item.children?.includes(child)) return item
    if (item.children) {
      const found = findParent(item.children, child)
      if (found) return found
    }
  }
  return null
}

const breadcrumbs = computed((): BreadcrumbItem[] => {
  const crumbs: BreadcrumbItem[] = [{ label: 'Home', to: '/dashboard' }]
  const currentItem = findNavItem(navigationItems, route.path)

  if (currentItem) {
    const parent = findParent(navigationItems, currentItem)
    if (parent) {
      crumbs.push({ label: parent.title, to: parent.route })
    }
    crumbs.push({ label: currentItem.title, to: route.path })
  } else if (route.meta.title) {
    crumbs.push({ label: route.meta.title as string })
  }

  return crumbs
})
</script>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.separator {
  color: var(--text-muted);
}

.crumb-link {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.15s;
}

.crumb-link:hover {
  color: var(--text-primary);
}

.crumb-current {
  font-size: 0.8125rem;
  color: var(--text-primary);
  font-weight: 600;
}
</style>
