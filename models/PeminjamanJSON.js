const fs = require('fs');
const path = require('path');

const PEMINJAMAN_FILE = path.join(__dirname, '../data/peminjaman.json');

// Helper functions untuk read/write JSON
function readData() {
    try {
        if (!fs.existsSync(PEMINJAMAN_FILE)) {
            fs.writeFileSync(PEMINJAMAN_FILE, JSON.stringify([]));
        }
        const data = fs.readFileSync(PEMINJAMAN_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading peminjaman.json:', error);
        return [];
    }
}

function writeData(data) {
    try {
        fs.writeFileSync(PEMINJAMAN_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing peminjaman.json:', error);
    }
}

class PeminjamanJSON {
    // Get all peminjaman
    static async getAll() {
        return readData();
    }

    // Get peminjaman by ID
    static async getById(id) {
        const data = readData();
        return data.find(item => item.id === id);
    }

    // Get active peminjaman (dipinjam)
    static async getActive() {
        const data = readData();
        return data.filter(item => item.status === 'dipinjam');
    }

    // Create new peminjaman
    static async create(peminjamanData) {
        const data = readData();
        const newPeminjaman = {
            id: Date.now().toString(),
            nama: peminjamanData.nama,
            nim: peminjamanData.nim || '-',
            kelas: peminjamanData.kelas || '-',
            jurusan: peminjamanData.jurusan || '-',
            mataKuliah: peminjamanData.mataKuliah || '-',
            namaDosen: peminjamanData.namaDosen,
            jamKuliah: peminjamanData.jamKuliah,
            merkProyektor: peminjamanData.merkProyektor,
            noTelepon: peminjamanData.noTelepon || '-',
            jamMulai: peminjamanData.jamMulai || '-',
            jamSelesai: null,
            tanggalPeminjaman: new Date().toISOString(),
            status: 'dipinjam',
            fotoPeminjaman: peminjamanData.fotoBukti, // Simpan sebagai fotoPeminjaman
            fotoPengembalian: null,
            tanggalPengembalian: null
        };
        data.push(newPeminjaman);
        writeData(data);
        return newPeminjaman;
    }

    // Update pengembalian
    static async updatePengembalian(id, pengembalianData) {
        const data = readData();
        const index = data.findIndex(item => item.id === id);
        
        if (index === -1) return null;
        
        data[index] = {
            ...data[index],
            jamSelesai: pengembalianData.jamSelesai,
            tanggalPengembalian: new Date().toISOString(),
            status: 'dikembalikan',
            fotoPengembalian: pengembalianData.fotoBukti // Simpan sebagai fotoPengembalian
        };
        
        writeData(data);
        return data[index];
    }

    // Delete peminjaman
    static async delete(id) {
        const data = readData();
        const filtered = data.filter(item => item.id !== id);
        
        if (filtered.length === data.length) return false;
        
        writeData(filtered);
        return true;
    }

    // Search peminjaman
    static async search({ query, status, startDate, endDate, proyektor }) {
        let data = readData();
        
        if (query) {
            const searchLower = query.toLowerCase();
            data = data.filter(item =>
                item.nama?.toLowerCase().includes(searchLower) ||
                item.nim?.toLowerCase().includes(searchLower) ||
                item.kelas?.toLowerCase().includes(searchLower) ||
                item.namaDosen?.toLowerCase().includes(searchLower) ||
                item.merkProyektor?.toLowerCase().includes(searchLower)
            );
        }
        
        if (status && status !== 'semua') {
            data = data.filter(item => item.status === status);
        }
        
        if (proyektor && proyektor !== 'semua') {
            data = data.filter(item => item.merkProyektor === proyektor);
        }
        
        if (startDate) {
            data = data.filter(item => new Date(item.tanggalPeminjaman) >= new Date(startDate));
        }
        
        if (endDate) {
            data = data.filter(item => new Date(item.tanggalPeminjaman) <= new Date(endDate));
        }
        
        return data;
    }
}

module.exports = PeminjamanJSON;
