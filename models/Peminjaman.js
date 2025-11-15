const { getDB } = require('../config/database');
const { ObjectId } = require('mongodb');

const COLLECTION_NAME = 'peminjaman';

class Peminjaman {
    // Get semua peminjaman
    static async getAll() {
        const db = getDB();
        return await db.collection(COLLECTION_NAME).find({}).toArray();
    }

    // Get peminjaman by ID
    static async getById(id) {
        const db = getDB();
        return await db.collection(COLLECTION_NAME).findOne({ id: id });
    }

    // Get peminjaman aktif (status dipinjam)
    static async getActive() {
        const db = getDB();
        return await db.collection(COLLECTION_NAME).find({ status: 'dipinjam' }).toArray();
    }

    // Create peminjaman baru
    static async create(data) {
        const db = getDB();
        const newPeminjaman = {
            id: Date.now().toString(),
            nama: data.nama,
            nim: data.nim || '-',
            kelas: data.kelas || '-',
            jurusan: data.jurusan || '-',
            mataKuliah: data.mataKuliah || '-',
            namaDosen: data.namaDosen,
            jamKuliah: data.jamKuliah,
            merkProyektor: data.merkProyektor,
            noTelepon: data.noTelepon || '-',
            jamMulai: data.jamMulai || '-',
            jamSelesai: null,
            tanggalPeminjaman: new Date().toISOString(),
            status: 'dipinjam',
            fotoPeminjaman: data.fotoBukti,
            fotoPengembalian: null,
            tanggalPengembalian: null
        };
        
        const result = await db.collection(COLLECTION_NAME).insertOne(newPeminjaman);
        return newPeminjaman;
    }

    // Update peminjaman (untuk pengembalian)
    static async updatePengembalian(id, data) {
        const db = getDB();
        const updateData = {
            jamSelesai: data.jamSelesai,
            status: 'dikembalikan',
            tanggalPengembalian: new Date().toISOString(),
            fotoPengembalian: data.fotoBukti
        };
        
        const result = await db.collection(COLLECTION_NAME).updateOne(
            { id: id },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return null;
        }
        
        return await this.getById(id);
    }

    // Delete peminjaman
    static async delete(id) {
        const db = getDB();
        const result = await db.collection(COLLECTION_NAME).deleteOne({ id: id });
        return result.deletedCount > 0;
    }

    // Search & filter peminjaman
    static async search(filters) {
        const db = getDB();
        const query = {};
        
        // Text search
        if (filters.query) {
            const searchLower = filters.query.toLowerCase();
            query.$or = [
                { nama: { $regex: searchLower, $options: 'i' } },
                { nim: { $regex: searchLower, $options: 'i' } },
                { kelas: { $regex: searchLower, $options: 'i' } },
                { namaDosen: { $regex: searchLower, $options: 'i' } },
                { merkProyektor: { $regex: searchLower, $options: 'i' } }
            ];
        }
        
        // Filter by status
        if (filters.status && filters.status !== 'semua') {
            query.status = filters.status;
        }
        
        // Filter by date range
        if (filters.startDate || filters.endDate) {
            query.tanggalPeminjaman = {};
            if (filters.startDate) {
                query.tanggalPeminjaman.$gte = new Date(filters.startDate).toISOString();
            }
            if (filters.endDate) {
                query.tanggalPeminjaman.$lte = new Date(filters.endDate).toISOString();
            }
        }
        
        // Filter by proyektor
        if (filters.proyektor && filters.proyektor !== 'semua') {
            query.merkProyektor = filters.proyektor;
        }
        
        return await db.collection(COLLECTION_NAME).find(query).sort({ tanggalPeminjaman: -1 }).toArray();
    }
}

module.exports = Peminjaman;
