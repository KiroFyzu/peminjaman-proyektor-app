const fs = require('fs');
const path = require('path');

const BOOKING_FILE = path.join(__dirname, '../data/booking.json');

function readData() {
    try {
        if (!fs.existsSync(BOOKING_FILE)) {
            fs.writeFileSync(BOOKING_FILE, JSON.stringify([]));
        }
        const data = fs.readFileSync(BOOKING_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading booking.json:', error);
        return [];
    }
}

function writeData(data) {
    try {
        fs.writeFileSync(BOOKING_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing booking.json:', error);
    }
}

class BookingJSON {
    static async getAll() {
        return readData();
    }

    static async getById(id) {
        const data = readData();
        return data.find(item => item.id === id);
    }

    static async create(bookingData) {
        const data = readData();
        const newBooking = {
            id: Date.now().toString(),
            ...bookingData,
            tanggalBooking: new Date().toISOString(),
            status: 'pending'
        };
        data.push(newBooking);
        writeData(data);
        return newBooking;
    }

    static async updateStatus(id, status) {
        const data = readData();
        const index = data.findIndex(item => item.id === id);
        
        if (index === -1) return false;
        
        data[index].status = status;
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
}

module.exports = BookingJSON;
