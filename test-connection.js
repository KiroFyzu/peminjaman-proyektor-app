require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

async function testConnection() {
    console.log('🔍 Testing MongoDB Connection...');
    console.log('📍 URI:', MONGODB_URI?.substring(0, 30) + '...');
    console.log('📦 Database:', DB_NAME);
    console.log('');
    
    try {
        const client = new MongoClient(MONGODB_URI);
        console.log('⏳ Connecting...');
        
        await client.connect();
        console.log('✅ Connected successfully!');
        
        const db = client.db(DB_NAME);
        console.log('✅ Database accessible!');
        
        // Test write
        const testCollection = db.collection('test');
        await testCollection.insertOne({ test: 'connection', timestamp: new Date() });
        console.log('✅ Write test passed!');
        
        // Test read
        const doc = await testCollection.findOne({ test: 'connection' });
        console.log('✅ Read test passed!');
        
        // Cleanup
        await testCollection.deleteOne({ test: 'connection' });
        console.log('✅ Cleanup done!');
        
        await client.close();
        console.log('');
        console.log('🎉 All tests passed! MongoDB is ready to use.');
        
    } catch (error) {
        console.error('');
        console.error('❌ Connection failed!');
        console.error('');
        
        if (error.message.includes('ENOTFOUND')) {
            console.error('🔴 DNS Error: Cannot resolve MongoDB hostname');
            console.error('💡 Check your MONGODB_URI in .env file');
        } else if (error.message.includes('Authentication failed')) {
            console.error('🔴 Authentication Error');
            console.error('💡 Check your username and password in connection string');
        } else if (error.message.includes('IP') || error.message.includes('not authorized')) {
            console.error('🔴 IP Not Whitelisted');
            console.error('💡 Add your IP address to MongoDB Atlas:');
            console.error('   1. Go to MongoDB Atlas Dashboard');
            console.error('   2. Network Access → Add IP Address');
            console.error('   3. Add "0.0.0.0/0" for development (allow all)');
        } else {
            console.error('🔴 Error:', error.message);
        }
        
        console.error('');
        process.exit(1);
    }
}

testConnection();
