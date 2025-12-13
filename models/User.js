const { getDB } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
    constructor() {
        this.collection = null;
    }

    async init() {
        if (!this.collection) {
            const db = getDB();
            this.collection = db.collection('users');
            
            // Create index untuk username (unique)
            await this.collection.createIndex({ username: 1 }, { unique: true });
        }
    }

    // Create user baru
    async create(userData) {
        await this.init();
        
        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        const user = {
            username: userData.username,
            password: hashedPassword,
            nama: userData.nama,
            role: userData.role, // 'admin' atau 'mahasiswa'
            email: userData.email || null,
            noTelepon: userData.noTelepon || null,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const result = await this.collection.insertOne(user);
        return { ...user, _id: result.insertedId };
    }

    // Find user by username
    async findByUsername(username) {
        await this.init();
        return await this.collection.findOne({ username });
    }

    // Find user by ID
    async findById(id) {
        await this.init();
        const ObjectId = require('mongodb').ObjectId;
        return await this.collection.findOne({ _id: new ObjectId(id) });
    }

    // Verify password
    async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Get all users
    async findAll() {
        await this.init();
        return await this.collection.find({}).toArray();
    }

    // Update user
    async update(id, updateData) {
        await this.init();
        const ObjectId = require('mongodb').ObjectId;
        
        // Jika ada password baru, hash dulu
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }
        
        updateData.updatedAt = new Date();
        
        const result = await this.collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        return result.modifiedCount > 0;
    }

    // Delete user
    async delete(id) {
        await this.init();
        const ObjectId = require('mongodb').ObjectId;
        const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }
}

module.exports = new User();
