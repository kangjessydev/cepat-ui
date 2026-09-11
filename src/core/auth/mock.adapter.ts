// src/core/auth/mock.adapter.ts
// Mock Adapter — untuk development & demo
// Login dengan kredensial hardcoded, tidak perlu backend
// JANGAN dipakai di production!

import type { AuthAdapter, AuthResponse, LoginPayload, RegisterPayload } from './adapter.interface'
import type { User } from '@/core/types'

const MOCK_USERS: Array<User & { password: string }> = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password',
    roles: ['admin'],
    permissions: ['users.create', 'users.edit', 'users.delete', 'roles.manage'],
    avatar: undefined,
  },
  {
    id: 2,
    name: 'Regular User',
    email: 'user@example.com',
    password: 'password',
    roles: ['user'],
    permissions: ['dashboard.view'],
    avatar: undefined,
  },
]

export class MockAuthAdapter implements AuthAdapter {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    // Simulate network delay
    await delay(600)

    const found = MOCK_USERS.find(
      u => u.email === payload.email && u.password === payload.password
    )

    if (!found) {
      throw new Error('Invalid email or password')
    }

    const { password: _, ...user } = found
    return {
      user,
      token: `mock-token-${user.id}-${Date.now()}`,
    }
  }

  async logout(): Promise<void> {
    await delay(200)
    // Nothing to do for mock adapter
  }

  async getUser(): Promise<User> {
    await delay(150)
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('cepat-ui-user') || sessionStorage.getItem('cepat-ui-user')
      if (savedUser) {
        try {
          return JSON.parse(savedUser) as User
        } catch {
          // fallback to MOCK_USERS
        }
      }

      const savedToken = localStorage.getItem('cepat-ui-token') || sessionStorage.getItem('cepat-ui-token')
      if (savedToken && savedToken.startsWith('mock-token-')) {
        const parts = savedToken.split('-')
        const userId = Number(parts[2])
        const found = MOCK_USERS.find(u => u.id === userId)
        if (found) {
          const { password: _, ...user } = found
          return user
        }
      }
    }

    // Default fallback to first mock user
    const { password: _, ...defaultUser } = MOCK_USERS[0]
    return defaultUser
  }

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    await delay(700)
    const newUser: User = {
      id: Date.now(),
      name: payload.name,
      email: payload.email,
      roles: ['user'],
      permissions: ['dashboard.view'],
    }
    return {
      user: newUser,
      token: `mock-token-${newUser.id}-${Date.now()}`,
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    await delay(500)
    if (!MOCK_USERS.find(u => u.email === email)) {
      throw new Error('Email not found')
    }
    return { message: `Password reset link sent to ${email}` }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
