# Database Mode Configuration

Aplikasi ini mendukung dua mode database:

## 🧪 Simulation Mode (Development)
- Menggunakan file JSON lokal di folder `data/`
- Tidak memerlukan koneksi MongoDB
- Ideal untuk development dan testing
- Data disimpan di:
  - `data/peminjaman.json`
  - `data/booking.json`
  - `data/proyektor.json`

## ☁️ Production Mode (Live)
- Menggunakan MongoDB Atlas (Cloud Database)
- Memerlukan koneksi internet
- Data persisten di cloud
- Cocok untuk deployment production

## Cara Ganti Mode

### Ubah ke Simulation Mode
1. Buka file `.env`
2. Ubah `NODE_ENV` menjadi:
   ```
   NODE_ENV=simulation
   ```
3. Restart server

### Ubah ke Production Mode
1. Buka file `.env`
2. Ubah `NODE_ENV` menjadi:
   ```
   NODE_ENV=production
   ```
3. Pastikan `MONGODB_URI` sudah dikonfigurasi
4. Restart server

## Indikator Mode

### Di Console (Server Startup)
```
🚀 Server berjalan di http://localhost:3000
📱 Sistem Peminjaman Proyektor
📊 Database Mode: 🧪 SIMULATION (Local JSON)
📁 Using local JSON files in data/ folder
```

atau

```
🚀 Server berjalan di http://localhost:3000
📱 Sistem Peminjaman Proyektor
📊 Database Mode: ☁️  PRODUCTION (MongoDB Atlas)
```

### Di Dashboard
Badge kuning "🧪 Simulation" atau badge hijau "☁️ Production" ditampilkan di kanan atas dashboard.

## Struktur Adapter

Aplikasi menggunakan adapter pattern untuk transparansi:

```
models/
├── Peminjaman.js          # MongoDB implementation
├── PeminjamanJSON.js      # JSON file implementation
├── PeminjamanAdapter.js   # Auto-select based on mode
├── Booking.js
├── BookingJSON.js
├── BookingAdapter.js
├── Proyektor.js
├── ProyektorJSON.js
└── ProyektorAdapter.js
```

Semua API endpoint menggunakan adapter, sehingga berfungsi di kedua mode tanpa perubahan kode.

## Testing

### Test Simulation Mode
```bash
# Set mode
# Ubah .env: NODE_ENV=simulation

# Start server
npm start

# Test endpoints
curl http://localhost:3000/api/peminjaman
```

### Test Production Mode
```bash
# Set mode
# Ubah .env: NODE_ENV=production

# Start server
npm start

# Verify MongoDB connection in console
# Test endpoints
curl http://localhost:3000/api/peminjaman
```

## Migrasi Data

### Dari JSON ke MongoDB
```bash
node migrate.js
node migrate-proyektor.js
```

### Dari MongoDB ke JSON
Belum diimplementasikan. Bisa menggunakan export manual atau membuat script baru.

## Troubleshooting

### Error: Cannot connect to MongoDB
- Pastikan `NODE_ENV=production` di `.env`
- Cek `MONGODB_URI` valid
- Cek koneksi internet
- Atau switch ke simulation mode

### Error: Cannot read JSON file
- Pastikan file JSON ada di folder `data/`
- Pastikan struktur JSON valid
- Buat file kosong jika perlu: `echo [] > data/peminjaman.json`

### Data tidak sinkron antara mode
- Data di JSON dan MongoDB terpisah
- Setelah switch mode, data mungkin berbeda
- Gunakan migration script untuk sinkronisasi
