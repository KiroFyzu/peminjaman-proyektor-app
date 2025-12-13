require('dotenv').config();
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const FormData = require('form-data');
const PDFDocument = require('pdfkit');
const xlsx = require('xlsx');
const qrcode = require('qrcode');
const { connectDB } = require('./config/database');
const { isSimulation } = require('./config/database-mode');
const Peminjaman = require('./models/PeminjamanAdapter');
const Booking = require('./models/BookingAdapter');
const Proyektor = require('./models/ProyektorAdapter');
const User = require('./models/UserAdapter');
const { isAuthenticated, isAdmin, injectUserData } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const WHATSAPP_API_BASE_URL = process.env.WHATSAPP_API_BASE_URL || 'https://waapi.radjaprint.site';
const WHATSAPP_ADMIN_NUMBER = process.env.WHATSAPP_ADMIN_NUMBER || '6282345546475';
const CAMPUS_NAME = process.env.CAMPUS_NAME || 'Universitas';
const CAMPUS_SHORT_NAME = process.env.CAMPUS_SHORT_NAME || 'UNI';

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'peminjaman-proyektor-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set true jika menggunakan HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 jam
    }
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Inject user data ke semua views
app.use(injectUserData);

// Storage configuration untuk multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });

// Helper functions untuk database JSON (DEPRECATED - gunakan MongoDB)
// Fungsi ini akan dihapus setelah migrasi selesai
const readData = () => {
    console.warn('⚠️  readData() is deprecated. Use Peminjaman model instead.');
    try {
        const data = fs.readFileSync('./data/peminjaman.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeData = (data) => {
    console.warn('⚠️  writeData() is deprecated. Use Peminjaman model instead.');
    fs.writeFileSync('./data/peminjaman.json', JSON.stringify(data, null, 2));
};

// Helper function untuk format nomor WhatsApp
function formatPhoneNumber(phoneNumber) {
    if (!phoneNumber || phoneNumber === '-') {
        return null;
    }
    
    // Remove all non-numeric characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Convert 08xxx to 628xxx
    if (cleaned.startsWith('08')) {
        cleaned = '62' + cleaned.substring(1);
    }
    // Convert 8xxx to 628xxx
    else if (cleaned.startsWith('8') && !cleaned.startsWith('62')) {
        cleaned = '62' + cleaned;
    }
    // Jika sudah 628xxx, biarkan
    else if (!cleaned.startsWith('62')) {
        // Tambahkan 62 di depan jika belum ada
        cleaned = '62' + cleaned;
    }
    
    return cleaned;
}

// WhatsApp API Function
async function sendWhatsAppMessage(number, message) {
    const formattedNumber = formatPhoneNumber(number);
    
    if (!formattedNumber) {
        throw new Error('Nomor telepon tidak valid');
    }
    
    console.log('📞 Formatted Number:', formattedNumber);
    
    const response = await fetch(`${WHATSAPP_API_BASE_URL}/send-message`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            number: formattedNumber,
            message: message
        })
    });
    
    console.log('🌐 API Response Status:', response.status, response.statusText);
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('📦 API Result:', result);
    
    // API ini menggunakan format yang aneh: success=false tapi message="berhasil"
    // Jadi kita check dari message juga
    const isSuccess = result.status === true || 
                      result.success === true || 
                      (result.message && result.message.toLowerCase().includes('berhasil'));
    
    if (!isSuccess) {
        throw new Error(result.message || 'Gagal mengirim pesan');
    }
    
    return result;
}

// WhatsApp API Function - Send File with Caption
async function sendWhatsAppFile(number, fileBase64, caption) {
    const formattedNumber = formatPhoneNumber(number);
    
    if (!formattedNumber) {
        throw new Error('Nomor telepon tidak valid');
    }
    
    console.log('📞 Formatted Number:', formattedNumber);
    console.log('📎 Sending file with caption');
    console.log('📏 Base64 length:', fileBase64.length);
    
    // Clean base64 dan convert ke buffer
    const base64Data = fileBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    console.log('📦 Buffer size:', buffer.length, 'bytes');
    
    // Detect file extension dari base64 header
    let extension = 'jpg';
    let mimeType = 'image/jpeg';
    if (fileBase64.startsWith('data:image/png')) {
        extension = 'png';
        mimeType = 'image/png';
    } else if (fileBase64.startsWith('data:image/jpeg') || fileBase64.startsWith('data:image/jpg')) {
        extension = 'jpg';
        mimeType = 'image/jpeg';
    }
    
    console.log('🎨 File type:', extension, mimeType);
    
    // Simpan file sementara ke disk
    const tempDir = './public/uploads/temp';
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
        console.log('📁 Created temp directory');
    }
    
    const tempFilename = `temp_${Date.now()}.${extension}`;
    const tempFilePath = path.join(tempDir, tempFilename);
    fs.writeFileSync(tempFilePath, buffer);
    
    // Verify file exists and check size
    const fileStats = fs.statSync(tempFilePath);
    console.log('💾 Temp file saved:', tempFilePath);
    console.log('📊 File size on disk:', fileStats.size, 'bytes');
    
    // Create form data dengan file stream
    const form = new FormData();
    form.append('number', formattedNumber);
    
    // Read file and append as buffer with proper options
    const fileBuffer = fs.readFileSync(tempFilePath);
    form.append('file', fileBuffer, {
        filename: `foto_${Date.now()}.${extension}`,
        contentType: mimeType,
        knownLength: fileBuffer.length
    });
    
    if (caption) {
        form.append('caption', caption);
        console.log('💬 Caption added, length:', caption.length);
    }
    
    console.log('🚀 Sending to:', `${WHATSAPP_API_BASE_URL}/send-file`);
    console.log('📋 Form headers:', form.getHeaders());
    
    try {
        const response = await fetch(`${WHATSAPP_API_BASE_URL}/send-file`, {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });
        
        console.log('🌐 API Response Status:', response.status, response.statusText);
        
        const responseText = await response.text();
        console.log('📄 Raw response:', responseText);
        
        if (!response.ok) {
            console.error('❌ API Error Response:', responseText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error('❌ Failed to parse JSON:', e);
            throw new Error('Invalid JSON response from API');
        }
        
        console.log('📦 API Result:', result);
        
        const isSuccess = result.status === true || 
                          result.success === true || 
                          (result.message && result.message.toLowerCase().includes('berhasil'));
        
        if (!isSuccess) {
            throw new Error(result.message || 'Gagal mengirim file');
        }
        
        return result;
    } finally {
        // Hapus file temporary setelah dikirim
        try {
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
                console.log('🗑️ Temp file deleted:', tempFilePath);
            }
        } catch (err) {
            console.warn('⚠️ Failed to delete temp file:', err.message);
        }
    }
}

// Helper functions untuk Booking (DEPRECATED)
const readBookingData = () => {
    console.warn('⚠️  readBookingData() is deprecated. Use Booking model instead.');
    try {
        const data = fs.readFileSync('./data/booking.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeBookingData = (data) => {
    console.warn('⚠️  writeBookingData() is deprecated. Use Booking model instead.');
    fs.writeFileSync('./data/booking.json', JSON.stringify(data, null, 2));
};

// Routes
app.get('/', (req, res) => {
    const dbMode = isSimulation ? 'simulation' : 'production';
    res.render('index', { dbMode, campusName: CAMPUS_NAME, campusShortName: CAMPUS_SHORT_NAME });
});

// ========== Authentication Routes ==========
// Login page
app.get('/login', (req, res) => {
    // Redirect ke dashboard jika sudah login
    if (req.session && req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.render('login', { error: null, success: null });
});

// Login POST
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Cari user by username
        const user = await User.findByUsername(username);
        
        if (!user) {
            return res.render('login', { error: 'Username atau password salah', success: null });
        }
        
        // Verify password
        const isValid = await User.verifyPassword(password, user.password);
        
        if (!isValid) {
            return res.render('login', { error: 'Username atau password salah', success: null });
        }
        
        // Set session
        req.session.userId = user._id || user.id;
        req.session.username = user.username;
        req.session.nama = user.nama;
        req.session.userRole = user.role;
        
        // Redirect ke dashboard
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', { error: 'Terjadi kesalahan saat login', success: null });
    }
});

// Register page
app.get('/register', (req, res) => {
    // Redirect ke dashboard jika sudah login
    if (req.session && req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.render('register', { error: null });
});

// Register POST
app.post('/register', async (req, res) => {
    try {
        const { username, password, nama, role, email, noTelepon } = req.body;
        
        // Validasi role
        if (!['admin', 'mahasiswa'].includes(role)) {
            return res.render('register', { error: 'Role tidak valid. Pilih admin atau mahasiswa.' });
        }
        
        // Check apakah username sudah ada
        const existingUser = await User.findByUsername(username);
        if (existingUser) {
            return res.render('register', { error: 'Username sudah digunakan. Silakan pilih username lain.' });
        }
        
        // Create user baru
        await User.create({
            username,
            password,
            nama,
            role,
            email: email || null,
            noTelepon: noTelepon || null
        });
        
        // Redirect ke login dengan success message
        res.render('login', { 
            error: null, 
            success: 'Registrasi berhasil! Silakan login dengan akun Anda.' 
        });
    } catch (error) {
        console.error('Register error:', error);
        res.render('register', { error: error.message || 'Terjadi kesalahan saat registrasi' });
    }
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/login');
    });
});

// ========== Protected Routes (Require Login) ==========
app.get('/peminjaman', isAuthenticated, async (req, res) => {
    try {
        // Get available proyektor untuk dropdown
        const proyektor = await Proyektor.getAll();
        const proyektorTersedia = proyektor.filter(p => p.status === 'tersedia');
        const dbMode = isSimulation ? 'simulation' : 'production';
        res.render('peminjaman', { proyektor: proyektorTersedia, dbMode, campusName: CAMPUS_NAME, campusShortName: CAMPUS_SHORT_NAME });
    } catch (error) {
        console.error('Error loading peminjaman:', error);
        res.render('peminjaman', { proyektor: [], dbMode: isSimulation ? 'simulation' : 'production', campusName: CAMPUS_NAME, campusShortName: CAMPUS_SHORT_NAME });
    }
});

app.get('/booking', isAuthenticated, async (req, res) => {
    try {
        const bookings = await Booking.getAll();
        res.render('booking', { bookings, campusName: CAMPUS_NAME, campusShortName: CAMPUS_SHORT_NAME });
    } catch (error) {
        console.error('Error loading booking:', error);
        res.status(500).send('Error loading booking');
    }
});

app.get('/pengembalian', isAuthenticated, async (req, res) => {
    try {
        const peminjamanAktif = await Peminjaman.getActive();
        res.render('pengembalian', { peminjaman: peminjamanAktif, campusName: CAMPUS_NAME, campusShortName: CAMPUS_SHORT_NAME });
    } catch (error) {
        console.error('Error loading pengembalian:', error);
        res.status(500).send('Error loading pengembalian');
    }
});

app.get('/dashboard', isAuthenticated, async (req, res) => {
    try {
        const data = await Peminjaman.getAll();
        const proyektor = await Proyektor.getAll();
        const dbMode = isSimulation ? 'simulation' : 'production';
        res.render('dashboard', { peminjaman: data, proyektor, dbMode, campusName: CAMPUS_NAME, campusShortName: CAMPUS_SHORT_NAME });
    } catch (error) {
        console.error('Error loading dashboard:', error);
        res.status(500).send('Error loading dashboard');
    }
});

// API Endpoints (Protected - memerlukan login)
app.post('/api/peminjaman', isAuthenticated, async (req, res) => {
    try {
        const { nama, kelas, namaDosen, jamKuliah, merkProyektor, noTelepon, fotoBukti, nim, jurusan, mataKuliah, jamMulai } = req.body;
        
        // Update status proyektor menjadi 'dipinjam'
        try {
            const proyektorList = await Proyektor.getAll();
            const proyektor = proyektorList.find(p => `${p.merk} ${p.model}` === merkProyektor);
            if (proyektor) {
                await Proyektor.updateStatus(proyektor.id, 'dipinjam');
            }
        } catch (error) {
            console.warn('Failed to update proyektor status:', error);
        }
        
        const newPeminjaman = await Peminjaman.create({
            nama,
            nim,
            kelas,
            jurusan,
            mataKuliah,
            namaDosen,
            jamKuliah,
            merkProyektor,
            noTelepon,
            jamMulai,
            fotoBukti
        });
        
        res.json({ success: true, message: 'Peminjaman berhasil dicatat!', data: newPeminjaman });
    } catch (error) {
        console.error('Error creating peminjaman:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
    }
});

app.post('/api/pengembalian/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const { jamSelesai, fotoBukti } = req.body;
        
        // Get peminjaman data untuk update status proyektor
        const peminjaman = await Peminjaman.getById(id);
        
        const updatedPeminjaman = await Peminjaman.updatePengembalian(id, {
            jamSelesai,
            fotoBukti
        });
        
        if (!updatedPeminjaman) {
            return res.status(404).json({ success: false, message: 'Data peminjaman tidak ditemukan' });
        }
        
        // Update status proyektor menjadi 'tersedia' setelah dikembalikan
        if (peminjaman && peminjaman.merkProyektor) {
            try {
                const proyektorList = await Proyektor.getAll();
                const proyektor = proyektorList.find(p => `${p.merk} ${p.model}` === peminjaman.merkProyektor);
                if (proyektor) {
                    await Proyektor.updateStatus(proyektor.id, 'tersedia');
                }
            } catch (error) {
                console.warn('Failed to update proyektor status:', error);
            }
        }
        
        res.json({ success: true, message: 'Pengembalian berhasil dicatat!', data: updatedPeminjaman });
    } catch (error) {
        console.error('Error updating pengembalian:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
    }
});

app.get('/api/peminjaman', isAuthenticated, async (req, res) => {
    try {
        const data = await Peminjaman.getAll();
        res.json(data);
    } catch (error) {
        console.error('Error getting peminjaman:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/peminjaman/aktif', isAuthenticated, async (req, res) => {
    try {
        const aktif = await Peminjaman.getActive();
        res.json(aktif);
    } catch (error) {
        console.error('Error getting peminjaman aktif:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.delete('/api/peminjaman/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Peminjaman.delete(id);
        
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
        }
        
        res.json({ success: true, message: 'Data berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting peminjaman:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
    }
});

// API untuk mengirim pesan WhatsApp
app.post('/api/send-whatsapp/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const { customMessage } = req.body;
        
        const peminjaman = await Peminjaman.getById(id);
        
        if (!peminjaman) {
            return res.status(404).json({ success: false, message: 'Data peminjaman tidak ditemukan' });
        }
        
        if (!peminjaman.noTelepon || peminjaman.noTelepon === '-') {
            return res.status(400).json({ success: false, message: 'Nomor telepon tidak tersedia' });
        }
        
        const tanggal = new Date(peminjaman.tanggalPeminjaman).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        let result;
        let hasFoto = false;
        
        // Cek apakah ada foto untuk dikirim
        if (peminjaman.status === 'dipinjam' && peminjaman.fotoPeminjaman) {
            hasFoto = true;
            const caption = customMessage || 
                `*PEMINJAMAN PROYEKTOR* 📹\n\n` +
                `Halo *${peminjaman.nama}*,\n\n` +
                `Peminjaman proyektor Anda telah dicatat dengan detail:\n\n` +
                `📌 *Kelas:* ${peminjaman.kelas}\n` +
                `📌 *Dosen:* ${peminjaman.namaDosen}\n` +
                `📌 *Jam Kuliah:* ${peminjaman.jamKuliah}\n` +
                `📌 *Proyektor:* ${peminjaman.merkProyektor}\n` +
                `📌 *Tanggal:* ${tanggal}\n\n` +
                `⚠️ Harap mengembalikan proyektor sesuai waktu yang dijadwalkan.\n\n` +
                `_Foto bukti peminjaman terlampir_\n\n` +
                `Terima kasih! 🙏`;
            
            console.log('📸 Mengirim foto peminjaman...');
            let captionAdmin = caption + `\n\n[Admin Copy for ${peminjaman.nama}]`;
            result = await sendWhatsAppFile(peminjaman.noTelepon, peminjaman.fotoPeminjaman, caption);
            result = await sendWhatsAppFile(WHATSAPP_ADMIN_NUMBER, peminjaman.fotoPeminjaman, captionAdmin);
        } 
        else if (peminjaman.status === 'dikembalikan' && peminjaman.fotoPengembalian) {
            hasFoto = true;
            const caption = customMessage ||
                `*PENGEMBALIAN PROYEKTOR* ✅\n\n` +
                `Halo *${peminjaman.nama}*,\n\n` +
                `Terima kasih telah mengembalikan proyektor *${peminjaman.merkProyektor}*.\n\n` +
                `📌 *Jam Selesai:* ${peminjaman.jamSelesai}\n` +
                `📌 *Tanggal Kembali:* ${new Date(peminjaman.tanggalPengembalian).toLocaleDateString('id-ID')}\n\n` +
                `Status: *SELESAI* ✅\n\n` +
                `_Foto bukti pengembalian terlampir_\n\n` +
                `Semoga bermanfaat! 🙏`;
            
            console.log('📸 Mengirim foto pengembalian...');
            let captionAdmin = caption + `\n\n[Admin Copy for ${peminjaman.nama}]`;
            result = await sendWhatsAppFile(peminjaman.noTelepon, peminjaman.fotoPengembalian, caption);

            result = await sendWhatsAppFile(WHATSAPP_ADMIN_NUMBER, peminjaman.fotoPengembalian, captionAdmin);
        }
        else {
            // Kirim text message saja jika tidak ada foto
            let message = customMessage;
            if (!message) {
                if (peminjaman.status === 'dipinjam') {
                    message = `*PEMINJAMAN PROYEKTOR* 📹\n\n` +
                        `Halo *${peminjaman.nama}*,\n\n` +
                        `Peminjaman proyektor Anda telah dicatat dengan detail:\n\n` +
                        `📌 *Kelas:* ${peminjaman.kelas}\n` +
                        `📌 *Dosen:* ${peminjaman.namaDosen}\n` +
                        `📌 *Jam Kuliah:* ${peminjaman.jamKuliah}\n` +
                        `📌 *Proyektor:* ${peminjaman.merkProyektor}\n` +
                        `📌 *Tanggal:* ${tanggal}\n\n` +
                        `⚠️ Harap mengembalikan proyektor sesuai waktu yang dijadwalkan.\n\n` +
                        `Terima kasih! 🙏`;
                } else {
                    message = `*PENGEMBALIAN PROYEKTOR* ✅\n\n` +
                        `Halo *${peminjaman.nama}*,\n\n` +
                        `Terima kasih telah mengembalikan proyektor *${peminjaman.merkProyektor}*.\n\n` +
                        `📌 *Jam Selesai:* ${peminjaman.jamSelesai}\n` +
                        `📌 *Tanggal Kembali:* ${new Date(peminjaman.tanggalPengembalian).toLocaleDateString('id-ID')}\n\n` +
                        `Status: *SELESAI* ✅\n\n` +
                        `Semoga bermanfaat! 🙏`;
                }
            }
            
            console.log('📝 Mengirim text message...');
            let messageAdmin = message + `\n\n[Admin Copy for ${peminjaman.nama}]`;
            result = await sendWhatsAppMessage(peminjaman.noTelepon, message);
            result = await sendWhatsAppMessage(WHATSAPP_ADMIN_NUMBER, messageAdmin);
        }
        
        res.json({ 
            success: true, 
            message: hasFoto ? 'Foto dan pesan berhasil dikirim!' : 'Pesan WhatsApp berhasil dikirim!',
            withPhoto: hasFoto,
            whatsappResult: result 
        });
    } catch (error) {
        console.error('Error sending WhatsApp:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Gagal mengirim pesan WhatsApp: ' + error.message 
        });
    }
});

// API untuk mengirim reminder pengembalian
app.post('/api/send-reminder/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const peminjaman = await Peminjaman.getById(id);
        
        if (!peminjaman) {
            return res.status(404).json({ success: false, message: 'Data peminjaman tidak ditemukan' });
        }
        
        if (peminjaman.status === 'dikembalikan') {
            return res.status(400).json({ success: false, message: 'Proyektor sudah dikembalikan' });
        }
        
        if (!peminjaman.noTelepon || peminjaman.noTelepon === '-') {
            return res.status(400).json({ success: false, message: 'Nomor telepon tidak tersedia' });
        }
        
        const message = `*REMINDER PENGEMBALIAN PROYEKTOR* ⏰\n\n` +
            `Halo *${peminjaman.nama}*,\n\n` +
            `Ini adalah pengingat untuk mengembalikan proyektor:\n\n` +
            `📌 *Proyektor:* ${peminjaman.merkProyektor}\n` +
            `📌 *Kelas:* ${peminjaman.kelas}\n` +
            `📌 *Jam Kuliah:* ${peminjaman.jamKuliah}\n` +
            `📌 *Tanggal Pinjam:* ${new Date(peminjaman.tanggalPeminjaman).toLocaleDateString('id-ID')}\n\n` +
            `⚠️ Harap segera mengembalikan proyektor ke admin.\n\n` +
            `Terima kasih! 🙏`;
        
        console.log('📱 Mengirim reminder ke:', peminjaman.noTelepon);
        const result = await sendWhatsAppMessage(peminjaman.noTelepon, message);
        console.log('✅ WhatsApp API Response:', result);
        
        res.json({ 
            success: true, 
            message: 'Reminder berhasil dikirim!',
            whatsappResult: result 
        });
    } catch (error) {
        console.error('❌ Error sending reminder:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Gagal mengirim reminder: ' + error.message 
        });
    }
});

// ============= PHASE 1 FEATURES =============

// API Export PDF
app.get('/api/export/pdf', async (req, res) => {
    try {
        const data = await Peminjaman.getAll();
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=laporan-peminjaman-${Date.now()}.pdf`);
        
        doc.pipe(res);
        
        // Header
        doc.fontSize(20).text('LAPORAN PEMINJAMAN PROYEKTOR', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, { align: 'center' });
        doc.moveDown(2);
        
        // Statistics
        doc.fontSize(14).text('Statistik:', { underline: true });
        doc.fontSize(10);
        doc.text(`Total Peminjaman: ${data.length}`);
        doc.text(`Sedang Dipinjam: ${data.filter(p => p.status === 'dipinjam').length}`);
        doc.text(`Sudah Dikembalikan: ${data.filter(p => p.status === 'dikembalikan').length}`);
        doc.moveDown(2);
        
        // Data Table
        doc.fontSize(14).text('Data Peminjaman:', { underline: true });
        doc.moveDown();
        
        data.reverse().forEach((item, index) => {
            if (index > 0) doc.moveDown();
            
            doc.fontSize(10);
            doc.text(`${index + 1}. ${item.nama}`, { continued: true });
            doc.text(` (${item.kelas || '-'})`, { continued: false });
            doc.fontSize(9);
            doc.text(`   Proyektor: ${item.merkProyektor}`);
            doc.text(`   Dosen: ${item.namaDosen || '-'}`);
            doc.text(`   Jam: ${item.jamKuliah || '-'}`);
            doc.text(`   Status: ${item.status === 'dipinjam' ? 'Sedang Dipinjam' : 'Dikembalikan'}`);
            doc.text(`   Tanggal: ${new Date(item.tanggalPeminjaman).toLocaleString('id-ID')}`);
            
            if (index < data.length - 1) {
                doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
            }
        });
        
        doc.end();
    } catch (error) {
        console.error('Error exporting PDF:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// API Export Excel
app.get('/api/export/excel', async (req, res) => {
    try {
        const data = await Peminjaman.getAll();
        
        const worksheet = data.reverse().map(item => ({
            'No': data.indexOf(item) + 1,
            'Nama': item.nama,
            'NIM': item.nim || '-',
            'Kelas': item.kelas || '-',
            'Jurusan': item.jurusan || '-',
            'Mata Kuliah': item.mataKuliah || '-',
            'Dosen': item.namaDosen || '-',
            'Jam Kuliah': item.jamKuliah || '-',
            'Proyektor': item.merkProyektor,
            'No Telepon': item.noTelepon,
            'Jam Mulai': item.jamMulai || '-',
            'Jam Selesai': item.jamSelesai || '-',
            'Tanggal Pinjam': new Date(item.tanggalPeminjaman).toLocaleString('id-ID'),
            'Tanggal Kembali': item.tanggalPengembalian ? new Date(item.tanggalPengembalian).toLocaleString('id-ID') : '-',
            'Status': item.status === 'dipinjam' ? 'Sedang Dipinjam' : 'Dikembalikan'
        }));
        
        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(worksheet);
        
        // Set column widths
        ws['!cols'] = [
            { wch: 5 }, { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 20 },
            { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
            { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 15 }
        ];
        
        xlsx.utils.book_append_sheet(wb, ws, 'Laporan Peminjaman');
        
        const filename = `laporan-peminjaman-${Date.now()}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        
        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
        res.send(buffer);
    } catch (error) {
        console.error('Error exporting Excel:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// API Generate QR Code
app.get('/api/qr/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const peminjaman = await Peminjaman.getById(id);
        
        if (!peminjaman) {
            return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
        }
        
        const qrData = JSON.stringify({
            id: peminjaman.id,
            nama: peminjaman.nama,
            proyektor: peminjaman.merkProyektor,
            tanggal: new Date(peminjaman.tanggalPeminjaman).toLocaleString('id-ID'),
            status: peminjaman.status
        });
        
        const qrCode = await qrcode.toDataURL(qrData);
        res.json({ success: true, qrCode });
    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// API Advanced Search & Filter
app.post('/api/search', async (req, res) => {
    try {
        const { query, status, startDate, endDate, proyektor } = req.body;
        
        const data = await Peminjaman.search({
            query,
            status,
            startDate,
            endDate,
            proyektor
        });
        
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error searching:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============= BOOKING SYSTEM =============

// Get all bookings (admin semua, mahasiswa hanya miliknya)
app.get('/api/booking', isAuthenticated, async (req, res) => {
    try {
        const bookings = await Booking.getAll();
        
        // Jika role mahasiswa, filter hanya booking miliknya berdasarkan nama
        if (req.session.userRole === 'mahasiswa') {
            const userBookings = bookings.filter(b => 
                b.nama.toLowerCase() === req.session.nama.toLowerCase()
            );
            return res.json(userBookings);
        }
        
        // Admin dapat melihat semua booking
        res.json(bookings);
    } catch (error) {
        console.error('Error getting bookings:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create new booking
app.post('/api/booking', isAuthenticated, async (req, res) => {
    try {
        const { nama, nim, kelas, merkProyektor, tanggalBooking, jamMulai, jamSelesai, keperluan, noTelepon } = req.body;
        
        const newBooking = await Booking.create({
            nama,
            nim,
            kelas,
            merkProyektor,
            tanggalBooking,
            jamMulai,
            jamSelesai,
            keperluan,
            noTelepon
        });
        
        res.json({ success: true, message: 'Booking berhasil dibuat!', data: newBooking });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update booking status (hanya admin)
app.put('/api/booking/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const updatedBooking = await Booking.updateStatus(id, status);
        
        if (!updatedBooking) {
            return res.status(404).json({ success: false, message: 'Booking tidak ditemukan' });
        }
        
        res.json({ success: true, message: 'Status booking berhasil diupdate!', data: updatedBooking });
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete booking (hanya admin)
app.delete('/api/booking/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Booking.delete(id);
        
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Booking tidak ditemukan' });
        }
        
        res.json({ success: true, message: 'Booking berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== PROYEKTOR API ENDPOINTS ==========

// Get all proyektor
app.get('/api/proyektor', isAuthenticated, async (req, res) => {
    try {
        const proyektor = await Proyektor.getAll();
        res.json({ success: true, data: proyektor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get proyektor by ID
app.get('/api/proyektor/:id', isAuthenticated, async (req, res) => {
    try {
        const proyektor = await Proyektor.getById(req.params.id);
        if (!proyektor) {
            return res.status(404).json({ success: false, message: 'Proyektor tidak ditemukan' });
        }
        res.json({ success: true, data: proyektor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get proyektor stats
app.get('/api/proyektor/stats/summary', async (req, res) => {
    try {
        const stats = await Proyektor.getStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create new proyektor
app.post('/api/proyektor', async (req, res) => {
    try {
        const proyektor = await Proyektor.create(req.body);
        res.json({ success: true, message: 'Proyektor berhasil ditambahkan', data: proyektor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update proyektor
app.put('/api/proyektor/:id', async (req, res) => {
    try {
        const success = await Proyektor.update(req.params.id, req.body);
        if (!success) {
            return res.status(404).json({ success: false, message: 'Proyektor tidak ditemukan' });
        }
        res.json({ success: true, message: 'Proyektor berhasil diupdate' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update proyektor status
app.patch('/api/proyektor/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const success = await Proyektor.updateStatus(req.params.id, status);
        if (!success) {
            return res.status(404).json({ success: false, message: 'Proyektor tidak ditemukan' });
        }
        res.json({ success: true, message: 'Status proyektor berhasil diupdate' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete proyektor
app.delete('/api/proyektor/:id', async (req, res) => {
    try {
        const success = await Proyektor.delete(req.params.id);
        if (!success) {
            return res.status(404).json({ success: false, message: 'Proyektor tidak ditemukan' });
        }
        res.json({ success: true, message: 'Proyektor berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Search proyektor
app.post('/api/proyektor/search', async (req, res) => {
    try {
        const { query } = req.body;
        const proyektor = await Proyektor.search(query);
        res.json({ success: true, data: proyektor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Start server
async function startServer() {
    try {
        // Connect to MongoDB (skip in simulation mode)
        await connectDB();
        
        // Start Express server
        app.listen(PORT, () => {
            console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
            console.log(`📱 Sistem Peminjaman Proyektor`);
            console.log(`📊 Database Mode: ${isSimulation ? '🧪 SIMULATION (Local JSON)' : '☁️  PRODUCTION (MongoDB Atlas)'}`);
            if (isSimulation) {
                console.log(`📁 Using local JSON files in data/ folder`);
            }
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
