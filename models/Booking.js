const { getDB } = require('../config/database');
const { ObjectId } = require('mongodb');

const COLLECTION_NAME = 'booking';

class Booking {
    // Get semua booking
    static async getAll() {
        const db = getDB();
        return await db.collection(COLLECTION_NAME).find({}).sort({ createdAt: -1 }).toArray();
    }

    // Get booking by ID
    static async getById(id) {
        const db = getDB();
        return await db.collection(COLLECTION_NAME).findOne({ id: id });
    }

    // Create booking baru
    static async create(data) {
        const db = getDB();
        const newBooking = {
            id: Date.now().toString(),
            nama: data.nama,
            nim: data.nim || '-',
            kelas: data.kelas || '-',
            merkProyektor: data.merkProyektor,
            tanggalBooking: data.tanggalBooking,
            jamMulai: data.jamMulai,
            jamSelesai: data.jamSelesai,
            keperluan: data.keperluan || '-',
            noTelepon: data.noTelepon || '-',
            status: 'pending', // pending, approved, rejected, completed
            createdAt: new Date().toISOString()
        };
        
        await db.collection(COLLECTION_NAME).insertOne(newBooking);
        return newBooking;
    }

    // Update status booking
    static async updateStatus(id, status) {
        const db = getDB();
        const updateData = {
            status: status,
            updatedAt: new Date().toISOString()
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

    // Delete booking
    static async delete(id) {
        const db = getDB();
        const result = await db.collection(COLLECTION_NAME).deleteOne({ id: id });
        return result.deletedCount > 0;
    }
}

module.exports = Booking;
