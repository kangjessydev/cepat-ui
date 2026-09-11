// src/plugins/auth.ts
// 🔌 AUTH PLUGIN — Daftarkan adapter di sini
//
// Ganti MockAuthAdapter dengan adapter yang sesuai:
// - MockAuthAdapter    → untuk development/demo
// - LaravelSanctumAdapter → untuk Laravel backend
//
// Contoh switch ke Laravel:
// import { LaravelSanctumAdapter } from '@/core/auth'
// export const authAdapter = new LaravelSanctumAdapter()

import { MockAuthAdapter } from '@/core/auth'

export const authAdapter = new MockAuthAdapter()
