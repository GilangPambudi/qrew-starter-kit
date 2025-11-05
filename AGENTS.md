# AGENTS.md — Panduan untuk Agen AI
Dokumen ini menjelaskan struktur, pola, dan konvensi kode pada proyek ini (Laravel + Inertia + React + TypeScript), agar agen AI dapat bekerja cepat dan aman.

## Ikhtisar Arsitektur
- Backend: Laravel 12 (MVC + Service layer + FormRequest)
- Frontend: Inertia.js + React 19 + TypeScript + Tailwind CSS 4
- Autentikasi: Laravel Fortify
- Routing Frontend: Helper yang digenerasi oleh Wayfinder (TypeScript)
- Fitur utama domain: Manajemen undangan (Invitation) dan tamu (Guest) + QR Code untuk tamu

## Tech Stack & Dependensi Utama
- PHP/Laravel: `laravel/framework`, `inertiajs/inertia-laravel`, `laravel/fortify` (composer.json:1)
- QR Code: `endroid/qr-code` (SVG/PNG), NanoID: `hidehalo/nanoid-php` (composer.json:1)
- Frontend: `@inertiajs/react`, `react`, `typescript`, `tailwindcss`, `@tanstack/react-table`, `lucide-react`, `sonner` (package.json:1)
- Wayfinder: `laravel/wayfinder` backend + `@laravel/vite-plugin-wayfinder` frontend (composer.json:1, package.json:1)

## Struktur Direktori Utama
- Backend
  - `app/Http/Controllers` — Controller MVC (Guest, Invitation, dll.)
  - `app/Http/Requests` — Validasi request via FormRequest
  - `app/Models` — Model Eloquent (primary key non-standar pada beberapa entitas)
  - `app/Services` — Layanan domain (QR, Phone, Guest)
  - `app/Providers/AppServiceProvider.php` — Registrasi service (singleton)
  - `routes/web.php` — Routing aplikasi + `routes/settings.php`
  - `tests/Feature` — Pengujian fitur (PHPUnit/Pest)
- Frontend
  - `resources/js/pages` — Halaman Inertia (TSX)
  - `resources/js/components` — Komponen UI reuseable (shadcn/radix)
  - `resources/js/layouts` — Layout aplikasi
  - `resources/js/routes` — Helper route TypeScript (Wayfinder)
  - `resources/js/types` — TypeScript global types untuk props/data
  - `resources/js/hooks` — Hooks utilitas (mis. tabel, tema)

## Backend

### Routing
- Entry: `routes/web.php:1`
  - Home, Dashboard (Inertia) dan resource `invitations` (Controller: InvitationController)
  - Manajemen tamu (Guest) nested pada `invitation_id` dengan rute khusus untuk index/show/create/store/edit/update/destroy dan utilitas `regenerate-qr`.
  - Semua rute manajemen berada dalam middleware `auth, verified`.
- Setelan tambahan: `routes/settings.php:1` (profil, password, two-factor, appearance)

### Controller
- `app/Http/Controllers/InvitationController.php:1`
  - CRUD Invitation, upload gambar ke disk `public`, statistik agregat (wishes/payments/guests), duplikasi undangan.
- `app/Http/Controllers/GuestController.php:1`
  - Daftar undangan untuk user, daftar/kelola tamu per-undangan dengan filter, sort, dan pagination.
  - Integrasi Service Layer untuk create/update/delete guest dan generate/regenerate QR Code.
- `app/Http/Controllers/QRCodeController.php:1`
  - Contoh pembuatan QR sederhana (berbasis SimpleSoftwareIO) — tidak digunakan di alur utama tamu.

### Model & Relasi
- `app/Models/Invitation.php:1`
  - Tabel `invitations`, primary key `invitation_id` (non-standar), slug unik auto-generate pada create/update.
  - Relasi: `guests`, `wishes`, `payments` (hasMany)
- `app/Models/Guest.php:1`
  - Primary key `guest_id` (non-standar), kolom domain: `guest_id_qr_code`, `guest_qr_code`, status RSVP (`guest_attendance_status`) dan status undangan (`guest_invitation_status`).
  - Relasi: `belongsTo` `Invitation` via `invitation_id`, `belongsTo` `User` via `user_id`.

Catatan: Model `User` menggunakan kolom `user_id` di beberapa tempat; kode mengakomodasi fallback ke `id` (`$user->user_id ?? $user->id`). Pastikan konsisten saat menulis query/relasi.

### Service Layer
- `app/Services/QrCodeService.php:1`
  - Generate ID unik QR tamu berbasis NanoID + slug nama, memastikan unik di DB.
  - Generate file QR (prioritas SVG, fallback PNG) ke `storage/app/public/qr/guests/`, mengembalikan path publik `storage/qr/guests/...` atau sentinel `qr-pending` pada kegagalan.
  - Hapus file QR di disk `public`.
- `app/Services/PhoneService.php:1`
  - Normalisasi nomor telepon ke format `62xxxxxxxxxx` (menghapus non-digit, handling awalan 0/8/62/620) beserta validasi dan format display.
- `app/Services/GuestService.php:1`
  - Orkestrasi create/update/delete Guest, termasuk normalisasi telepon dan generate/regenerate QR ketika nama berubah.

Service didaftarkan sebagai singleton di `app/Providers/AppServiceProvider.php:1` dan di-inject via constructor di controller.

### Validasi (FormRequest)
- `app/Http/Requests/StoreGuestRequest.php:1`, `UpdateGuestRequest.php:1`
  - Aturan field tamu, default status ke '-' bila kosong, dukungan kategori kustom via `guest_category_custom`.
- `app/Http/Middleware/HandleInertiaRequests.php:1`
  - Shared props Inertia: `auth.user`, `name`, `quote`, `sidebarOpen`.

### Penyimpanan File
- QR code disimpan pada disk `public`. Pastikan symlink `public/storage` tersedia (`php artisan storage:link`).

## Frontend

### Entry & Inertia
- `resources/js/app.tsx:1` — Bootstrapping Inertia, dynamic page resolver `resources/js/pages/**.tsx`, progress bar, initialize theme.
- SSR tersedia via `resources/js/ssr.tsx:1` (dan script `composer dev:ssr`).

### Struktur Frontend
- Halaman: `resources/js/pages/*` (contoh: `invitations/show.tsx:1`, `guests/show.tsx:1`, `guests/create.tsx:1`, `guests/edit.tsx:1`)
- Komponen: `resources/js/components/*` (UI shadcn, ikon, header/sidebar, data-table, toaster `ui/sonner.tsx:1`)
- Layout: `resources/js/layouts/*` (mis. `layouts/app-layout.tsx:1`, `layouts/app/app-sidebar-layout.tsx:1`)
- Hooks: `resources/js/hooks/*` (mis. `use-index-list.ts:1` untuk pencarian/sort/paginate tabel berbasis Inertia)
- Types: `resources/js/types/index.d.ts:1` (User/Invitation/Guest/shared props)
- Route helpers TS: `resources/js/routes/*` — dihasilkan dari Wayfinder, mapping ke controller methods (lihat `resources/js/routes/guests/index.ts:1`)

### Pola UI Tabel
- Komponen `resources/js/components/ui/data-table.tsx:1` memakai `@tanstack/react-table` dengan:
  - sorting manual (delegasi ke server via query param),
  - pencarian dan pagination, 
  - toolbar dengan filter tambahan (dibangun di page).

### Toaster & Tema
- Toaster `resources/js/components/ui/sonner.tsx:1` (menggunakan `next-themes` untuk sinkron tema). Tema diset via hook `initializeTheme()`.

## Konvensi Domain & Data
- Primary key non-standar: `invitation_id` (Invitation), `guest_id` (Guest). Gunakan nama kolom ini pada query/relasi.
- Status RSVP tamu: `guest_attendance_status` ∈ {`confirmed`, `attended`, `-`}.
- Status undangan tamu: `guest_invitation_status` ∈ {`sent`, `delivered`, `opened`, `-`}.
- Normalisasi telepon: simpan format `62...` (lihat PhoneService). Frontend juga mempratinjau format ini saat input.
- QR Code tamu:
  - ID: hasil NanoID (10 char) + slug nama, unik di DB.
  - File: disimpan di `storage/qr/guests/*.svg` (prefer) atau `.png` (fallback). Nilai kolom `guest_qr_code` berisi path publik atau `qr-pending`.

## Alur Kerja CRUD Tamu (ringkas)
1) Create (`POST /guests/{invitation}`):
   - Validasi FormRequest → normalisasi telepon → generate QR (ID + file) → simpan Guest.
2) Update (`PUT /guests/{invitation}/{guest}`):
   - Jika `guest_name` berubah → regenerate QR (hapus lama, buat baru) → update Guest.
3) Delete (`DELETE /guests/{invitation}/{guest}`):
   - Hapus file QR terkait → hapus Guest.

## Menambah Fitur: Resep Cepat
- Tambah field/aturan pada Guest:
  - Backend: update kolom fillable di `app/Models/Guest.php:1`, tambah rule di FormRequest, handle di Service bila perlu.
  - Frontend: update `resources/js/types/index.d.ts:1`, form `resources/js/pages/guests/_form.tsx:1`, kolom tabel `resources/js/pages/guests/columns.tsx:1`.

- Tambah halaman Inertia baru:
  - Buat method di Controller → tambah route di `routes/web.php:1` → buat file `resources/js/pages/<path>.tsx` sesuai nama yang di-render Inertia.

- Gunakan route helper TS (Wayfinder):
  - Import dari `resources/js/routes/...` (contoh `guests/index.ts:1`).
  - Setiap helper mendokumentasikan `@see` ke method controller dan pola URL.

## Cara Menjalankan
- Dev (Laravel + Vite):
  - `composer dev` (composer.json:1) akan menjalankan: `php artisan serve`, `queue:listen`, dan `npm run dev` secara paralel.
- Dev dengan SSR Inertia:
  - `composer dev:ssr`
- Build frontend:
  - `npm run build` (atau `vite build`)
- Test (PHPUnit/Pest):
  - `composer test`

Pastikan `.env` sudah benar dan storage link tersedia: `php artisan storage:link`.

## Gaya Kode & Tooling
- TypeScript strict di frontend. Format dengan Prettier + plugin Tailwind; lint dengan ESLint (package.json:1, tsconfig.json:1).
- Backend mengikuti konvensi Laravel; gunakan dependency injection untuk service, FormRequest untuk validasi, dan Eloquent untuk query.
- Hindari komentar inline berlebihan. Ikuti penamaan konsisten (kolom PK non-standar seperti `guest_id`/`invitation_id`).

## Pengujian
- Contoh test: `tests/Feature/QrCodeGenerationTest.php:1` (cek normalisasi phone dan pembuatan guest). Catatan penting: test saat ini mengharapkan `guest_id_qr_code` diawali `"QR"`, namun implementasi `QrCodeService` memakai NanoID + slug nama (bukan prefix `QR`). Pertimbangkan sinkronisasi ekspektasi test vs implementasi sebelum menambah test baru.

## Catatan Keamanan & Akses
- Semua rute manajemen dilindungi `auth` (& `verified` pada grup utama). Controller memfilter data berdasarkan role user (`admin` vs user biasa) dan owner `user_id` (lihat banyak penggunaan `$user->user_id ?? $user->id`). Pastikan konsisten saat menambah query baru.

## Known Issues / Pitfalls
- Inkonistensi ekspektasi test QR (prefix `QR`) vs implementasi (NanoID + slug). Putuskan standar lalu perbarui test/implementasi.
- Pastikan symlink storage tersedia sebelum mengandalkan path publik `storage/...` di frontend.
- Beberapa ikon/komponen memakai kelas Tailwind v4; jaga konsistensi versi saat upgrade.

## Lokasi Kode Penting (Referensi Cepat)
- Routing utama: `routes/web.php:1`
- Controller: `app/Http/Controllers/InvitationController.php:1`, `app/Http/Controllers/GuestController.php:1`
- Service: `app/Services/QrCodeService.php:1`, `app/Services/PhoneService.php:1`, `app/Services/GuestService.php:1`
- Model: `app/Models/Invitation.php:1`, `app/Models/Guest.php:1`
- FormRequest: `app/Http/Requests/StoreGuestRequest.php:1`, `app/Http/Requests/UpdateGuestRequest.php:1`
- Inertia middleware (shared props): `app/Http/Middleware/HandleInertiaRequests.php:1`
- Halaman: `resources/js/pages/invitations/show.tsx:1`, `resources/js/pages/guests/show.tsx:1`
- Komponen tabel: `resources/js/components/ui/data-table.tsx:1`
- Hook tabel: `resources/js/hooks/use-index-list.ts:1`
- Types: `resources/js/types/index.d.ts:1`
- Route helpers TS: `resources/js/routes/guests/index.ts:1`

---

Jika Anda (agen AI) menambah/mengubah file, ikuti pola yang ada, gunakan Service untuk logika domain, FormRequest untuk validasi, dan update type/komponen frontend yang relevan. Tanyakan bila ada ambiguitas domain (status baru, struktur file, dsb.).