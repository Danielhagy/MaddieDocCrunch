const { db } = require('../config/database');

async function fixDatabase() {
  try {
    console.log('Ì¥Ñ Fixing database schema...');
    
    // Drop existing tracking tables if they exist (to recreate with correct schema)
    console.log('Ì∑ëÔ∏è  Dropping existing tracking tables...');
    
    db.serialize(() => {
      db.run('DROP TABLE IF EXISTS notifications');
      db.run('DROP TABLE IF EXISTS tracked_urls');
      
      console.log('‚úÖ Dropped existing tracking tables');
      
      // Recreate tracked_urls table with correct schema
      console.log('Ì¥ß Creating tracked_urls table...');
      db.run(`
        CREATE TABLE tracked_urls (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          url TEXT NOT NULL,
          name TEXT NOT NULL,
          user_id INTEGER NOT NULL,
          scan_interval INTEGER DEFAULT 10,
          last_scanned DATETIME,
          last_event_count INTEGER DEFAULT 0,
          is_active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `, (err) => {
        if (err) {
          console.error('‚ùå Error creating tracked_urls table:', err);
        } else {
          console.log('‚úÖ tracked_urls table created successfully');
        }
      });

      // Recreate notifications table with correct schema
      console.log('Ì¥ß Creating notifications table...');
      db.run(`
        CREATE TABLE notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          tracked_url_id INTEGER,
          title TEXT NOT NULL,
          message TEXT,
          event_data TEXT,
          type TEXT DEFAULT 'new_event',
          is_read INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (tracked_url_id) REFERENCES tracked_urls (id)
        )
      `, (err) => {
        if (err) {
          console.error('‚ùå Error creating notifications table:', err);
        } else {
          console.log('‚úÖ notifications table created successfully');
        }
        
        // Verify the schema
        console.log('Ì¥ç Verifying table schemas...');
        
        db.all("PRAGMA table_info(tracked_urls)", (err, columns) => {
          if (err) {
            console.error('‚ùå Error checking tracked_urls schema:', err);
          } else {
            console.log('Ì≥ã tracked_urls columns:');
            columns.forEach(col => {
              console.log(`   ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? 'DEFAULT ' + col.dflt_value : ''}`);
            });
          }
          
          db.all("PRAGMA table_info(notifications)", (err, columns) => {
            if (err) {
              console.error('‚ùå Error checking notifications schema:', err);
            } else {
              console.log('Ì≥ã notifications columns:');
              columns.forEach(col => {
                console.log(`   ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? 'DEFAULT ' + col.dflt_value : ''}`);
              });
            }
            
            console.log('‚úÖ Database schema fixed successfully!');
            db.close();
          });
        });
      });
    });
    
  } catch (error) {
    console.error('‚ùå Database fix failed:', error);
    process.exit(1);
  }
}

fixDatabase();
