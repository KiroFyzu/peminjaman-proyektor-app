const fs = require('fs');
const path = require('path');

// Load environment variables FIRST
require('dotenv').config();

const { connectDB, closeDB } = require('./config/database');

async function migrateData() {
    let db;
    try {
        console.log('🚀 Memulai migrasi data...');
        console.log('');
        
        // Connect to MongoDB
        console.log('⏳ Connecting to MongoDB...');
        db = await connectDB();
        console.log('✅ Connected to MongoDB');
        console.log('');
        
        // Baca data dari JSON files
        console.log('📖 Reading JSON files...');
        const peminjamanData = JSON.parse(fs.readFileSync('./data/peminjaman.json', 'utf8'));
        const bookingData = JSON.parse(fs.readFileSync('./data/booking.json', 'utf8'));
        console.log(`   - peminjaman.json: ${peminjamanData.length} records`);
        console.log(`   - booking.json: ${bookingData.length} records`);
        console.log('');
        
        // Migrasi Peminjaman
        if (peminjamanData && peminjamanData.length > 0) {
            console.log('🔄 Migrating peminjaman data...');
            await db.collection('peminjaman').deleteMany({}); // Hapus data lama
            const resultPeminjaman = await db.collection('peminjaman').insertMany(peminjamanData);
            console.log(`✅ Berhasil migrasi ${resultPeminjaman.insertedCount} data peminjaman`);
        } else {
            console.log('⚠️  Tidak ada data peminjaman untuk dimigrasi');
        }
        console.log('');
        
        // Migrasi Booking
        if (bookingData && bookingData.length > 0) {
            console.log('🔄 Migrating booking data...');
            await db.collection('booking').deleteMany({}); // Hapus data lama
            const resultBooking = await db.collection('booking').insertMany(bookingData);
            console.log(`✅ Berhasil migrasi ${resultBooking.insertedCount} data booking`);
        } else {
            console.log('⚠️  Tidak ada data booking untuk dimigrasi');
        }
        console.log('');
        
        // Buat index untuk performa
        console.log('🔧 Creating indexes...');
        await db.collection('peminjaman').createIndex({ id: 1 }, { unique: true });
        await db.collection('peminjaman').createIndex({ status: 1 });
        await db.collection('peminjaman').createIndex({ tanggalPeminjaman: -1 });
        
        await db.collection('booking').createIndex({ id: 1 }, { unique: true });
        await db.collection('booking').createIndex({ status: 1 });
        await db.collection('booking').createIndex({ createdAt: -1 });
        
        console.log('✅ Index berhasil dibuat');
        console.log('');
        console.log('🎉 Migrasi data selesai!');
        console.log('');
        
        await closeDB();
    } catch (error) {
        console.error('');
        console.error('❌ Error saat migrasi:', error.message);
        console.error('');
        if (db) await closeDB();
        process.exit(1);
    }
}

// Jalankan migrasi
migrateData();
