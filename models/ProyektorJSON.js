const fs = require('fs');
const path = require('path');

const PROYEKTOR_FILE = path.join(__dirname, '../data/proyektor.json');

function readData() {
    try {
        if (!fs.existsSync(PROYEKTOR_FILE)) {
            fs.writeFileSync(PROYEKTOR_FILE, JSON.stringify([]));
        }
        const data = fs.readFileSync(PROYEKTOR_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading proyektor.json:', error);
        return [];
    }
}

function writeData(data) {
    try {
        fs.writeFileSync(PROYEKTOR_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing proyektor.json:', error);
    }
}

class ProyektorJSON {
    static async getAll() {
        return readData();
    }

    static async getById(id) {
        const data = readData();
        return data.find(item => item.id === id);
    }

    static async getByKode(kode) {
        const data = readData();
        return data.find(item => item.kode === kode);
    }

    static async getByStatus(status) {
        const data = readData();
        return data.filter(item => item.status === status);
    }

    static async create(proyektorData) {
        const data = readData();
        const newProyektor = {
            id: proyektorData.id || `PROJ${Date.now()}`,
            ...proyektorData,
            status: proyektorData.status || 'tersedia',
            createdAt: new Date().toISOString()
        };
        data.push(newProyektor);
        writeData(data);
        return newProyektor;
    }

    static async update(id, updateData) {
        const data = readData();
        const index = data.findIndex(item => item.id === id);
        
        if (index === -1) return false;
        
        data[index] = {
            ...data[index],
            ...updateData,
            updatedAt: new Date().toISOString()
        };
        
        writeData(data);
        return true;
    }

    static async updateStatus(id, status) {
        const data = readData();
        const index = data.findIndex(item => item.id === id);
        
        if (index === -1) return false;
        
        data[index].status = status;
        data[index].updatedAt = new Date().toISOString();
        writeData(data);
        return true;
    }

    static async delete(id) {
        const data = readData();
        const filtered = data.filter(item => item.id !== id);
        
        if (filtered.length === data.length) return false;
        
        writeData(filtered);
        return true;
    }

    static async getAvailable() {
        const data = readData();
        return data.filter(item => item.status === 'tersedia');
    }

    static async getStats() {
        const data = readData();
        return {
            total: data.length,
            tersedia: data.filter(p => p.status === 'tersedia').length,
            dipinjam: data.filter(p => p.status === 'dipinjam').length,
            maintenance: data.filter(p => p.status === 'maintenance').length
        };
    }

    static async getByMerk(merk) {
        const data = readData();
        return data.filter(item => item.merk === merk);
    }

    static async search(query) {
        const data = readData();
        const searchLower = query.toLowerCase();
        return data.filter(item =>
            item.kode?.toLowerCase().includes(searchLower) ||
            item.merk?.toLowerCase().includes(searchLower) ||
            item.model?.toLowerCase().includes(searchLower) ||
            item.lokasi?.toLowerCase().includes(searchLower)
        );
    }
}

module.exports = ProyektorJSON;
