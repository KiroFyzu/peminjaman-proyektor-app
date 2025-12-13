# 🔐 Sistem Autentikasi - Peminjaman Proyektor

## Fitur Login & Role Management

Sistem peminjaman proyektor sekarang dilengkapi dengan **fitur autentikasi** untuk melindungi halaman-halaman penting. Hanya pengguna yang sudah login yang dapat mengakses halaman selain halaman utama (index).

---

## 🎭 Role Pengguna

### 1. **Admin**
- Memiliki akses penuh ke semua fitur sistem
- Dapat mengelola data peminjaman, pengembalian, dan proyektor
- Dapat melihat dashboard dan statistik

### 2. **Mahasiswa**
- Dapat melakukan peminjaman proyektor
- Dapat mengembalikan proyektor
- Dapat melihat dashboard

---

## 🔑 Akun Default

Setelah instalasi, tersedia 2 akun default:

### Admin
- **Username:** `admin`
- **Password:** `admin123`

### Mahasiswa
- **Username:** `mahasiswa`
- **Password:** `mahasiswa123`

> ⚠️ **Penting:** Segera ubah password default setelah login pertama kali untuk keamanan!

---

## 🚀 Cara Menggunakan

### 1. Jalankan Server
```bash
npm start
```

### 2. Akses Aplikasi
Buka browser dan kunjungi: `http://localhost:3000`

### 3. Login
- Klik tombol **Login** di halaman utama
- Masukkan username dan password
- Klik **Login**
- Anda akan diarahkan ke dashboard

### 4. Registrasi Pengguna Baru
- Klik **Daftar di sini** pada halaman login
- Isi formulir registrasi:
  - Username (untuk login)
  - Password (minimal 6 karakter)
  - Nama Lengkap
  - Role (Admin atau Mahasiswa)
  - Email (opsional)
  - No Telepon (opsional)
- Klik **Daftar**
- Login dengan akun yang baru dibuat

### 5. Logout
- Klik tombol **Logout** di pojok kanan atas

---

## 🔒 Halaman yang Dilindungi

Halaman berikut **memerlukan login**:
- ✅ `/dashboard` - Dashboard & Statistik
- ✅ `/peminjaman` - Form Peminjaman Proyektor
- ✅ `/pengembalian` - Form Pengembalian Proyektor
- ✅ `/booking` - Sistem Booking Proyektor
- ✅ Semua API endpoints (`/api/*`)

Halaman yang **TIDAK memerlukan login**:
- ✅ `/` - Halaman Utama (Index)
- ✅ `/login` - Halaman Login
- ✅ `/register` - Halaman Registrasi

---

## 🛠️ Teknologi yang Digunakan

- **express-session** - Session management
- **bcrypt** - Password hashing (keamanan)
- **MongoDB / JSON** - Database pengguna
- **EJS** - Template engine untuk views

---

## 📁 File-file yang Ditambahkan

### Models
- `models/User.js` - Model MongoDB untuk user
- `models/UserJSON.js` - Model JSON untuk user (mode simulation)
- `models/UserAdapter.js` - Adapter untuk switch antara MongoDB/JSON

### Middleware
- `middleware/auth.js` - Middleware autentikasi (isAuthenticated, isAdmin, isMahasiswa)

### Views
- `views/login.ejs` - Halaman login
- `views/register.ejs` - Halaman registrasi

### Data
- `data/users.json` - Penyimpanan data user (mode simulation)

### Scripts
- `create-default-users.js` - Script untuk membuat akun default

---

## 🔧 Setup & Instalasi

### Install Dependencies
```bash
npm install express-session bcrypt connect-mongo
```

### Buat Akun Default
```bash
node create-default-users.js
```

---

## 📝 Catatan Penting

1. **Session Secret**: Untuk production, ubah `SESSION_SECRET` di file `.env`
   ```env
   SESSION_SECRET=your-very-secure-secret-key-here
   ```

2. **Password Policy**: 
   - Minimal 6 karakter (bisa disesuaikan di `views/register.ejs`)
   - Password di-hash menggunakan bcrypt (aman)

3. **Session Duration**: 
   - Default: 24 jam
   - Bisa diubah di `server.js` bagian session config

4. **Database Mode**:
   - Simulation mode: Data disimpan di `data/users.json`
   - Production mode: Data disimpan di MongoDB Atlas

---

## 🆘 Troubleshooting

### Lupa Password
Jalankan ulang script `create-default-users.js` untuk reset akun default, atau buat akun baru melalui halaman registrasi.

### Session Error
Pastikan secret key sudah di-set dengan benar di konfigurasi session.

### Tidak Bisa Login
1. Cek koneksi database
2. Pastikan user sudah terdaftar
3. Cek konsol untuk error messages

---

## 📞 Support

Jika ada pertanyaan atau masalah, silakan hubungi administrator sistem.

---

**Selamat menggunakan Sistem Peminjaman Proyektor!** 🎉
