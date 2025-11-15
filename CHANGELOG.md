# 📝 Changelog - Update Form Peminjaman

## Perubahan Field Form

### ❌ Field Lama (Dihapus):
- NIM
- Jurusan  
- Mata Kuliah
- Jam Mulai

### ✅ Field Baru (Ditambahkan):
- **Kelas** - Kelas mahasiswa (contoh: TI-3A)
- **Nama Dosen** - Dosen pengampu mata kuliah
- **Jam Kuliah** - Waktu kuliah (contoh: 08:00 - 10:00)

### 🔄 Field yang Tetap:
- Nama Lengkap
- Merk Proyektor
- No. Telepon/WhatsApp
- Foto Bukti Peminjaman

---

## File yang Diupdate

### 1. **server.js**
- ✅ Update endpoint `/api/peminjaman` untuk menerima field baru
- ✅ Update template pesan WhatsApp peminjaman
- ✅ Update template pesan WhatsApp reminder
- ✅ Struktur data JSON disesuaikan

**Field di database:**
```javascript
{
    id: "...",
    nama: "...",
    kelas: "TI-3A",
    namaDosen: "Dr. Ahmad Wijaya",
    jamKuliah: "08:00 - 10:00",
    merkProyektor: "...",
    noTelepon: "...",
    jamSelesai: null,
    tanggalPeminjaman: "...",
    status: "dipinjam",
    fotoPeminjaman: "...",
    fotoPengembalian: null
}
```

### 2. **views/peminjaman.ejs**
- ✅ Update form input untuk field baru:
  - Input Kelas (text)
  - Input Nama Dosen (text)
  - Input Jam Kuliah (text)
- ✅ Update JavaScript submit form
- ✅ Hapus field NIM, Jurusan, Mata Kuliah, Jam Mulai

### 3. **views/dashboard.ejs**
- ✅ Update header tabel:
  - Nama | Kelas | Dosen | Jam Kuliah | Proyektor | Waktu | Status | Aksi
- ✅ Update isi tabel untuk menampilkan field baru
- ✅ Update modal detail peminjaman
- ✅ Update kolom waktu menjadi tanggal peminjaman/pengembalian

### 4. **views/pengembalian.ejs**
- ✅ Update card peminjaman aktif untuk menampilkan:
  - Kelas
  - Nama Dosen
  - Jam Kuliah
  - No. Telepon

### 5. **README.md**
- ✅ Update dokumentasi inputan data
- ✅ Update template pesan WhatsApp
- ✅ Update contoh pesan reminder

---

## Template Pesan WhatsApp (Updated)

### Peminjaman
```
*PEMINJAMAN PROYEKTOR* 📹

Halo *Budi Santoso*,

Peminjaman proyektor Anda telah dicatat dengan detail:

📌 *Kelas:* TI-3A
📌 *Dosen:* Dr. Ahmad Wijaya, S.Kom., M.Kom
📌 *Jam Kuliah:* 08:00 - 10:00
📌 *Proyektor:* Epson EB-S05
📌 *Tanggal:* Senin, 3 November 2025

⚠️ Harap mengembalikan proyektor sesuai waktu yang dijadwalkan.

Terima kasih! 🙏
```

### Reminder
```
*REMINDER PENGEMBALIAN PROYEKTOR* ⏰

Halo *Budi Santoso*,

Ini adalah pengingat untuk mengembalikan proyektor:

📌 *Proyektor:* Epson EB-S05
📌 *Kelas:* TI-3A
📌 *Jam Kuliah:* 08:00 - 10:00
📌 *Tanggal Pinjam:* 03/11/2025

⚠️ Harap segera mengembalikan proyektor ke admin.

Terima kasih! 🙏
```

---

## Backward Compatibility

⚠️ **Catatan Penting:**
- Data lama dengan field NIM/Jurusan/Mata Kuliah akan ditampilkan dengan nilai "-" untuk field baru
- Gunakan `|| '-'` untuk handling data lama:
  ```javascript
  <%= item.kelas || '-' %>
  <%= item.namaDosen || '-' %>
  <%= item.jamKuliah || '-' %>
  ```

---

## Testing Checklist

- [x] Form peminjaman baru dengan field baru
- [x] Dashboard menampilkan data baru dengan benar
- [x] Modal detail menampilkan field baru
- [x] Pengembalian menampilkan data baru
- [x] WhatsApp notification dengan template baru
- [x] Reminder dengan template baru
- [x] Data lama tetap bisa ditampilkan (backward compatible)

---

**Status:** ✅ All changes applied successfully!
**Server:** Running at http://localhost:3000
