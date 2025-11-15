# 📹 Sistem Peminjaman Proyektor Kampus

Website untuk mengelola peminjaman proyektor kampus dengan sistem digital yang dilengkapi fitur kamera real-time untuk dokumentasi.

## ✨ Fitur Utama

- ✅ **Form Peminjaman** - Input data peminjam dengan validasi
- ✅ **Form Pengembalian** - Update status pengembalian proyektor
- ✅ **Dashboard** - Monitoring semua peminjaman (aktif & selesai)
- ✅ **Kamera Real-time** - Ambil foto bukti peminjaman & pengembalian langsung dari webcam
- ✅ **WhatsApp Integration** - Notifikasi otomatis via WhatsApp untuk peminjam
- ✅ **Reminder System** - Kirim reminder pengembalian ke peminjam
- ✅ **Auto Phone Format** - Konversi otomatis nomor 08xxx ke 628xxx
- ✅ **Responsive Design** - Tampil sempurna di semua device (Desktop, Tablet, Mobile)
- ✅ **Proyektor Management** - Kelola inventori proyektor dengan detail lengkap
- ✅ **Dual Database Mode** - 🧪 Simulation (Local JSON) atau ☁️ Production (MongoDB Atlas)
- ✅ **Flexible Deployment** - Development offline tanpa MongoDB, production dengan cloud database

## 📋 Inputan Data Peminjaman

1. **Nama Lengkap** - Nama peminjam
2. **Kelas** - Kelas mahasiswa (contoh: TI-3A)
3. **Nama Dosen** - Dosen pengampu mata kuliah
4. **Jam Kuliah** - Waktu kuliah (contoh: 08:00 - 10:00)
5. **Merk Proyektor** - Pilihan proyektor yang tersedia
6. **No. Telepon/WhatsApp** - Untuk notifikasi otomatis (support 08xxx atau 628xxx)
7. **Foto Bukti Peminjaman** - Diambil dari kamera/webcam

## 📱 Fitur WhatsApp Integration

### Auto-Send Notification
- **Peminjaman:** Notifikasi otomatis dikirim saat peminjaman berhasil
- **Pengembalian:** Notifikasi otomatis saat proyektor dikembalikan

### Manual Actions
- **Kirim Reminder:** Tombol kuning (📱) untuk mengirim reminder pengembalian
- **Kirim WhatsApp:** Tombol hijau (📱) untuk mengirim notifikasi manual

### Format Nomor Telepon
Sistem akan otomatis mengkonversi nomor telepon:
- `08123456789` → `628123456789` ✅
- `8123456789` → `628123456789` ✅
- `628123456789` → `628123456789` ✅

### Template Pesan

**Peminjaman:**
```
*PEMINJAMAN PROYEKTOR* 📹

Halo *[Nama]*,

Peminjaman proyektor Anda telah dicatat dengan detail:

📌 *Kelas:* [Kelas]
📌 *Dosen:* [Nama Dosen]
📌 *Jam Kuliah:* [Jam Kuliah]
📌 *Proyektor:* [Merk]
📌 *Tanggal:* [Tanggal]

⚠️ Harap mengembalikan proyektor sesuai waktu yang dijadwalkan.

Terima kasih! 🙏
```

**Pengembalian:**
```
*PENGEMBALIAN PROYEKTOR* ✅

Halo *[Nama]*,

Terima kasih telah mengembalikan proyektor *[Merk]*.

📌 *Jam Selesai:* [Jam]
📌 *Tanggal Kembali:* [Tanggal]

Status: *SELESAI* ✅

Semoga bermanfaat! 🙏
```

**Reminder:**
```
*REMINDER PENGEMBALIAN PROYEKTOR* ⏰

Halo *[Nama]*,

Ini adalah pengingat untuk mengembalikan proyektor:

📌 *Proyektor:* [Merk]
📌 *Kelas:* [Kelas]
📌 *Jam Kuliah:* [Jam Kuliah]
📌 *Tanggal Pinjam:* [Tanggal]

⚠️ Harap segera mengembalikan proyektor ke admin.

Terima kasih! 🙏
```

## 🚀 Cara Menjalankan

### 1. Install Dependencies
```bash
npm install
```

### 2. Konfigurasi Database Mode

Edit file `.env` untuk memilih mode database:

**Simulation Mode (Development - Tanpa MongoDB):**
```env
NODE_ENV=simulation
```

**Production Mode (Live - MongoDB Atlas):**
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/
```

📖 **Lihat dokumentasi lengkap:** `DATABASE_MODE.md` atau `QUICK_START.md`

### 3. Jalankan Server
```bash
npm start
```

Server akan menampilkan mode aktif:
- 🧪 SIMULATION (Local JSON) - Development
- ☁️ PRODUCTION (MongoDB Atlas) - Live

### 4. Buka Browser
Akses aplikasi di: **http://localhost:3000**

## 📁 Struktur Folder

```
peminjamanProyektor/
├── data/
│   └── peminjaman.json          # Database JSON
├── public/
│   ├── js/
│   │   ├── camera.js            # Script kamera peminjaman
│   │   └── camera-return.js     # Script kamera pengembalian
│   └── uploads/                 # Folder foto bukti (auto-generated)
├── views/
│   ├── index.ejs                # Halaman utama
│   ├── peminjaman.ejs           # Form peminjaman
│   ├── pengembalian.ejs         # Form pengembalian
│   └── dashboard.ejs            # Dashboard monitoring
├── server.js                    # Server Express.js
├── package.json
└── README.md
```

## 🛠️ Teknologi yang Digunakan

- **Backend:** Express.js (Node.js)
- **Frontend:** EJS Template Engine
- **Styling:** Tailwind CSS (CDN)
- **Icons:** Font Awesome
- **Database:** 
  - 🧪 **Simulation:** JSON Files (data/*.json)
  - ☁️ **Production:** MongoDB Atlas (Cloud)
- **Upload:** Multer (untuk file handling)
- **Kamera:** MediaDevices API (getUserMedia)
- **WhatsApp API:** https://waapi.radjaprint.site
- **Architecture:** Adapter Pattern untuk dual-mode database

## 📱 Halaman Aplikasi

### 1. **Home Page** (`/`)
- Statistik peminjaman
- Link ke peminjaman & pengembalian

### 2. **Peminjaman** (`/peminjaman`)
- Form input data peminjam
- Fitur kamera untuk foto bukti

### 3. **Pengembalian** (`/pengembalian`)
- List peminjaman aktif
- Form pengembalian dengan foto bukti

### 4. **Dashboard** (`/dashboard`)
- Tabel semua peminjaman
- Filter berdasarkan status
- Detail lengkap dengan foto bukti
- Tombol kirim WhatsApp & Reminder

## 🎯 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/` | Halaman utama |
| GET | `/peminjaman` | Form peminjaman |
| GET | `/pengembalian` | Form pengembalian |
| GET | `/dashboard` | Dashboard monitoring |
| POST | `/api/peminjaman` | Simpan data peminjaman |
| POST | `/api/pengembalian/:id` | Update status pengembalian |
| GET | `/api/peminjaman` | Get semua data peminjaman |
| GET | `/api/peminjaman/aktif` | Get peminjaman aktif |
| DELETE | `/api/peminjaman/:id` | Hapus data peminjaman |
| POST | `/api/send-whatsapp/:id` | Kirim notifikasi WhatsApp |
| POST | `/api/send-reminder/:id` | Kirim reminder pengembalian |

## 🔧 Fitur Kamera

Aplikasi menggunakan **MediaDevices API** untuk mengakses webcam:

- **Toggle Kamera** - Nyalakan/Matikan kamera
- **Capture Photo** - Ambil foto dari live video
- **Retake Photo** - Foto ulang jika kurang puas
- **Auto Stop** - Kamera otomatis mati setelah capture
- **Base64 Storage** - Foto disimpan dalam format base64

## 📊 Status Peminjaman

- 🟢 **Dipinjam** - Proyektor sedang dipinjam
- 🔵 **Dikembalikan** - Proyektor sudah dikembalikan

## 💡 Catatan Penting

1. **Akses Kamera:** Browser akan meminta izin akses kamera saat pertama kali digunakan
2. **HTTPS:** Untuk production, gunakan HTTPS agar fitur kamera berfungsi optimal
3. **Browser Support:** Chrome, Firefox, Edge, Safari (versi terbaru)
4. **File Size:** Foto disimpan dalam format JPEG dengan kualitas 80% untuk efisiensi

## 🔮 Pengembangan Selanjutnya (Opsional)

- [x] ~~Upgrade database ke MongoDB~~ ✅ (Sudah ada dual-mode)
- [x] ~~Sistem proyektor management~~ ✅ (Sudah ada)
- [ ] Export laporan ke PDF/Excel
- [ ] Autentikasi login (Admin & User)
- [ ] Sistem booking/reservasi proyektor dengan calendar
- [ ] QR Code untuk setiap peminjaman
- [ ] Push notification browser
- [ ] Data sync tool (JSON ↔ MongoDB)
- [ ] Analytics & reporting dashboard

## 📞 Support

Jika ada masalah atau pertanyaan, silakan kontak admin kampus.

---

**Developed with ❤️ for Campus Projector Management**
