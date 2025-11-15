require('dotenv').config();
const { connectDB, closeDB } = require('./config/database');
const Proyektor = require('./models/Proyektor');
const fs = require('fs');

async function migrateProyektor() {
    try {
        console.log('🚀 Memulai migrasi data proyektor...\n');
        
        await connectDB();
        
        // Read proyektor.json
        const proyektorData = JSON.parse(fs.readFileSync('./data/proyektor.json', 'utf8'));
        
        console.log(`📦 Ditemukan ${proyektorData.length} data proyektor dari JSON\n`);
        
        // Clear existing data
        const collection = Proyektor.getCollection();
        await collection.deleteMany({});
        console.log('🗑️  Data proyektor lama dihapus\n');
        
        // Insert all proyektor
        let successCount = 0;
        for (const item of proyektorData) {
            try {
                await Proyektor.create(item);
                console.log(`✅ Berhasil migrasi: ${item.kode} - ${item.merk} ${item.model}`);
                successCount++;
            } catch (error) {
                console.error(`❌ Gagal migrasi ${item.kode}:`, error.message);
            }
        }
        
        console.log(`\n✅ Berhasil migrasi ${successCount} data proyektor`);
        
        // Create indexes
        await collection.createIndex({ id: 1 }, { unique: true });
        await collection.createIndex({ kode: 1 }, { unique: true });
        await collection.createIndex({ status: 1 });
        await collection.createIndex({ merk: 1 });
        console.log('✅ Index berhasil dibuat');
        
        // Show stats
        const stats = await Proyektor.getStats();
        console.log('\n📊 Statistik Proyektor:');
        console.log(`   Total: ${stats.total}`);
        console.log(`   Tersedia: ${stats.tersedia}`);
        console.log(`   Dipinjam: ${stats.dipinjam}`);
        console.log(`   Maintenance: ${stats.maintenance}`);
        
        console.log('\n🎉 Migrasi data proyektor selesai!');
        
    } catch (error) {
        console.error('❌ Error saat migrasi:', error);
    } finally {
        await closeDB();
    }
}

migrateProyektor();
