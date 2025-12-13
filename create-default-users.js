require('dotenv').config();
const User = require('./models/UserAdapter');
const { connectDB } = require('./config/database');
const { isSimulation } = require('./config/database-mode');

async function createDefaultUsers() {
    try {
        // Connect to database if not simulation mode
        if (!isSimulation) {
            await connectDB();
        }
        
        console.log('🔧 Creating default users...');
        
        // Check if admin already exists
        const adminExists = await User.findByUsername('admin');
        
        if (adminExists) {
            console.log('⚠️  Admin user already exists');
        } else {
            // Create default admin user
            await User.create({
                username: 'admin',
                password: 'admin123', // Will be hashed automatically
                nama: 'Administrator',
                role: 'admin',
                email: 'admin@example.com',
                noTelepon: '-'
            });
            console.log('✅ Admin user created successfully');
            console.log('   Username: admin');
            console.log('   Password: admin123');
        }
        
        // Check if mahasiswa test account exists
        const mahasiswaExists = await User.findByUsername('mahasiswa');
        
        if (mahasiswaExists) {
            console.log('⚠️  Mahasiswa test user already exists');
        } else {
            // Create default mahasiswa user
            await User.create({
                username: 'mahasiswa',
                password: 'mahasiswa123', // Will be hashed automatically
                nama: 'Test Mahasiswa',
                role: 'mahasiswa',
                email: 'mahasiswa@example.com',
                noTelepon: '081234567890'
            });
            console.log('✅ Mahasiswa test user created successfully');
            console.log('   Username: mahasiswa');
            console.log('   Password: mahasiswa123');
        }
        
        console.log('');
        console.log('🎉 Default users setup complete!');
        console.log('');
        console.log('You can now login with:');
        console.log('  Admin: username=admin, password=admin123');
        console.log('  Mahasiswa: username=mahasiswa, password=mahasiswa123');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating default users:', error);
        process.exit(1);
    }
}

createDefaultUsers();
