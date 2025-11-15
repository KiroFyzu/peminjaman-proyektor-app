# Panduan Migrasi Database ke MongoDB

## 📋 Perubahan yang Dilakukan

Sistem peminjaman proyektor telah berhasil dimigrasi dari penyimpanan file JSON ke database MongoDB.

### Struktur Baru

```
peminjamanProyektor/
├── config/
│   └── database.js         # Konfigurasi koneksi MongoDB
├── models/
│   ├── Peminjaman.js       # Model untuk koleksi peminjaman
│   └── Booking.js          # Model untuk koleksi booking
├── migrate.js              # Script untuk migrasi data
├── .env.example            # Template environment variables
└── server.js               # Server dengan MongoDB (updated)
```

## 🚀 Setup MongoDB

### Option 1: MongoDB Lokal

1. Install MongoDB Community Edition
   - Download dari: https://www.mongodb.com/try/download/community
   - Install dengan default settings

2. Jalankan MongoDB service
   ```
   # Windows
   net start MongoDB
   
   # Atau jalankan manual
   mongod --dbpath "C:\data\db"
   ```

### Option 2: MongoDB Atlas (Cloud - Gratis)

1. Buat akun di https://www.mongodb.com/cloud/atlas
2. Buat cluster gratis
3. Setup database user
4. Whitelist IP address (atau gunakan 0.0.0.0/0 untuk development)
5. Copy connection string

## ⚙️ Konfigurasi

1. Buat file `.env` dari `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. Edit file `.env`:

   **Untuk MongoDB Lokal:**
   ```env
   MONGODB_URI=mongodb://localhost:27017
   DB_NAME=peminjamanProyektor
   PORT=3000
   WHATSAPP_API_BASE_URL=https://waapi.radjaprint.site
   ```

   **Untuk MongoDB Atlas:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
   DB_NAME=peminjamanProyektor
   PORT=3000
   WHATSAPP_API_BASE_URL=https://waapi.radjaprint.site
   ```

## 📦 Install Dependencies

```bash
npm install mongodb dotenv
```

## 🔄 Migrasi Data

Untuk memindahkan data dari file JSON ke MongoDB:

```bash
node migrate.js
```

Script ini akan:
- Connect ke MongoDB
- Membaca data dari `data/peminjaman.json` dan `data/booking.json`
- Menghapus data lama di MongoDB (jika ada)
- Memasukkan data baru
- Membuat index untuk performa

## 🎯 Menjalankan Aplikasi

```bash
npm start
# atau
node server.js
```

Server akan:
1. Connect ke MongoDB
2. Start pada port 3000 (atau sesuai .env)
3. Siap menerima request

## 📊 Struktur Database

### Collection: peminjaman

```javascript
{
  id: String,                    // ID unik (timestamp)
  nama: String,                  // Nama peminjam
  nim: String,                   // NIM
  kelas: String,                 // Kelas
  jurusan: String,               // Jurusan
  mataKuliah: String,            // Mata kuliah
  namaDosen: String,             // Nama dosen
  jamKuliah: String,             // Jam kuliah
  merkProyektor: String,         // Merk proyektor
  noTelepon: String,             // No telepon
  jamMulai: String,              // Jam mulai
  jamSelesai: String,            // Jam selesai
  tanggalPeminjaman: ISODate,   // Tanggal pinjam
  tanggalPengembalian: ISODate, // Tanggal kembali
  status: String,                // 'dipinjam' / 'dikembalikan'
  fotoPeminjaman: String,        // Base64 foto
  fotoPengembalian: String       // Base64 foto
}
```

### Collection: booking

```javascript
{
  id: String,             // ID unik
  nama: String,           // Nama
  nim: String,            // NIM
  kelas: String,          // Kelas
  merkProyektor: String,  // Merk proyektor
  tanggalBooking: String, // Tanggal booking
  jamMulai: String,       // Jam mulai
  jamSelesai: String,     // Jam selesai
  keperluan: String,      // Keperluan
  noTelepon: String,      // No telepon
  status: String,         // 'pending' / 'approved' / 'rejected' / 'completed'
  createdAt: ISODate,     // Tanggal dibuat
  updatedAt: ISODate      // Tanggal update
}
```

## 🔍 Index yang Dibuat

- `peminjaman`: 
  - `id` (unique)
  - `status`
  - `tanggalPeminjaman` (descending)

- `booking`:
  - `id` (unique)
  - `status`
  - `createdAt` (descending)

## 🛠️ Troubleshooting

### Error: "Cannot connect to MongoDB"

1. Cek apakah MongoDB service berjalan:
   ```bash
   # Windows
   sc query MongoDB
   
   # Atau cek process
   tasklist | findstr mongod
   ```

2. Cek connection string di `.env`
3. Untuk Atlas: cek IP whitelist

### Error: "Database not connected"

- Pastikan `connectDB()` dipanggil sebelum operasi database
- Cek logs server saat startup

### Data tidak muncul setelah migrasi

1. Cek apakah migrasi berhasil:
   ```bash
   node migrate.js
   ```

2. Cek di MongoDB Compass atau mongosh:
   ```javascript
   use peminjamanProyektor
   db.peminjaman.find()
   db.booking.find()
   ```

## 📝 Keuntungan MongoDB

1. **Performa**: Query lebih cepat dengan index
2. **Skalabilitas**: Mudah di-scale horizontal
3. **Concurrent Access**: Multi-user tanpa lock file
4. **Query Advanced**: Agregasi, sorting, filtering lebih powerful
5. **Backup**: Tools backup yang mature
6. **Cloud Ready**: Mudah deploy ke production

## 🔄 Rollback ke JSON (Jika Diperlukan)

File JSON lama masih ada di folder `data/`. Untuk rollback:

1. Kembalikan kode `server.js` dari git history
2. Atau gunakan fungsi `readData()` dan `writeData()` yang masih ada (deprecated)

## 📚 Referensi

- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [MongoDB Query API](https://www.mongodb.com/docs/manual/tutorial/query-documents/)
