# Cepat UI

Vue 3 dashboard starter template dengan arsitektur modular, design system berbasis Tailwind CSS v4 & CSS Variables, schema-driven form builder, dan backend-agnostic authentication adapter.

---

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Memulai Cepat](#memulai-cepat)
- [Akun Demo Bawaan](#akun-demo-bawaan)
- [Komponen UI & Showcase](#komponen-ui--showcase)
- [AutoForm](#autoform)
- [DataTable](#datatable)
- [DatePicker & BottomSheet](#datepicker--bottomsheet)
- [CLI Generator](#cli-generator)
- [Integrasi Backend & Autentikasi](#integrasi-backend--autentikasi)
- [Menambah Halaman & Menu Manual](#menambah-halaman--menu-manual)
- [Struktur Direktori](#struktur-direktori)
- [Perintah Tersedia](#perintah-tersedia)
- [Lisensi](#lisensi)

---

## Fitur Utama

- **Vue 3 + TypeScript Strict**: Dibangun di atas Vue 3 (Composition API, `<script setup>`) dan TypeScript dengan pemeriksaan tipe ketat (`vue-tsc`).
- **Design System & Dark Mode**: Skema warna Slate + Emerald menggunakan CSS variables murni tanpa utility class ad-hoc yang mengotori template. Mode gelap otomatis tersinkronisasi.
- **UI Kit Primitives**: Menyediakan `BaseButton`, `BaseBadge`, `BaseCard`, `BaseAlert`, `BaseModal`, `BaseBottomSheet`, `BaseTabs`, dan `BaseDatePicker`.
- **Schema-Driven AutoForm**: Membuat form lengkap beserta validasi, multi-kolom grid, responsive collapse, dan 12+ jenis input hanya melalui deklarasi objek schema TypeScript.
- **Data Table Lengkap**: Dilengkapi pencarian real-time, pengurutan multi-kolom, pagination dinamis, seleksi baris (bulk action), dan kolom toggle (sembunyikan/tampilkan).
- **Backend Adapter Pattern**: UI tidak terikat pada framework backend tertentu. Beralih dari Mock Auth ke Laravel Sanctum atau REST API kustom hanya dengan satu perintah CLI.
- **CLI Generator**: Scaffold resource CRUD lengkap, halaman baru, atau komponen dengan integrasi routing otomatis.
- **Auto-Imports**: Modul Vue, Vue Router, Pinia, dan komponen UI di-import otomatis via `unplugin-auto-import` dan `unplugin-vue-components`.

---

## Memulai Cepat

### 1. Kloning Repository & Instalasi Dependensi

```bash
git clone https://github.com/kangjessydev/cepat-ui.git
cd cepat-ui
npm install
```

### 2. Jalankan Development Server

```bash
npm run dev
```

Buka peramban pada alamat `http://localhost:5173`.

### 3. Build untuk Produksi

```bash
npm run build
```

---

## Akun Demo Bawaan

Secara default, aplikasi berjalan menggunakan **Mock Auth Adapter** (data tersimpan in-memory, tidak membutuhkan database untuk uji coba).

| Role | Email | Password | Cakupan Akses |
|---|---|---|---|
| **Admin** | `admin@cepat.dev` | `password123` | Akses penuh (Dashboard, Users, Products, Settings, UI Kit) |
| **User** | `user@cepat.dev` | `password123` | Akses terbatas (menu admin disembunyikan otomatis) |

*Catatan: Pada halaman login terdapat tombol shortcut untuk mengisi kredensial secara otomatis.*

---

## Komponen UI & Showcase

Cepat UI menyertakan halaman katalog interaktif untuk melihat seluruh komponen yang siap pakai:

- **UI Components Catalog**: `http://localhost:5173/ui/components`
- **AutoForm Playground**: `http://localhost:5173/ui/forms`

### Ringkasan Komponen Dasar

| Komponen | File Path | Opsi / Varian |
|---|---|---|
| `BaseButton` | `src/components/BaseButton.vue` | Varian: `primary`, `secondary`, `outline`, `ghost`, `danger`. Ukuran: `sm`, `md`, `lg`. State: `loading`, `disabled`. Slot icon prefix/suffix. |
| `BaseBadge` | `src/components/BaseBadge.vue` | Varian: `default`, `primary`, `success`, `warning`, `danger`. Opsi indikator titik (`dot`). |
| `BaseCard` | `src/components/BaseCard.vue` | Varian: `default`, `elevated`, `bordered`. Padding: `none`, `sm`, `md`, `lg`. Slot: `header`, `header-actions`, `default`, `footer`. |
| `BaseAlert` | `src/components/BaseAlert.vue` | Varian: `info`, `success`, `warning`, `danger`. Opsi dismissible dengan tombol tutup. |
| `BaseTabs` | `src/components/BaseTabs.vue` | Varian: `pills`, `underline`. Mendukung icon, count badge, dan swipe scroll pada layar mobile. |
| `BaseModal` | `src/components/BaseModal.vue` | Dialog modal terpusat. Ukuran: `sm`, `md`, `lg`, `xl`, `full`. Mendukung backdrop blur, tombol Escape, dan `persistent`. |
| `BaseBottomSheet` | `src/components/BaseBottomSheet.vue` | Drawer slide-up mobile. Mendukung touch swipe gesture dismiss, grab handle, dan backdrop lock. |
| `BaseDatePicker` | `src/components/BaseDatePicker.vue` | Kalender custom popover dengan smart auto-flip (ke atas/bawah sesuai ruang layar) atau fallback picker native browser (`native: true`). |
| `StatCard` | `src/components/StatCard.vue` | Kartu metrik dengan trend persentase indikator (+/-) dan icon dinamis. |

---

## AutoForm

`AutoForm` memungkinkan pembuatan form dinamis berskala besar tanpa perlu menulis boilerplate elemen input satu per satu.

### Contoh Penggunaan

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { AutoForm, type FormSchema } from '@/components/AutoForm'

const formData = ref({
  fullName: '',
  email: '',
  role: 'member',
  agree: false,
})

const schema: FormSchema = {
  columns: 2,
  submitLabel: 'Simpan Data',
  cancelLabel: 'Batal',
  fields: [
    {
      name: 'fullName',
      label: 'Nama Lengkap',
      type: 'text',
      placeholder: 'Masukkan nama lengkap',
      required: true,
      span: 1,
    },
    {
      name: 'email',
      label: 'Alamat Email',
      type: 'email',
      placeholder: 'nama@domain.com',
      required: true,
      span: 1,
    },
    {
      name: 'role',
      label: 'Role Akun',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Member', value: 'member' },
      ],
      span: 2,
    },
    {
      name: 'agree',
      label: 'Saya menyetujui syarat & ketentuan',
      type: 'checkbox',
      required: true,
      span: 2,
    },
  ],
}

function handleSubmit(values: Record<string, unknown>) {
  console.log('Submitted values:', values)
}
</script>

<template>
  <AutoForm
    v-model="formData"
    :schema="schema"
    @submit="handleSubmit"
  />
</template>
```

### Tipe Field yang Didukung
`text`, `email`, `password`, `number`, `tel`, `url`, `textarea`, `select`, `checkbox`, `toggle`, `radio`, `date`, `datetime`, `file`, `hidden`.

---

## DataTable

`DataTable` menyediakan tabel data berbasis client atau server-ready dengan fitur lengkap.

### Contoh Penggunaan

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DataTable, type DataTableColumn } from '@/components/DataTable'

const columns: DataTableColumn[] = [
  { key: 'name', label: 'Nama', sortable: true, searchable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Tanggal Dibuat', sortable: true },
]

const users = ref([
  { id: 1, name: 'Jessy', role: 'admin', status: 'Active', createdAt: '2026-01-10' },
  { id: 2, name: 'Alex', role: 'editor', status: 'Inactive', createdAt: '2026-02-14' },
])

const selectedRows = ref([])
</script>

<template>
  <DataTable
    :data="users"
    :columns="columns"
    v-model:selected="selectedRows"
    searchable
    selectable
    exportable
  />
</template>
```

---

## DatePicker & BottomSheet

`BaseDatePicker` mengadopsi filosofi Filament:
1. **Mode Custom (Default, `native: false`)**: Popover kalender kustom yang di-teleport langsung ke `body`. Komponen secara otomatis mendeteksi ruang layar (auto-flip ke atas bila ruang bawah sempit) sehingga tidak terpotong oleh overflow kontainer.
2. **Mode Native (`native: true`)**: Menggunakan input date bawaan sistem operasi browser pengguna.
3. **Responsif Mobile**: Pada viewport layar sempit (`<= 640px`), kalender custom otomatis beralih menjadi `BaseBottomSheet` yang dapat ditutup dengan gesture swipe ke bawah.

```vue
<!-- Kalender custom popover dengan smart flip -->
<BaseDatePicker v-model="targetDate" placeholder="Pilih tanggal rilis..." />

<!-- Fallback native browser -->
<BaseDatePicker v-model="targetDate" native />
```

---

## CLI Generator

Cepat UI menyediakan antarmuka CLI melalui script `bin/cepat.mjs`:

```bash
npm run cepat -- <command> [options]
```

### 1. `make:crud` — Scaffold Full CRUD Resource
Menghasilkan halaman manajemen data lengkap dengan `DataTable`, form modal (Create/Edit), dialog konfirmasi hapus, pencarian, dan sorting. File routing dan menu navigasi otomatis didaftarkan.

```bash
# CRUD standar
npm run cepat -- make:crud Customers --icon=Users

# CRUD dengan schema kolom dan batasan role admin
npm run cepat -- make:crud Orders --icon=ShoppingCart --fields=customer:text,total:number,status:select --roles=admin
```

### 2. `make:page` — Buat Halaman Kosong
Membuat file halaman Vue dan otomatis menyematkannya ke sidebar navigation.

```bash
# Halaman root
npm run cepat -- make:page Analytics --icon=BarChart2

# Halaman bersarang (sub-menu di bawah Settings)
npm run cepat -- make:page Security --parent=Settings
```

### 3. `use:backend` — Beralih Adapter Backend
Mengubah adapter aktif di `src/plugins/auth.ts` dan memperbarui URL API pada berkas `.env`.

```bash
# Mengaktifkan backend Laravel Sanctum
npm run cepat -- use:backend sanctum

# Mengaktifkan backend Laravel dengan custom host/port
npm run cepat -- use:backend sanctum --url=http://localhost:8080

# Mengembalikan ke Mock Adapter (in-memory)
npm run cepat -- use:backend mock
```

### 4. `list:routes` — Tinjau Daftar Rute Aktif
```bash
npm run cepat -- list:routes
```

---

## Integrasi Backend & Autentikasi

Arsitektur autentikasi Cepat UI menggunakan pola Adapter (`AuthAdapter`). Kode UI tidak pernah memanggil endpoint auth secara langsung, melainkan melalui antarmuka adapter:

```
[UI Components / Pages]
         │
         ▼
    [useAuth()]
         │
         ▼
   [authAdapter]  ── (Interface: login, logout, me, register)
         │
    ┌────┴────────────────────────┐
    ▼                             ▼
[MockAuthAdapter]     [LaravelSanctumAdapter]
(In-memory array)     (Cookie/CSRF SPA Session)
```

### Menggunakan Laravel Sanctum

Starter ini menyertakan template companion backend siap pakai di folder [`examples/backend-laravel/`](examples/backend-laravel/):
- `AuthController.php`: Endpoint login, register, me, dan logout yang sesuai dengan kontrak User Cepat UI.
- `routes-api.php`: Definisi rute autentikasi Laravel.
- `cors.php`: Konfigurasi CORS dengan `supports_credentials => true`.

Untuk beralih:
```bash
npm run cepat -- use:backend sanctum
```
Pastikan backend Laravel Anda berjalan pada port yang sesuai (`php artisan serve`).

### Menggunakan useAuth() di Komponen

```vue
<script setup lang="ts">
import { useAuth } from '@/core/composables/useAuth'

const { user, isAuthenticated, hasRole, can, logout } = useAuth()
</script>

<template>
  <div>
    <p v-if="isAuthenticated">Masuk sebagai: {{ user?.name }}</p>
    <button v-if="can('users.create')">Buat Pengguna</button>
    <button @click="logout">Keluar</button>
  </div>
</template>
```

---

## Menambah Halaman & Menu Manual

Jika ingin menambahkan menu tanpa CLI:

1. Buat berkas halaman Vue baru di `src/pages/<nama>/index.vue`.
2. Buka `src/core/router/navigation.ts`, tambahkan entri menu ke array `navigationItems`:

```typescript
export const navigationItems: NavItem[] = [
  // ...
  {
    title: 'Laporan Keuangan',
    icon: 'Receipt',          // Nama icon Lucide
    route: '/laporan',
    roles: ['admin'],         // Opsional: batasan role
  },
]
```

Menu dan rute akan otomatis aktif di sidebar dan sistem navigasi breadcrumb.

---

## Struktur Direktori

```
cepat-ui/
├── bin/
│   └── cepat.mjs                   # CLI tool generator
├── examples/
│   └── backend-laravel/            # Companion backend Laravel Sanctum
├── src/
│   ├── app.config.ts               # Konfigurasi branding dan preferensi app
│   ├── components/                 # Komponen UI Cepat UI
│   │   ├── AutoForm/               # Schema-driven dynamic form
│   │   ├── DataTable/              # Data table dengan search, sort, pagination
│   │   ├── BaseAlert.vue
│   │   ├── BaseBadge.vue
│   │   ├── BaseBottomSheet.vue
│   │   ├── BaseButton.vue
│   │   ├── BaseCard.vue
│   │   ├── BaseDatePicker.vue
│   │   ├── BaseModal.vue
│   │   ├── BaseTabs.vue
│   │   └── StatCard.vue
│   ├── core/
│   │   ├── auth/                   # Adapter & tipe autentikasi (Mock, Sanctum)
│   │   ├── components/             # Layout shell (AppSidebar, AppNavbar, AppBreadcrumb, Toast)
│   │   ├── composables/            # useAuth, useToast, useApi
│   │   ├── layouts/                # DashboardLayout, AuthLayout, BlankLayout
│   │   ├── router/                 # Vue Router setup & navigation tree
│   │   └── stores/                 # Pinia stores (auth, ui, toast)
│   ├── pages/                      # File-based view components
│   │   ├── auth/                   # Login, Register, Forgot Password
│   │   ├── dashboard/              # Halaman Dashboard
│   │   ├── analytics/              # Halaman Analytics
│   │   ├── users/                  # Manajemen Pengguna (CRUD)
│   │   ├── products/               # Contoh Resource CRUD
│   │   └── ui/                     # UI Kit Showcase (components & forms)
│   └── plugins/
│       └── auth.ts                 # Registry instance AuthAdapter aktif
├── .env.example
├── package.json
└── tsconfig.json
```

---

## Perintah Tersedia

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan Vite development server lokal (`localhost:5173`) |
| `npm run build` | Menjalankan type-check lalu mem-build bundle produksi |
| `npm run preview` | Menjalankan preview lokal dari hasil build produksi |
| `npm run type-check` | Menjalankan verifikasi tipe TypeScript (`vue-tsc -b --noEmit`) |
| `npm run cepat` | Menjalankan Cepat UI CLI Generator |

---

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).
