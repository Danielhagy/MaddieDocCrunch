const { db, initializeDatabase, initializeTrackingTables } = require('../config/database');

async function initializeDb() {
  try {
    console.log('� Starting database initialization...');
    
    await initializeDatabase();
    console.log('✅ Main tables initialized');
    
    await initializeTrackingTables();
    console.log('✅ Tracking tables initialized');
    
    // Test the tables
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
      if (err) {
        console.error('❌ Error checking tables:', err);
      } else {
        console.log('� Available tables:', tables.map(t => t.name));
      }
      
      // Close database connection
      db.close((err) => {
        if (err) {
          console.error('❌ Error closing database:', err);
        } else {
          console.log('✅ Database initialization complete');
        }
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDb();
