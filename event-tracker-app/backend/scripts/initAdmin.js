const { initializeDatabase, initializeTrackingTables } = require('../config/database');
const User = require('../models/User');

async function initializeAdmin() {
  try {
    console.log('� Initializing admin user...');
    
    // Ensure database is ready
    await initializeDatabase();
    await initializeTrackingTables();
    
    // Create admin user
    await User.createAdminUser();
    
    console.log('✅ Admin initialization complete!');
    console.log('� Admin credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin');
    console.log('   Email: admin@documentcrunch.com');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Admin initialization failed:', error);
    process.exit(1);
  }
}

initializeAdmin();
