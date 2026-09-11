# Laravel Sanctum Companion for Cepat UI

Panduan 3 langkah cepat untuk menghubungkan Cepat UI dengan backend Laravel menggunakan Laravel Sanctum.

---

## 1. Persiapan Laravel & Sanctum

Jika Anda menggunakan proyek Laravel yang baru atau yang sudah ada:

```bash
# Masuk ke proyek Laravel Anda
cd path/to/your-laravel-project

# Install Laravel Sanctum (jika belum terpasang)
composer require laravel/sanctum

# Publikasikan migration dan konfigurasi Sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

Pastikan trait `HasApiTokens` sudah ditambahkan pada model `App\Models\User`:

```php
// app/Models/User.php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens; // <-- Tambahkan ini jika belum ada
    
    // ...
}
```

---

## 2. Copy File Contoh ke Laravel Anda

Salin file-file dari folder ini ke direktori proyek Laravel Anda:

1. **`AuthController.php`** $\rightarrow$ `app/Http/Controllers/Api/AuthController.php`
2. **`routes-api.php`** $\rightarrow$ Tambahkan atau sesuaikan di `routes/api.php`
3. **`cors.php`** $\rightarrow$ Sesuaikan di `config/cors.php`

---

## 3. Konfigurasi CORS & Environment Laravel

### A. CORS (`config/cors.php`)
Pastikan Vite dev server (`http://localhost:5173`) diizinkan mengakses API:

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],

'allowed_methods' => ['*'],

'allowed_origins' => [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    env('FRONTEND_URL', 'http://localhost:5173'),
],

'allowed_headers' => ['*'],

'supports_credentials' => true,
```

### B. Konfigurasi Mode Autentikasi

Cepat UI mendukung dua pola autentikasi Sanctum secara otomatis:

- **Mode 1: Bearer API Token (Default & Recommended)**
  Menggunakan controller contoh `AuthController.php` (`createToken`). Frontend otomatis menangkap personal access token dan mengirimkannya via header `Authorization: Bearer <token>`. Mode ini tidak membutuhkan pengaturan domain session yang rumit.
  
- **Mode 2: Stateful Cookie / Session SPA (Laravel Breeze / Fortify)**
  Jika Anda menggunakan sistem autentikasi session cookie bawaan Laravel Breeze, tambahkan baris berikut pada file `.env` proyek Laravel Anda agar cookie session dikenali:
  ```env
  SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173
  SESSION_DOMAIN=localhost
  ```

---

## 4. Aktifkan Sanctum Adapter di Cepat UI

Di folder frontend Cepat UI, jalankan perintah CLI:

```bash
# Otomatis mengatur src/plugins/auth.ts dan .env (VITE_API_URL=http://localhost:8000)
npm run cepat use:backend sanctum
```

Jika port backend Laravel Anda berbeda, Anda bisa menambahkan flag `--url`:
```bash
npm run cepat use:backend sanctum --url=http://localhost:8080
```

Jalankan backend Laravel Anda:
```bash
php artisan serve
```

Selesai! Sekarang login, logout, dan otentikasi Cepat UI langsung terhubung secara aman dengan backend Laravel Sanctum Anda.
