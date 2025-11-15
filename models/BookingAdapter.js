const { isSimulation } = require('../config/database-mode');

// Import both implementations
const BookingMongoDB = require('./Booking');
const BookingJSON = require('./BookingJSON');

// Export the appropriate implementation based on environment
module.exports = isSimulation ? BookingJSON : BookingMongoDB;
