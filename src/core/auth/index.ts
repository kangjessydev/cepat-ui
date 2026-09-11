// src/core/auth/index.ts
// Re-export semua auth adapters untuk kemudahan import

export type { AuthAdapter, AuthResponse, LoginPayload, RegisterPayload, ResetPasswordPayload } from './adapter.interface'
export { MockAuthAdapter } from './mock.adapter'
export { LaravelSanctumAdapter } from './laravel-sanctum.adapter'
export type { SanctumAdapterOptions } from './laravel-sanctum.adapter'
