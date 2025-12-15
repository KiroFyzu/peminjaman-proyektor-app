const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

class UserJSON {
    constructor() {
        this.dataPath = path.join(__dirname, '../data/users.json');
        this.ensureDataFile();
    }

    ensureDataFile() {
        const dir = path.dirname(this.dataPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (!fs.existsSync(this.dataPath)) {
            fs.writeFileSync(this.dataPath, JSON.stringify([], null, 2));
        }
    }

    readData() {
        try {
            const data = fs.readFileSync(this.dataPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading users.json:', error);
            return [];
        }
    }

    writeData(data) {
        try {
            fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error writing users.json:', error);
            throw error;
        }
    }

    // Create user baru
    async create(userData) {
        const users = this.readData();
        
        // Check username sudah ada
        if (users.find(u => u.username === userData.username)) {
            throw new Error('Username sudah digunakan');
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        const user = {
            id: Date.now().toString(),
            username: userData.username,
            password: hashedPassword,
            nama: userData.nama,
            nim: userData.nim || null,
            role: userData.role, // 'admin' atau 'mahasiswa'
            email: userData.email || null,
            noTelepon: userData.noTelepon || null,
            rfidUid: userData.rfidUid || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        users.push(user);
        this.writeData(users);
        return user;
    }

    // Find user by username
    async findByUsername(username) {
        const users = this.readData();
        return users.find(u => u.username === username);
    }

    // Find user by NIM
    async findByNim(nim) {
        const users = this.readData();
        return users.find(u => u.nim === nim);
    }

    // Find user by username atau NIM
    async findByUsernameOrNim(usernameOrNim) {
        const users = this.readData();
        return users.find(u => u.username === usernameOrNim || u.nim === usernameOrNim);
    }

    // Find user by ID
    async findById(id) {
        const users = this.readData();
        return users.find(u => u.id === id);
    }

    // Find user by RFID UID
    async findByRfidUid(rfidUid) {
        const users = this.readData();
        return users.find(u => u.rfidUid === rfidUid);
    }

    // Verify password
    async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Get all users
    async findAll() {
        return this.readData();
    }

    // Update user
    async update(id, updateData) {
        const users = this.readData();
        const index = users.findIndex(u => u.id === id);
        
        if (index === -1) {
            return false;
        }
        
        // Jika ada password baru, hash dulu
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }
        
        users[index] = {
            ...users[index],
            ...updateData,
            updatedAt: new Date().toISOString()
        };
        
        this.writeData(users);
        return true;
    }

    // Delete user
    async delete(id) {
        const users = this.readData();
        const filtered = users.filter(u => u.id !== id);
        
        if (filtered.length === users.length) {
            return false;
        }
        
        this.writeData(filtered);
        return true;
    }
}

module.exports = new UserJSON();
