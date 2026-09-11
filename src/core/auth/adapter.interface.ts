// src/core/auth/adapter.interface.ts
// Auth Adapter interface — implement ini untuk connect ke backend apapun
// Semua adapter HARUS implement interface ini

import type { User } from '@/core/types'

export interface LoginPayload {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation?: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface ResetPasswordPayload {
  email: string
  token: string
  password: string
  password_confirmation: string
}

/**
 * Auth Adapter Interface
 *
 * Implement interface ini untuk connect ke backend apapun.
 * Kemudian daftarkan adapter di src/plugins/auth.ts
 *
 * @example Buat adapter kustom:
 * export class MyAuthAdapter implements AuthAdapter {
 *   async login(payload) { ... }
 *   async logout() { ... }
 *   async getUser() { ... }
 * }
 */
export interface AuthAdapter {
  /**
   * Login dengan email + password.
   * Harus return AuthResponse (user + token).
   */
  login(payload: LoginPayload): Promise<AuthResponse>

  /**
   * Logout — hapus session/token di backend.
   */
  logout(): Promise<void>

  /**
   * Ambil data user yang sedang login.
   * Dipanggil saat app pertama kali load (refresh token).
   */
  getUser(): Promise<User>

  /**
   * Register user baru. Optional — throw Error jika tidak support.
   */
  register?(payload: RegisterPayload): Promise<AuthResponse>

  /**
   * Kirim email reset password. Optional.
   */
  forgotPassword?(email: string): Promise<{ message: string }>

  /**
   * Reset password dengan token. Optional.
   */
  resetPassword?(payload: ResetPasswordPayload): Promise<{ message: string }>
}
