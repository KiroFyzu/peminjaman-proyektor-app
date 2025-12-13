# Panduan Campus Header

## Fitur Baru
Website sekarang menampilkan **nama kampus** di bagian header atas setiap halaman.

## Screenshot Header
Header menampilkan:
- 🏛️ Icon universitas
- **Nama Kampus** (besar dan jelas)
- Subtitle: "Sistem Manajemen Peminjaman Proyektor"

## Konfigurasi

### Cara Mengubah Nama Kampus

Edit file `.env` dan ubah nilai berikut:

```env
# Campus Information
CAMPUS_NAME=Universitas Negeri Makassar
CAMPUS_SHORT_NAME=UNM
```

### Parameter:
- **CAMPUS_NAME**: Nama lengkap kampus (ditampilkan di header)
- **CAMPUS_SHORT_NAME**: Nama singkat kampus (untuk keperluan lain di masa depan)

### Contoh Penggunaan:

#### Untuk Universitas Lain:
```env
CAMPUS_NAME=Universitas Indonesia
CAMPUS_SHORT_NAME=UI
```

```env
CAMPUS_NAME=Institut Teknologi Bandung
CAMPUS_SHORT_NAME=ITB
```

```env
CAMPUS_NAME=Universitas Gadjah Mada
CAMPUS_SHORT_NAME=UGM
```

#### Untuk Sekolah/Institusi:
```env
CAMPUS_NAME=SMK Negeri 1 Jakarta
CAMPUS_SHORT_NAME=SMKN1
```

```env
CAMPUS_NAME=Politeknik Negeri Jakarta
CAMPUS_SHORT_NAME=PNJ
```

## Tampilan di Setiap Halaman

### 1. Homepage (Index)
- Header: Gradient Indigo-Purple
- Icon: University (🏛️)
- Navbar: Icon Video Proyektor

### 2. Dashboard
- Header: Gradient Indigo-Purple
- Icon: University (🏛️)
- Navbar: Icon Chart (Dashboard)

### 3. Form Peminjaman
- Header: Gradient Green-Emerald
- Icon: University (🏛️)
- Navbar: Icon Hand Holding (Peminjaman)

### 4. Form Pengembalian
- Header: Gradient Blue-Cyan
- Icon: University (🏛️)
- Navbar: Icon Undo (Pengembalian)

### 5. Booking Proyektor
- Header: Gradient Purple-Pink
- Icon: University (🏛️)
- Navbar: Icon Calendar Check (Booking)

## Keuntungan Fitur Ini

✅ **Branding**: Menampilkan identitas institusi dengan jelas
✅ **Profesional**: Tampilan lebih formal dan terstruktur
✅ **Mudah Dikustomisasi**: Cukup edit file .env tanpa coding
✅ **Responsive**: Header tampil sempurna di mobile dan desktop
✅ **Konsisten**: Muncul di semua halaman website

## Restart Server

Setelah mengubah file `.env`, restart server:

```bash
# Stop server (Ctrl+C di terminal)
# Jalankan ulang
npm start
```

## Catatan Teknis

- Header menggunakan Tailwind CSS gradient
- Font awesome untuk icon university
- Responsive design (tampil baik di semua ukuran layar)
- Z-index sudah diatur agar tidak conflict dengan elemen lain

## Support

Jika ingin mengganti:
- **Warna header**: Edit class `bg-gradient-to-r from-XXX via-XXX to-XXX` di setiap file .ejs
- **Icon**: Edit class `fas fa-university` dengan icon lain dari Font Awesome
- **Tinggi header**: Edit class `py-3` (padding vertical)

---

**Dibuat pada**: November 2025
**Versi**: 1.0
