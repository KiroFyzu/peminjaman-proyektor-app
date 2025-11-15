const { getDB } = require('../config/database');

class Proyektor {
    static getCollection() {
        const db = getDB();
        return db.collection('proyektor');
    }

    // Get all proyektor
    static async getAll() {
        const collection = this.getCollection();
        return await collection.find({}).toArray();
    }

    // Get proyektor by ID
    static async getById(id) {
        const collection = this.getCollection();
        return await collection.findOne({ id });
    }

    // Get proyektor by kode
    static async getByKode(kode) {
        const collection = this.getCollection();
        return await collection.findOne({ kode });
    }

    // Get proyektor by status
    static async getByStatus(status) {
        const collection = this.getCollection();
        return await collection.find({ status }).toArray();
    }

    // Create new proyektor
    static async create(data) {
        const collection = this.getCollection();
        const proyektor = {
            id: data.id || `PROJ${Date.now()}`,
            kode: data.kode,
            jenis: data.jenis,
            merk: data.merk,
            model: data.model,
            resolusi: data.resolusi || '-',
            brightness: data.brightness || '-',
            status: data.status || 'tersedia',
            lokasi: data.lokasi || '-',
            tahunPembelian: data.tahunPembelian || new Date().getFullYear(),
            kondisi: data.kondisi || 'baik',
            terakhirDiservice: data.terakhirDiservice || null,
            catatan: data.catatan || '',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        await collection.insertOne(proyektor);
        return proyektor;
    }

    // Update proyektor
    static async update(id, data) {
        const collection = this.getCollection();
        const updateData = {
            ...data,
            updatedAt: new Date()
        };
        
        const result = await collection.updateOne(
            { id },
            { $set: updateData }
        );
        
        return result.modifiedCount > 0;
    }

    // Update status proyektor
    static async updateStatus(id, status) {
        const collection = this.getCollection();
        const result = await collection.updateOne(
            { id },
            { 
                $set: { 
                    status,
                    updatedAt: new Date()
                }
            }
        );
        
        return result.modifiedCount > 0;
    }

    // Delete proyektor
    static async delete(id) {
        const collection = this.getCollection();
        const result = await collection.deleteOne({ id });
        return result.deletedCount > 0;
    }

    // Get available proyektor
    static async getAvailable() {
        const collection = this.getCollection();
        return await collection.find({ status: 'tersedia' }).toArray();
    }

    // Get proyektor statistics
    static async getStats() {
        const collection = this.getCollection();
        const total = await collection.countDocuments();
        const tersedia = await collection.countDocuments({ status: 'tersedia' });
        const dipinjam = await collection.countDocuments({ status: 'dipinjam' });
        const maintenance = await collection.countDocuments({ status: 'maintenance' });
        
        return {
            total,
            tersedia,
            dipinjam,
            maintenance
        };
    }

    // Get proyektor by merk
    static async getByMerk(merk) {
        const collection = this.getCollection();
        return await collection.find({ merk }).toArray();
    }

    // Search proyektor
    static async search(query) {
        const collection = this.getCollection();
        return await collection.find({
            $or: [
                { kode: { $regex: query, $options: 'i' } },
                { merk: { $regex: query, $options: 'i' } },
                { model: { $regex: query, $options: 'i' } },
                { lokasi: { $regex: query, $options: 'i' } }
            ]
        }).toArray();
    }
}

module.exports = Proyektor;
