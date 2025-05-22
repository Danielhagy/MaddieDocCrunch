const { db, initializeDatabase, initializeTrackingTables } = require('../config/database');

async function initializeDb() {
  try {
    console.log('Ì¥Ñ Starting database initialization...');
    
    await initializeDatabase();
    console.log('‚úÖ Main tables initialized');
    
    await initializeTrackingTables();
    console.log('‚úÖ Tracking tables initialized');
    
    // Test the tables
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
      if (err) {
        console.error('‚ùå Error checking tables:', err);
      } else {
        console.log('Ì≥ã Available tables:', tables.map(t => t.name));
      }
      
      // Close database connection
      db.close((err) => {
        if (err) {
          console.error('‚ùå Error closing database:', err);
        } else {
          console.log('‚úÖ Database initialization complete');
        }
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('‚ùå Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDb();
