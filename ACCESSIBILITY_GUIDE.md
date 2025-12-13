# 🌟 Panduan Fitur Aksesibilitas Website

## Fitur Mode Aksesibilitas untuk Disabilitas

Website Sistem Peminjaman Proyektor kini dilengkapi dengan **6 Mode Aksesibilitas** yang dirancang khusus untuk membantu pengguna dengan berbagai kebutuhan, termasuk pengguna dengan disabilitas penglihatan.

---

## 📱 Cara Mengakses Menu Aksesibilitas

### Metode 1: Tombol Floating
- Lihat **tombol ungu bulat** dengan icon ♿ di pojok kanan bawah layar
- Klik tombol tersebut untuk membuka menu aksesibilitas

### Metode 2: Keyboard Shortcut
- Tekan **Alt + A** untuk membuka menu aksesibilitas
- Sangat berguna untuk pengguna keyboard/screen reader

---

## 🎨 6 Mode Aksesibilitas yang Tersedia

### 1. 🔵 Mode Normal
- **Fungsi**: Tampilan default website
- **Untuk**: Pengguna dengan penglihatan normal
- **Fitur**: Warna standar, kontras normal, font reguler

### 2. 🌙 Mode Gelap (Dark Mode)
- **Fungsi**: Mengurangi kecerahan layar
- **Untuk**: 
  - Pengguna yang bekerja di malam hari
  - Mengurangi kelelahan mata
  - Menghemat baterai perangkat
- **Fitur**:
  - Background hitam/abu gelap
  - Teks putih/terang
  - Kontras lembut untuk mata

### 3. ⚫⚪ Mode Kontras Tinggi
- **Fungsi**: Kontras maksimal antara teks dan background
- **Untuk**: 
  - **Pengguna dengan Low Vision (Penglihatan Rendah)**
  - Pengguna dengan katarak
  - Pengguna dengan glaukoma
  - Pengguna dengan sensitivitas cahaya
- **Fitur**:
  - Background hitam pekat
  - Teks kuning terang (warna paling kontras)
  - Border tebal pada semua elemen
  - Tombol dengan kontras sangat tinggi
  - Fokus keyboard yang sangat jelas

### 4. 📖 Mode Dyslexia
- **Fungsi**: Font khusus untuk memudahkan membaca
- **Untuk**: 
  - **Pengguna dengan Dyslexia**
  - Kesulitan membaca
  - Gangguan pemrosesan visual
- **Fitur**:
  - Font **OpenDyslexic** (font khusus dyslexia)
  - Spasi antar huruf lebih lebar
  - Spasi antar kata lebih lebar
  - Line height lebih besar
  - Ukuran font lebih besar 10%
  - Font fallback: Comic Sans MS, Arial

### 5. 🎨 Mode Buta Warna (Color Blind Friendly)
- **Fungsi**: Warna yang ramah untuk buta warna
- **Untuk**: 
  - **Pengguna dengan Protanopia** (buta warna merah)
  - **Pengguna dengan Deuteranopia** (buta warna hijau)
  - Kesulitan membedakan warna merah-hijau
- **Fitur**:
  - Warna hijau diganti dengan biru
  - Warna merah diganti dengan oranye
  - Kombinasi warna yang lebih mudah dibedakan
  - Menghindari penggunaan merah-hijau sebagai indikator

### 6. 🔠 Mode Teks Besar
- **Fungsi**: Memperbesar semua teks
- **Untuk**: 
  - Pengguna dengan penglihatan lemah
  - Pengguna lanjut usia
  - Pengguna yang membutuhkan teks lebih besar
- **Fitur**:
  - Semua teks diperbesar 30%
  - Line height lebih lebar
  - Padding tombol lebih besar
  - Lebih mudah dibaca dari jarak jauh

---

## 🔄 Cara Menggunakan

### Langkah-langkah:

1. **Buka Menu Aksesibilitas**
   - Klik tombol ungu di pojok kanan bawah
   - Atau tekan **Alt + A**

2. **Pilih Mode yang Sesuai**
   - Klik salah satu dari 6 mode yang tersedia
   - Mode akan langsung aktif

3. **Notifikasi Konfirmasi**
   - Notifikasi akan muncul di pojok kanan atas
   - Mengkonfirmasi mode yang aktif

4. **Mode Tersimpan Otomatis**
   - Pilihan mode akan tersimpan di browser
   - Saat buka website lagi, mode tetap aktif
   - Tidak perlu setting ulang setiap kali

5. **Reset ke Normal**
   - Klik tombol **"Reset ke Normal"** di menu
   - Atau pilih **"Mode Normal"**

---

## 💡 Tips Penggunaan

### Untuk Pengguna dengan Low Vision:
- ✅ Gunakan **Mode Kontras Tinggi**
- ✅ Atau kombinasikan **Mode Teks Besar** + **Mode Gelap**
- ✅ Gunakan screen magnifier sistem operasi

### Untuk Pengguna dengan Dyslexia:
- ✅ Gunakan **Mode Dyslexia**
- ✅ Bisa dikombinasi dengan **Mode Teks Besar**
- ✅ Font khusus memudahkan membaca

### Untuk Pengguna Buta Warna:
- ✅ Gunakan **Mode Buta Warna**
- ✅ Status tidak hanya bergantung pada warna
- ✅ Gunakan icon dan label teks

### Untuk Pengguna Screen Reader:
- ✅ Semua elemen memiliki label ARIA
- ✅ Keyboard navigation tersedia
- ✅ Fokus indikator yang jelas
- ✅ Announce perubahan mode

---

## ⌨️ Keyboard Navigation

- **Alt + A**: Buka/tutup menu aksesibilitas
- **Tab**: Navigasi antar elemen
- **Enter/Space**: Aktifkan tombol/link
- **Escape**: Tutup menu (akan ditambahkan)

---

## 🔧 Fitur Teknis

### Persistent Mode
- Mode tersimpan di **localStorage**
- Tetap aktif setelah refresh halaman
- Tetap aktif di semua halaman website
- Tidak hilang saat berpindah halaman

### Smooth Transitions
- Transisi warna yang halus (0.3s)
- Animasi menu yang smooth
- Notifikasi dengan animasi

### Accessibility Compliant
- **WCAG 2.1 Level AA** compliant
- **ARIA labels** untuk screen reader
- **Keyboard accessible**
- **Focus indicators** yang jelas
- **Color contrast ratio** minimal 7:1 (kontras tinggi)

---

## 📊 Standar Aksesibilitas

### WCAG 2.1 Guidelines:
- ✅ **1.4.3** Contrast (Minimum) - Level AA
- ✅ **1.4.6** Contrast (Enhanced) - Level AAA (Mode Kontras Tinggi)
- ✅ **1.4.8** Visual Presentation
- ✅ **2.1.1** Keyboard Navigation
- ✅ **2.4.7** Focus Visible
- ✅ **3.1.5** Reading Level (Mode Dyslexia)

---

## 🎯 Keuntungan Fitur Ini

### Untuk Pengguna:
- ✅ **Inklusif**: Dapat diakses oleh semua orang
- ✅ **Nyaman**: Sesuaikan dengan kebutuhan mata
- ✅ **Fleksibel**: 6 pilihan mode
- ✅ **Mudah**: Satu klik untuk ganti mode
- ✅ **Persisten**: Tidak perlu setting berulang

### Untuk Institusi:
- ✅ **Compliance**: Memenuhi standar aksesibilitas
- ✅ **Reputasi**: Menunjukkan kepedulian pada disabilitas
- ✅ **Legal**: Menghindari diskriminasi digital
- ✅ **Universal Design**: Website untuk semua

---

## 🐛 Troubleshooting

### Menu tidak muncul?
- Pastikan JavaScript aktif di browser
- Refresh halaman (Ctrl + F5)
- Clear cache browser

### Mode tidak tersimpan?
- Pastikan cookies/localStorage aktif
- Jangan gunakan mode incognito/private

### Warna tidak berubah?
- Pastikan CSS loaded dengan benar
- Check browser console untuk error
- Pastikan tidak ada extension yang conflict

---

## 🔮 Fitur Mendatang

Rencana pengembangan:
- [ ] Text-to-Speech integration
- [ ] Adjustable font size slider
- [ ] Custom color schemes
- [ ] Voice commands
- [ ] Gesture controls untuk mobile
- [ ] High contrast images
- [ ] Simplified layout mode

---

## 📚 Referensi

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [OpenDyslexic Font](https://opendyslexic.org/)
- [Color Blind Awareness](https://www.colourblindawareness.org/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## 💬 Feedback

Jika ada masukan atau menemukan issue dengan fitur aksesibilitas:
- Hubungi admin melalui WhatsApp
- Atau sampaikan melalui form feedback

---

**Dibuat dengan ❤️ untuk aksesibilitas yang lebih baik**

*"Technology should be accessible to everyone, regardless of their abilities."*

---

**Update Terakhir**: November 2025
**Versi**: 1.0
