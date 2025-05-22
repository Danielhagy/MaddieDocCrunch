const { initializeDatabase, initializeTrackingTables } = require('../config/database');
const User = require('../models/User');

async function initializeAdmin() {
  try {
    console.log('Ì¥Ñ Initializing admin user...');
    
    // Ensure database is ready
    await initializeDatabase();
    await initializeTrackingTables();
    
    // Create admin user
    await User.createAdminUser();
    
    console.log('‚úÖ Admin initialization complete!');
    console.log('Ì±ë Admin credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin');
    console.log('   Email: admin@documentcrunch.com');
    
    process.exit(0);
  } catch (error) {
    console.error('‚ùå Admin initialization failed:', error);
    process.exit(1);
  }
}

initializeAdmin();
