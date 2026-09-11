// src/core/router/index.ts
import { useAuthStore } from '@/core/stores/auth.store'
import { authAdapter } from '@/plugins/auth'
import appConfig from '@/app.config'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Auth layout routes
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/auth/login.vue'),
      meta: { layout: 'auth', requiresAuth: false },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/pages/auth/register.vue'),
      meta: { layout: 'auth', requiresAuth: false },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/pages/auth/forgot-password.vue'),
      meta: { layout: 'auth', requiresAuth: false },
    },

    // Dashboard layout routes
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/pages/dashboard/index.vue'),
      meta: { layout: 'dashboard', requiresAuth: true, title: 'Dashboard' },
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: () => import('@/pages/analytics/index.vue'),
      meta: { layout: 'dashboard', requiresAuth: true, title: 'Analytics' },
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('@/pages/users/index.vue'),
      meta: { layout: 'dashboard', requiresAuth: true, title: 'Users', roles: ['admin'] },
    },
    {
      path: '/settings/general',
      name: 'settings-general',
      component: () => import('@/pages/settings/general.vue'),
      meta: { layout: 'dashboard', requiresAuth: true, title: 'General Settings' },
    },
    {
      path: '/settings/security',
      name: 'settings-security',
      component: () => import('@/pages/settings/security.vue'),
      meta: { layout: 'dashboard', requiresAuth: true, title: 'Security Settings' },
    },

    {
      path: '/products',
      name: 'products',
      component: () => import('@/pages/products/index.vue'),
      meta: { layout: 'dashboard', requiresAuth: true, title: 'Products' },
    },
    // UI Kit Showcase
    {
      path: '/ui/components',
      name: 'ui-components',
      component: () => import('@/pages/ui/components.vue'),
      meta: { layout: 'dashboard', requiresAuth: true, title: 'UI Components' },
    },
    {
      path: '/ui/forms',
      name: 'ui-forms',
      component: () => import('@/pages/ui/forms.vue'),
      meta: { layout: 'dashboard', requiresAuth: true, title: 'AutoForm Showcase' },
    },
    // 404
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/pages/404.vue'),
      meta: { layout: 'blank' },
    },
  ],
})

// Navigation guard
let sessionRestored = false

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // On first navigation, try to restore session from storage then adapter
  if (!sessionRestored) {
    sessionRestored = true
    auth.initAuth() // Load token+user from localStorage first (instant)

    // Then validate token with backend (async, non-blocking for mock adapter)
    // For real adapters like Sanctum, this re-fetches user data
    if (auth.token) {
      try {
        const user = await authAdapter.getUser()
        auth.user = user
      } catch {
        auth.clearAuth()
      }
    }
  }

  const requiresAuth = to.meta.requiresAuth !== false

  // Redirect to login if not authenticated
  if (requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // Redirect to dashboard if already authenticated and going to auth pages
  if (!requiresAuth && auth.isAuthenticated && to.meta.layout === 'auth') {
    return { path: appConfig.auth.defaultRedirect }
  }

  // Role-based access control
  const requiredRoles = to.meta.roles as string[] | undefined
  if (requiredRoles && !requiredRoles.some(role => auth.hasRole(role))) {
    return { name: 'dashboard' }
  }
})

export default router
