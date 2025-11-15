const { MongoClient } = require('mongodb');
const { isSimulation } = require('./database-mode');

// Load environment variables
require('dotenv').config();

// URL MongoDB - ganti dengan URL MongoDB Anda
// Untuk lokal: mongodb://localhost:27017
// Untuk MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'peminjamanProyektor';

console.log('🔧 MongoDB Config:');
console.log('   URI:', MONGODB_URI ? MONGODB_URI.substring(0, 30) + '...' : 'NOT SET');
console.log('   DB:', DB_NAME);
console.log('');

let db = null;
let client = null;

async function connectDB() {
    try {
        if (isSimulation) {
            console.log('🧪 Running in SIMULATION mode - Using local JSON files');
            console.log('📁 Data location: ./data/*.json\n');
            return null; // No MongoDB connection needed
        }

        if (db) {
            return db;
        }

        client = new MongoClient(MONGODB_URI);
        await client.connect();
        
        db = client.db(DB_NAME);
        console.log(`✅ Connected to MongoDB: ${DB_NAME}`);
        
        return db;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error;
    }
}

function getDB() {
    if (isSimulation) {
        return null; // Return null in simulation mode
    }
    if (!db) {
        throw new Error('Database not connected. Call connectDB first.');
    }
    return db;
}

async function closeDB() {
    if (client) {
        await client.close();
        db = null;
        client = null;
        console.log('MongoDB connection closed');
    }
}

module.exports = {
    connectDB,
    getDB,
    closeDB
};
