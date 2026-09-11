// src/core/router/navigation.ts
// 🔑 TAMBAH MENU DI SINI
// Ini adalah sumber kebenaran untuk semua menu di sidebar.
// Setiap item otomatis muncul di sidebar sesuai roles & permissions.

import type { NavItem } from '@/core/types'

export const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    icon: 'LayoutDashboard',
    route: '/dashboard',
    order: 1,
  },
  {
    title: 'Analytics',
    icon: 'BarChart3',
    route: '/analytics',
    order: 2,
  },

  // --- Divider group: Management ---
  {
    title: 'Users',
    icon: 'Users',
    route: '/users',
    order: 10,
    roles: ['admin'],
  },
  {
    title: 'Roles & Permissions',
    icon: 'ShieldCheck',
    route: '/roles',
    order: 11,
    roles: ['admin'],
  },

  // --- Nested menu example ---
  {
    title: 'Settings',
    icon: 'Settings',
    order: 99,
    children: [
      {
        title: 'General',
        icon: 'SlidersHorizontal',
        route: '/settings/general',
      },
      {
        title: 'Security',
        icon: 'Lock',
        route: '/settings/security',
      },
    ],
  },
  {
    title: 'Products',
    icon: 'Package',
    route: '/products',
    order: 3,
  },

  // --- UI Kit Showcase (Bootstrap-style reference) ---
  {
    title: 'UI Kit',
    icon: 'Boxes',
    order: 20,
    badge: 'New',
    badgeVariant: 'success',
    children: [
      {
        title: 'Components',
        icon: 'Component',
        route: '/ui/components',
      },
      {
        title: 'AutoForm',
        icon: 'FormInput',
        route: '/ui/forms',
      },
    ],
  },
]
