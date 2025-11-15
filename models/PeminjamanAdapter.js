const { isSimulation } = require('../config/database-mode');

// Import both implementations
const PeminjamanMongoDB = require('./Peminjaman');
const PeminjamanJSON = require('./PeminjamanJSON');

// Export the appropriate implementation based on environment
module.exports = isSimulation ? PeminjamanJSON : PeminjamanMongoDB;
