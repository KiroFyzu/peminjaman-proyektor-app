# 📱 WhatsApp Integration Guide

## Konfigurasi API

API WhatsApp sudah dikonfigurasi di `server.js`:
```javascript
const WHATSAPP_API_BASE_URL = 'https://waapi.radjaprint.site';
```

## Cara Kerja

### 1. Format Nomor Telepon Otomatis
Fungsi `formatPhoneNumber()` akan otomatis mengkonversi format nomor:

```javascript
// Input dari user
08123456789  → 628123456789 ✅
8123456789   → 628123456789 ✅
+628123456789 → 628123456789 ✅
628123456789  → 628123456789 ✅
```

### 2. Auto-Send saat Peminjaman
Ketika mahasiswa mengisi form peminjaman dan memasukkan nomor WhatsApp, sistem akan:
1. Menyimpan data peminjaman
2. Otomatis mengirim notifikasi WhatsApp
3. Menampilkan pesan sukses

### 3. Auto-Send saat Pengembalian
Ketika admin memproses pengembalian, sistem akan:
1. Update status menjadi "dikembalikan"
2. Otomatis mengirim ucapan terima kasih via WhatsApp
3. Update database

### 4. Manual Actions di Dashboard
Admin dapat mengirim pesan manual:

#### Tombol Kuning (Reminder) - Untuk Peminjaman Aktif
- Muncul jika status = "dipinjam"
- Mengirim reminder untuk mengembalikan proyektor
- Icon: 📱 (WhatsApp)

#### Tombol Hijau (WhatsApp) - Untuk Sudah Dikembalikan
- Muncul jika status = "dikembalikan"
- Mengirim notifikasi/ucapan terima kasih
- Icon: 📱 (WhatsApp)

## Template Pesan

### Notifikasi Peminjaman
```
*PEMINJAMAN PROYEKTOR* 📹

Halo *Budi Santoso*,

Peminjaman proyektor Anda telah dicatat dengan detail:

📌 *NIM:* 2023010001
📌 *Jurusan:* Teknik Informatika
📌 *Mata Kuliah:* Pemrograman Web
📌 *Proyektor:* Epson EB-S05
📌 *Tanggal:* Senin, 3 November 2025
📌 *Jam Mulai:* 08:00

⚠️ Harap mengembalikan proyektor sesuai waktu yang dijadwalkan.

Terima kasih! 🙏
```

### Notifikasi Pengembalian
```
*PENGEMBALIAN PROYEKTOR* ✅

Halo *Budi Santoso*,

Terima kasih telah mengembalikan proyektor *Epson EB-S05*.

📌 *Jam Selesai:* 12:00
📌 *Tanggal Kembali:* 03/11/2025

Status: *SELESAI* ✅

Semoga bermanfaat! 🙏
```

### Reminder Pengembalian
```
*REMINDER PENGEMBALIAN PROYEKTOR* ⏰

Halo *Budi Santoso*,

Ini adalah pengingat untuk mengembalikan proyektor:

📌 *Proyektor:* Epson EB-S05
📌 *Jam Mulai:* 08:00
📌 *Tanggal Pinjam:* 03/11/2025

⚠️ Harap segera mengembalikan proyektor ke admin.

Terima kasih! 🙏
```

## Error Handling

### Nomor Tidak Valid
```javascript
if (!peminjaman.noTelepon || peminjaman.noTelepon === '-') {
    return res.status(400).json({ 
        success: false, 
        message: 'Nomor telepon tidak tersedia' 
    });
}
```

### API Error
```javascript
try {
    const result = await sendWhatsAppMessage(number, message);
} catch (error) {
    res.status(500).json({ 
        success: false, 
        message: 'Gagal mengirim pesan WhatsApp: ' + error.message 
    });
}
```

## Testing

### Test Format Nomor
```javascript
console.log(formatPhoneNumber('08123456789'));  // 628123456789
console.log(formatPhoneNumber('8123456789'));   // 628123456789
console.log(formatPhoneNumber('628123456789')); // 628123456789
console.log(formatPhoneNumber('+62812345678')); // 62812345678
```

### Test Kirim Pesan
1. Buat peminjaman baru dengan nomor WhatsApp valid
2. Cek apakah pesan masuk ke WhatsApp
3. Test reminder dari dashboard
4. Test pengembalian dan cek notifikasi

## Tips & Best Practices

1. **Selalu isi nomor WhatsApp** untuk mendapat notifikasi otomatis
2. **Format nomor bebas** - sistem akan auto-convert
3. **Gunakan reminder** untuk peminjaman yang terlambat
4. **Custom message** bisa ditambahkan via API endpoint

## Troubleshooting

### Pesan tidak terkirim?
- Cek koneksi internet
- Pastikan WhatsApp API online
- Verifikasi format nomor sudah benar
- Cek console log untuk error detail

### Nomor tidak terdeteksi?
- Pastikan field nomor telepon diisi
- Nomor tidak boleh "-"
- Minimal 10-13 digit angka

## Custom Message (Optional)

Jika ingin mengirim pesan custom:

```javascript
const response = await fetch('/api/send-whatsapp/12345', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        customMessage: 'Pesan custom Anda di sini'
    })
});
```

---

**Powered by WhatsApp API** 📱
https://waapi.radjaprint.site
