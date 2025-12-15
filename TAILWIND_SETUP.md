# Tailwind CSS Installation Guide

## ✅ Instalasi Berhasil!

Tailwind CSS telah berhasil diinstal dan dikonfigurasi untuk proyek Anda.

## 📁 File yang Dibuat

1. **tailwind.config.js** - Konfigurasi Tailwind CSS
2. **postcss.config.js** - Konfigurasi PostCSS
3. **src/input.css** - File CSS input dengan directives Tailwind
4. **public/css/tailwind.css** - File CSS hasil build (sudah di-generate)
5. **views/login-tailwind.ejs** - Contoh halaman login menggunakan Tailwind

## 🚀 Cara Menggunakan

### 1. Build CSS (Production)
```bash
npm run build:css
```
Command ini akan compile Tailwind CSS dengan mode minify untuk production.

### 2. Watch Mode (Development)
```bash
npm run watch:css
```
Command ini akan otomatis rebuild CSS setiap kali ada perubahan pada file.

### 3. Development Mode dengan Auto-build
```bash
npm run dev
```
Command ini akan build CSS terlebih dahulu, lalu menjalankan server.

## 📝 Struktur Proyek

```
peminjamanProyektor/
├── src/
│   └── input.css              # Source CSS dengan @tailwind directives
├── public/
│   └── css/
│       └── tailwind.css       # CSS hasil build (jangan edit langsung)
├── views/
│   ├── login.ejs              # Login original
│   └── login-tailwind.ejs     # Login dengan Tailwind (contoh)
├── tailwind.config.js         # Konfigurasi Tailwind
└── postcss.config.js          # Konfigurasi PostCSS
```

## 🎨 Cara Menggunakan di File EJS

### 1. Include Tailwind CSS di HEAD
```html
<link href="/css/tailwind.css" rel="stylesheet">
```

### 2. Gunakan Utility Classes
```html
<!-- Contoh Button -->
<button class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
    Klik Saya
</button>

<!-- Contoh Card -->
<div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-xl font-bold mb-4">Judul Card</h2>
    <p class="text-gray-600">Konten card...</p>
</div>

<!-- Contoh Form Input -->
<input 
    type="text" 
    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    placeholder="Masukkan text"
>
```

## 🎨 Custom Components yang Tersedia

Di file `src/input.css`, sudah disediakan custom components:

```html
<!-- Buttons -->
<button class="btn-primary">Primary Button</button>
<button class="btn-secondary">Secondary Button</button>
<button class="btn-success">Success Button</button>
<button class="btn-danger">Danger Button</button>

<!-- Card -->
<div class="card">
    <h2>Card Title</h2>
    <p>Card content...</p>
</div>

<!-- Form Input -->
<label class="form-label">Username</label>
<input type="text" class="input-field">
```

## 🔧 Konfigurasi Tailwind

File `tailwind.config.js` sudah dikonfigurasi untuk:
- Scan semua file EJS di folder `views/`
- Scan semua file HTML dan JS di folder `public/`
- Custom colors yang match dengan tema Bootstrap sebelumnya

```javascript
content: [
    "./views/**/*.ejs",
    "./public/**/*.html",
    "./public/**/*.js"
]
```

## 💡 Tips Penggunaan

### 1. Responsive Design
```html
<!-- Mobile first approach -->
<div class="w-full md:w-1/2 lg:w-1/3">
    Content
</div>
```

### 2. Hover Effects
```html
<button class="bg-blue-600 hover:bg-blue-700 transition duration-300">
    Hover Me
</button>
```

### 3. Flexbox & Grid
```html
<!-- Flexbox -->
<div class="flex items-center justify-between">
    <span>Left</span>
    <span>Right</span>
</div>

<!-- Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
</div>
```

## 📚 Resources

- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **Tailwind Play** (Sandbox): https://play.tailwindcss.com/
- **Tailwind UI Components**: https://tailwindui.com/components

## 🔄 Workflow Development

1. **Edit file EJS** dengan Tailwind classes
2. **Jalankan watch mode**: `npm run watch:css` (di terminal terpisah)
3. **Jalankan server**: `npm start` atau `npm run dev`
4. **Refresh browser** untuk melihat perubahan

## ⚠️ Important Notes

1. **Jangan edit `public/css/tailwind.css` secara langsung** - File ini di-generate otomatis
2. **Edit `src/input.css`** untuk menambahkan custom CSS
3. **Jalankan `npm run build:css`** sebelum production deployment
4. **File `tailwind.css` di-generate** tidak perlu di-commit ke Git (optional)

## 🎯 Next Steps

1. Lihat contoh implementasi di `views/login-tailwind.ejs`
2. Mulai convert halaman lain (dashboard, peminjaman, dll)
3. Customize colors dan theme di `tailwind.config.js`
4. Tambahkan custom components di `src/input.css`

---

**Catatan**: Versi Tailwind CSS yang diinstall adalah v3.x (stabil dan production-ready)
