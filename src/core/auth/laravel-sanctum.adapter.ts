// src/core/auth/laravel-sanctum.adapter.ts
// Laravel Sanctum Adapter
//
// Setup:
// 1. Set VITE_API_URL di .env (contoh: http://localhost:8000)
// 2. Pastikan Laravel punya route: POST /login, POST /logout, GET /api/user
// 3. Aktifkan adapter ini di src/plugins/auth.ts
//
// Laravel side yang dibutuhkan:
// - Laravel Sanctum sudah diinstall dan dikonfigurasi
// - CORS dikonfigurasi untuk menerima request dari frontend URL
// - Route sanctum/csrf-cookie tersedia (bawaan Sanctum)

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
   * Endpoint login. Default: /login
   */
  loginEndpoint?: string

  /**
   * Endpoint logout. Default: /logout
   */
  logoutEndpoint?: string

  /**
   * Endpoint get user. Default: /api/user
   */
  userEndpoint?: string

  /**
   * Endpoint register. Default: /register
   */
  registerEndpoint?: string

  /**
   * Endpoint forgot password. Default: /forgot-password
   */
  forgotPasswordEndpoint?: string

  /**
   * Endpoint reset password. Default: /reset-password
   */
  resetPasswordEndpoint?: string
}

export class LaravelSanctumAdapter implements AuthAdapter {
  private readonly http: ReturnType<typeof axios.create>
  private readonly opts: Required<SanctumAdapterOptions>

  constructor(options: SanctumAdapterOptions = {}) {
    this.opts = {
      baseURL: options.baseURL ?? import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
      csrfEndpoint: options.csrfEndpoint ?? '/sanctum/csrf-cookie',
      loginEndpoint: options.loginEndpoint ?? '/login',
      logoutEndpoint: options.logoutEndpoint ?? '/logout',
      userEndpoint: options.userEndpoint ?? '/api/user',
      registerEndpoint: options.registerEndpoint ?? '/register',
      forgotPasswordEndpoint: options.forgotPasswordEndpoint ?? '/forgot-password',
      resetPasswordEndpoint: options.resetPasswordEndpoint ?? '/reset-password',
    }

    this.http = axios.create({
      baseURL: this.opts.baseURL,
      withCredentials: true,        // required for Sanctum cookie auth
      withXSRFToken: true,          // auto-attach XSRF-TOKEN cookie
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
  }

  /**
   * Fetch CSRF cookie from Laravel Sanctum before state-changing requests.
   * Required for cookie-based Sanctum auth.
   */
  private async fetchCsrfCookie(): Promise<void> {
    await this.http.get(this.opts.csrfEndpoint)
  }

  async login(payload: LoginPayload): Promise<AuthResponse> {
    await this.fetchCsrfCookie()

    // Laravel Breeze/Fortify compatible login
    await this.http.post(this.opts.loginEndpoint, {
      email: payload.email,
      password: payload.password,
      remember: payload.remember ?? false,
    })

    // After successful login, fetch the authenticated user
    const user = await this.getUser()

    // For Sanctum cookie auth, token is managed via cookies.
    // We use a placeholder token to indicate authenticated state in the store.
    const token = 'sanctum-session' // Sanctum cookie-based, no Bearer token needed

    return { user, token }
  }

  async logout(): Promise<void> {
    await this.fetchCsrfCookie()
    await this.http.post(this.opts.logoutEndpoint)
  }

  async getUser(): Promise<User> {
    const response = await this.http.get<User>(this.opts.userEndpoint)
    return response.data
  }

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    await this.fetchCsrfCookie()
    await this.http.post(this.opts.registerEndpoint, payload)
    const user = await this.getUser()
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
