// src/core/auth/laravel-sanctum.adapter.ts
// Laravel Sanctum Adapter
//
// Setup:
// 1. Set VITE_API_URL di .env (contoh: http://localhost:8000)
// 2. Pastikan Laravel punya route: POST /api/login, POST /api/logout, GET /api/user (lihat examples/backend-laravel/)
// 3. Aktifkan adapter ini di src/plugins/auth.ts (atau jalankan: npm run cepat use:backend sanctum)
//
// Mendukung 2 mode Sanctum:
// - Bearer API Token (default & recommended untuk SPA headless / mobile)
// - Stateful Cookie SPA (Laravel Breeze / Fortify)

import type { AuthAdapter, AuthResponse, LoginPayload, RegisterPayload, ResetPasswordPayload } from './adapter.interface'
import type { User } from '@/core/types'
import axios from 'axios'

export interface SanctumAdapterOptions {
  /**
   * Base URL Laravel API. Default: import.meta.env.VITE_API_URL
   */
  baseURL?: string

  /**
   * Endpoint CSRF cookie. Default: /sanctum/csrf-cookie
   */
  csrfEndpoint?: string

  /**
   * Endpoint login. Default: /api/login
   */
  loginEndpoint?: string

  /**
   * Endpoint logout. Default: /api/logout
   */
  logoutEndpoint?: string

  /**
   * Endpoint get user. Default: /api/user
   */
  userEndpoint?: string

  /**
   * Endpoint register. Default: /api/register
   */
  registerEndpoint?: string

  /**
   * Endpoint forgot password. Default: /api/forgot-password
   */
  forgotPasswordEndpoint?: string

  /**
   * Endpoint reset password. Default: /api/reset-password
   */
  resetPasswordEndpoint?: string
}

export class LaravelSanctumAdapter implements AuthAdapter {
  private readonly http: ReturnType<typeof axios.create>
  private readonly opts: Required<SanctumAdapterOptions>

  constructor(options: SanctumAdapterOptions = {}) {
    this.opts = {
      baseURL: options.baseURL ?? import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
      csrfEndpoint: options.csrfEndpoint ?? '/sanctum/csrf-cookie',
      loginEndpoint: options.loginEndpoint ?? '/api/login',
      logoutEndpoint: options.logoutEndpoint ?? '/api/logout',
      userEndpoint: options.userEndpoint ?? '/api/user',
      registerEndpoint: options.registerEndpoint ?? '/api/register',
      forgotPasswordEndpoint: options.forgotPasswordEndpoint ?? '/api/forgot-password',
      resetPasswordEndpoint: options.resetPasswordEndpoint ?? '/api/reset-password',
    }

    this.http = axios.create({
      baseURL: this.opts.baseURL,
      withCredentials: true,        // supports cookie-based auth & cross-origin credentials
      withXSRFToken: true,          // auto-attach XSRF-TOKEN cookie if present
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    })

    // Attach Bearer token to all requests if available
    this.http.interceptors.request.use((config) => {
      const token = this.getStoredToken()
      if (token && token !== 'sanctum-session') {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })
  }

  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('cepat-ui-token') || sessionStorage.getItem('cepat-ui-token')
  }

  /**
   * Fetch CSRF cookie from Laravel Sanctum before state-changing requests.
   * Gracefully ignored in pure Bearer API token mode.
   */
  private async fetchCsrfCookie(): Promise<void> {
    try {
      await this.http.get(this.opts.csrfEndpoint)
    } catch {
      // Non-blocking if backend operates in pure stateless token mode
    }
  }

  async login(payload: LoginPayload): Promise<AuthResponse> {
    await this.fetchCsrfCookie()

    const response = await this.http.post(this.opts.loginEndpoint, {
      email: payload.email,
      password: payload.password,
      remember: payload.remember ?? false,
    })

    const data = response.data

    // 1. Sanctum API Token pattern (matches AuthController.php companion)
    if (data && typeof data === 'object' && 'token' in data && data.token) {
      const token = String(data.token)
      const user = ('user' in data && data.user)
        ? (data.user as User)
        : await this.getUser(token)
      return { user, token }
    }

    // 2. Cookie / Session SPA pattern (Laravel Breeze / Fortify)
    const user = (data && typeof data === 'object' && 'user' in data && data.user)
      ? (data.user as User)
      : await this.getUser()

    return { user, token: 'sanctum-session' }
  }

  async logout(): Promise<void> {
    try {
      await this.fetchCsrfCookie()
      await this.http.post(this.opts.logoutEndpoint)
    } catch {
      // Ignore logout errors (e.g. token already expired or network issue)
    }
  }

  async getUser(tokenOverride?: string): Promise<User> {
    const headers: Record<string, string> = {}
    const token = tokenOverride || this.getStoredToken()
    if (token && token !== 'sanctum-session') {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await this.http.get(this.opts.userEndpoint, { headers })
    const data = response.data

    // Handle both { user: User } (AuthController.php) and direct User model
    if (data && typeof data === 'object' && 'user' in data && data.user) {
      return data.user as User
    }
    return data as User
  }

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    await this.fetchCsrfCookie()
    const response = await this.http.post(this.opts.registerEndpoint, payload)
    const data = response.data

    if (data && typeof data === 'object' && 'token' in data && data.token) {
      const token = String(data.token)
      const user = ('user' in data && data.user)
        ? (data.user as User)
        : await this.getUser(token)
      return { user, token }
    }

    const user = (data && typeof data === 'object' && 'user' in data && data.user)
      ? (data.user as User)
      : await this.getUser()

    return { user, token: 'sanctum-session' }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    await this.fetchCsrfCookie()
    const response = await this.http.post<{ message: string }>(
      this.opts.forgotPasswordEndpoint,
      { email }
    )
    return response.data
  }

  async resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
    await this.fetchCsrfCookie()
    const response = await this.http.post<{ message: string }>(
      this.opts.resetPasswordEndpoint,
      payload
    )
    return response.data
  }
}
