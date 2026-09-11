# Cepat UI ⚡🇮🇩

> **Vue 3 Dashboard Starter Template** dengan filosofi developer experience semudah **Laravel Filament**: tambah halaman, menu sidebar, dan resource full CRUD cukup dengan satu perintah CLI atau satu file schema.

![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?style=flat-square&logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-8.3-646cff?style=flat-square&logo=vite)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178c6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)
![Pinia](https://img.shields.io/badge/Pinia-v4-ffd859?style=flat-square)

---

## 🌟 Fitur Utama

- ⚡ **Filament-like DX (CLI Generator)**:
  Buat halaman atau resource CRUD lengkap hanya dengan `npm run cepat make:crud <Resource>`. File page, routing Vue Router, dan sidebar navigation otomatis ter-register tanpa coding manual.
- 🎨 **Modern Design System (Slate + Emerald)**:
  Dark mode bawaan yang halus, glassmorphism, responsive collapsible multi-level sidebar, auto-generated breadcrumbs, dan dynamic toast notification.
- 🔐 **Agnostic Auth Adapter System**:
  Auth logic terpisah dari UI melalui Adapter Pattern. Ganti dari **Mock Auth** (untuk development/demo) ke **Laravel Sanctum** (cookie/CSRF based) atau custom backend hanya di `src/plugins/auth.ts`.
- 📋 **DataTable Component**:
  Table bertenaga dengan live search, multi-column sorting, pagination dengan ellipsis, column toggle (hide/show), selection checkbox, dan bulk actions.
- 📝 **AutoForm Builder**:
  Bangun form validasi lengkap hanya dari TypeScript schema object (mendukung text, email, password, number, select, multiselect, textarea, checkbox, toggle, radio, date, file).
- 🧩 **Zero-Boilerplate Auto-Imports**:
  Semua composables (`useAuth`, `useToast`, `useRouter`, `ref`, `computed`) dan UI components (`BaseButton`, `BaseModal`, `DataTable`, `AutoForm`, dll.) ter-import secara otomatis.
- ⌨️ **VS Code Snippets**:
  Ketik `cepat-page`, `cepat-crud`, `cepat-table`, atau `cepat-form` untuk men-scaffold template dalam hitungan detik.

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <repo-url>
cd starter
npm install
```

### 2. Jalankan Dev Server
```bash
npm run dev
```
Buka browser di: **`http://localhost:5173`**

### 3. Akun Demo (Mock Auth Adapter)
Template sudah dilengkapi 2 akun demo bawaan:

| Role | Email | Password | Hak Akses |
|---|---|---|---|
| **Admin** | `admin@cepat.dev` | `password123` | Akses penuh (Dashboard, Users, Products, Settings) |
| **User** | `user@cepat.dev` | `password123` | Akses terbatas (menu admin tidak muncul) |

*(Pada halaman login, klik tombol "Fill Admin" atau "Fill User" untuk auto-fill demo credentials).*

---

## 🛠️ Cepat UI CLI Generator

Cepat UI dilengkapi CLI bawaan di `bin/cepat.mjs` untuk mempercepat pembuatan modul.

```bash
npm run cepat -- <command> [options]
```

### 1. `make:page` — Buat Halaman Baru
Membuat file `.vue` dan **otomatis mendaftarkannya** ke `src/core/router/index.ts` dan `src/core/router/navigation.ts`:

```bash
# Halaman sederhana
npm run cepat -- make:page Reports --icon=FileSpreadsheet

# Halaman khusus role admin
npm run cepat -- make:page AuditLog --icon=ShieldCheck --roles=admin

# Halaman bersarang (sub-menu) di bawah Settings
npm run cepat -- make:page Security --parent=Settings
```

### 2. `make:crud` — Buat Full CRUD Resource
Membuat resource halaman lengkap dengan **DataTable**, **AutoForm modal (Create & Edit)**, **Delete confirmation**, **Search**, **Sorting**, **Pagination**, dan **Bulk Actions**:

```bash
# CRUD standar
npm run cepat -- make:crud Products --icon=Package

# CRUD dengan definisi field kustom dan role restriction
npm run cepat -- make:crud Orders --icon=ShoppingCart --fields=customer:text,total:number,category:select,status:select --roles=admin
```

### 3. `make:component` — Buat Komponen Vue
```bash
npm run cepat -- make:component MetricCard
```

### 4. `make:adapter` — Buat Auth Adapter Baru
```bash
npm run cepat -- make:adapter Supabase
```

### 5. `list:routes` — Lihat Daftar Menu Aktif
```bash
npm run cepat -- list:routes
```

---

## 🧭 Cara Menambah Menu Secara Manual

Jika tidak menggunakan CLI, menambah menu hanya butuh 2 langkah:

### 1. Buat Halaman di `src/pages/<nama>/index.vue`
```vue
<template>
  <div class="page-container">
    <h1 class="page-title">Halaman Baru</h1>
  </div>
</template>
```

### 2. Tambah ke `src/core/router/navigation.ts`
```typescript
export const navigationItems: NavItem[] = [
  // ...
  {
    title: 'Halaman Baru',
    icon: 'Sparkles',       // Nama icon Lucide
    route: '/halaman-baru',
    roles: ['admin'],       // Opsional: RBAC
  },
]
```
Route dan menu sidebar akan langsung muncul otomatis!

---

## 🔐 Auth Adapter System

Arsitektur autentikasi Cepat UI tidak mengikat Anda ke satu backend. Semua logic auth diatur via `AuthAdapter`.

### Adapter Bawaan:
1. **`MockAuthAdapter`** (`src/core/auth/mock.adapter.ts`):
   Menggunakan in-memory data, ideal untuk prototyping cepat tanpa backend.
2. **`LaravelSanctumAdapter`** (`src/core/auth/laravel-sanctum.adapter.ts`):
   Siap pakai untuk backend Laravel dengan cookie-based SPA authentication (CSRF protection + `/sanctum/csrf-cookie`).

### Mengganti Adapter:
Buka file [`src/plugins/auth.ts`](file:///home/kangjessy/Documents/projects/starter/src/plugins/auth.ts):
```typescript
// Ganti adapter di sini:
import { mockAuthAdapter } from '@/core/auth/mock.adapter'
// import { laravelSanctumAdapter } from '@/core/auth/laravel-sanctum.adapter'

export const authAdapter: AuthAdapter = mockAuthAdapter
```

### Menggunakan Auth di Komponen:
```vue
<script setup lang="ts">
const { user, isAuthenticated, hasRole, can, logout } = useAuth()
</script>

<template>
  <div>
    <p>Halo, {{ user?.name }}</p>
    <button v-if="can('users.create')">Tambah User</button>
  </div>
</template>
```

---

## 🧩 Komponen UI Utama

| Komponen | Deskripsi |
|---|---|
| [`BaseButton`](file:///home/kangjessy/Documents/projects/starter/src/components/BaseButton.vue) | Variant: `primary`, `secondary`, `outline`, `ghost`, `danger`. Size: `sm`, `md`, `lg`, `icon`. Loading state. |
| [`BaseBadge`](file:///home/kangjessy/Documents/projects/starter/src/components/BaseBadge.vue) | Variant: `default`, `primary`, `success`, `warning`, `danger`, `info`, `outline`. Optional dot indicator. |
| [`BaseModal`](file:///home/kangjessy/Documents/projects/starter/src/components/BaseModal.vue) | Dialog accessible dengan backdrop blur, escape key, focus trap, dan size preset (`sm`, `md`, `lg`, `xl`, `full`). |
| [`DataTable`](file:///home/kangjessy/Documents/projects/starter/src/components/DataTable/DataTable.vue) | Data table lengkap: live search, multi-col sort, pagination, column toggler, bulk selection. |
| [`AutoForm`](file:///home/kangjessy/Documents/projects/starter/src/components/AutoForm/AutoForm.vue) | Form generator dari schema JSON. Mendukung 12 tipe field, validasi regex/required/min/max/custom, dan multi-column layout. |
| [`StatCard`](file:///home/kangjessy/Documents/projects/starter/src/components/StatCard.vue) | Widget statistik dengan nilai, trend percentage (+/-), dan dynamic icon Lucide. |

---

## ⌨️ VS Code Snippets

Ekstensi snippets sudah terpasang di `.vscode/cepat-ui.code-snippets`:

- `cepat-page` / `vd-page` — Scaffold layout halaman dashboard
- `cepat-crud` / `vd-crud` — Scaffold halaman CRUD lengkap (DataTable + AutoForm modal)
- `cepat-table` / `vd-table` — Definisi columns & row actions DataTable
- `cepat-form` / `vd-form` — Definisi schema fields AutoForm
- `cepat-stat` / `vd-stat` — Stat card widget
- `cepat-modal` / `vd-modal` — Base modal dengan trigger & footer
- `cepat-button` / `vd-btn` — Base button
- `cepat-badge` / `vd-badge` — Base badge
- `cepat-nav` / `vd-nav` — Object menu navigation

---

## ⚙️ Konfigurasi (`src/app.config.ts`)

Atur preferensi global aplikasi di [`src/app.config.ts`](file:///home/kangjessy/Documents/projects/starter/src/app.config.ts):

```typescript
export const appConfig = {
  name: 'Cepat UI',
  description: 'Vue 3 Dashboard Starter Template',

  sidebar: {
    collapsible: true,
    defaultCollapsed: false,
    width: '260px',
  },

  auth: {
    loginRoute: '/login',
    defaultRedirect: '/dashboard',
    persistStrategy: 'localStorage', // 'localStorage' | 'sessionStorage' | 'cookie'
  },

  features: {
    darkMode: true,         // Aktifkan / matikan fitur dark mode
    commandPalette: false,  // Quick launcher (Ctrl+K)
    notifications: true,
  },

  theme: {
    primary: 'emerald',
    gray: 'slate',
    radius: 'md',
  },
}
```

---

## 📁 Struktur Direktori

```
starter/
├── bin/
│   └── cepat.mjs                 # ⚡ Cepat UI CLI Generator
├── src/
│   ├── app.config.ts             # ⚙️ Konfigurasi global aplikasi
│   ├── components/               # 🧩 Reusable UI Components
│   │   ├── AutoForm/             # Form builder dari schema
│   │   ├── DataTable/            # Table dengan search, sort, pagination
│   │   ├── BaseButton.vue
│   │   ├── BaseBadge.vue
│   │   ├── BaseModal.vue
│   │   └── StatCard.vue
│   ├── core/
│   │   ├── auth/                 # Auth Adapters (Mock, Sanctum, Types)
│   │   ├── components/           # Core Layout Components (Sidebar, Navbar, Breadcrumb, Toast)
│   │   ├── composables/          # Core Composables (useAuth, useToast, useApi)
│   │   ├── layouts/              # DashboardLayout, AuthLayout, BlankLayout
│   │   ├── router/               # Vue Router & Navigation Tree (navigation.ts)
│   │   └── stores/               # Pinia stores (auth, ui, toast)
│   ├── pages/                    # 📄 Halaman Aplikasi
│   │   ├── auth/                 # Login, Register, Forgot Password
│   │   ├── dashboard/            # Dashboard overview
│   │   ├── analytics/            # Analytics demo
│   │   ├── users/                # Users management CRUD demo
│   │   ├── products/             # Products CRUD (contoh hasil CLI generator)
│   │   └── settings/             # Settings general
│   └── plugins/                  # 🔌 Plugin initialization (auth adapter selector)
├── .vscode/
│   └── cepat-ui.code-snippets    # ⌨️ VS Code snippets
└── package.json
```

---

## 🧪 Validasi & Quality Check

```bash
# Type-check TypeScript (vue-tsc strict)
npm run type-check

# Production Build
npm run build

# Preview Production Build
npm run preview
```

---

## 📄 Lisensi
MIT License © 2026. Dibuat khusus untuk produktivitas maksimal.
