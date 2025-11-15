require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV || 'production';
const isSimulation = NODE_ENV === 'simulation';

console.log('🔧 Database Mode:');
console.log(`   Environment: ${isSimulation ? '🧪 SIMULATION (Local JSON)' : '🚀 PRODUCTION (MongoDB Cloud)'}`);
console.log('');

module.exports = {
    isSimulation,
    NODE_ENV
};
