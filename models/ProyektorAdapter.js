const { isSimulation } = require('../config/database-mode');

// Import both implementations
const ProyektorMongoDB = require('./Proyektor');
const ProyektorJSON = require('./ProyektorJSON');

// Export the appropriate implementation based on environment
module.exports = isSimulation ? ProyektorJSON : ProyektorMongoDB;
