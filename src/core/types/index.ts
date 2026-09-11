// src/core/types/index.ts
// Global TypeScript types for Cepat UI

export interface User {
  id: string | number
  name: string
  email: string
  avatar?: string
  roles: string[]
  permissions: string[]
}

export interface NavItem {
  title: string
  icon?: string
  route?: string
  href?: string
  children?: NavItem[]
  roles?: string[]
  permissions?: string[]
  order?: number
  badge?: string | number
  badgeVariant?: 'default' | 'success' | 'warning' | 'danger'
}

export interface BreadcrumbItem {
  label: string
  to?: string
}

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
  duration?: number
  title?: string
}

export interface ModalOptions {
  component?: object
  props?: Record<string, unknown>
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}
