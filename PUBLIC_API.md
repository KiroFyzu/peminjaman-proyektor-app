# Public API Documentation

## 📊 Public Endpoints (No Authentication Required)

API endpoints berikut dapat diakses tanpa login dan ditampilkan di halaman homepage untuk pengunjung umum.

---

## 1. Get Public Statistics

**Endpoint:** `GET /api/public/stats`

**Description:** Mendapatkan statistik peminjaman proyektor untuk ditampilkan di homepage.

**Authentication:** ❌ Tidak diperlukan (Public)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPeminjaman": 150,
    "peminjamanAktif": 12,
    "peminjamanSelesai": 138,
    "hariIni": 5
  }
}
```

**Response Fields:**
- `totalPeminjaman`: Total semua peminjaman
- `peminjamanAktif`: Proyektor yang sedang dipinjam
- `peminjamanSelesai`: Peminjaman yang sudah dikembalikan
- `hariIni`: Peminjaman hari ini

**Example Usage:**
```javascript
// Fetch statistics
fetch('/api/public/stats')
  .then(res => res.json())
  .then(data => {
    console.log('Stats:', data.data);
  });
```

---

## 2. Get Public Proyektor List

**Endpoint:** `GET /api/public/proyektor`

**Description:** Mendapatkan daftar proyektor yang tersedia dengan informasi status.

**Authentication:** ❌ Tidak diperlukan (Public)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "kode": "PROJ-001",
      "merk": "Epson EB-X400",
      "jenis": "LCD Proyektor",
      "status": "tersedia",
      "totalPeminjaman": 45
    },
    {
      "kode": "PROJ-002",
      "merk": "BenQ MH535",
      "jenis": "DLP Proyektor",
      "status": "dipinjam",
      "totalPeminjaman": 38
    }
  ]
}
```

**Response Fields:**
- `kode`: Kode unik proyektor
- `merk`: Merk dan model proyektor
- `jenis`: Jenis/tipe proyektor
- `status`: Status proyektor (`tersedia`, `dipinjam`, `maintenance`)
- `totalPeminjaman`: Total kali proyektor dipinjam

**Example Usage:**
```javascript
// Fetch proyektor list
fetch('/api/public/proyektor')
  .then(res => res.json())
  .then(result => {
    const proyektorList = result.data;
    proyektorList.forEach(p => {
      console.log(`${p.kode}: ${p.status}`);
    });
  });
```

---

## 🔒 Protected Endpoints (Authentication Required)

Untuk endpoint lain yang memerlukan autentikasi, user harus login terlebih dahulu. Endpoint protected antara lain:

- `GET /api/peminjaman` - Get all peminjaman (requires login)
- `POST /api/peminjaman` - Create peminjaman (requires login)
- `GET /api/proyektor` - Get full proyektor details (requires login)
- `POST /api/proyektor` - Create proyektor (requires login)
- etc.

---

## 📍 Implementation in Homepage

Di file `views/index.ejs`, kedua endpoint public ini digunakan untuk:

### 1. Statistics Section
```javascript
async function loadStats() {
    const response = await fetch('/api/public/stats');
    const result = await response.json();
    
    if (result.success) {
        document.getElementById('totalPeminjaman').textContent = result.data.totalPeminjaman;
        document.getElementById('peminjamanAktif').textContent = result.data.peminjamanAktif;
        document.getElementById('peminjamanSelesai').textContent = result.data.peminjamanSelesai;
        document.getElementById('hariIni').textContent = result.data.hariIni;
    }
}
```

### 2. Proyektor List Section
```javascript
async function loadProyektor() {
    const response = await fetch('/api/public/proyektor');
    const result = await response.json();
    const proyektor = result.data || [];
    
    // Display proyektor cards with status badges
    proyektorList.innerHTML = proyektor.map(p => `
        <div class="proyektor-card">
            <h4>${p.kode}</h4>
            <span class="status ${p.status}">${p.status}</span>
            <p>${p.jenis}</p>
            <p>${p.merk}</p>
            <p>Dipinjam: ${p.totalPeminjaman}x</p>
        </div>
    `).join('');
}
```

---

## 🔐 Security Notes

### Public Endpoints:
- ✅ Data statistik bersifat aggregate dan aman untuk publik
- ✅ Proyektor list hanya menampilkan informasi basic (kode, merk, status)
- ✅ Tidak mengekspos data sensitif user atau detail transaksi
- ✅ Tidak ada data personal atau nomor telepon

### Protected Endpoints:
- 🔒 Memerlukan session authentication
- 🔒 Middleware `isAuthenticated` memverifikasi user login
- 🔒 Beberapa endpoint memerlukan `isAdmin` untuk akses penuh

---

## 🚀 Auto-Refresh

Homepage secara otomatis refresh data setiap 30 detik:

```javascript
// Auto refresh stats every 30 seconds
setInterval(() => {
    loadStats();
    loadProyektor();
}, 30000);
```

---

## ✅ Benefits

1. **User Experience**: Pengunjung dapat melihat ketersediaan proyektor tanpa login
2. **Transparency**: Statistik publik menunjukkan aktivitas sistem
3. **Performance**: Endpoint khusus untuk public view dengan data minimal
4. **Security**: Data sensitif tetap dilindungi dengan authentication

---

## 📝 Testing

Test endpoint menggunakan browser atau curl:

```bash
# Test statistics endpoint
curl http://localhost:3000/api/public/stats

# Test proyektor list endpoint
curl http://localhost:3000/api/public/proyektor
```

Expected responses akan dalam format JSON dengan field `success` dan `data`.
