const { isSimulation } = require('../config/database-mode');

let UserImpl;

if (isSimulation) {
    console.log('🧪 Using UserJSON (Simulation Mode)');
    UserImpl = require('./UserJSON');
} else {
    console.log('🚀 Using User MongoDB (Production Mode)');
    UserImpl = require('./User');
}

module.exports = UserImpl;
