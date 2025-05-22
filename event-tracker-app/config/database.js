const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_PATH || './database/events.db';

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE,
          email TEXT UNIQUE,
          password_hash TEXT,
          oauth_provider TEXT,
          oauth_id TEXT,
          display_name TEXT,
          avatar_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Events table
      db.run(`
        CREATE TABLE IF NOT EXISTS events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          date DATETIME,
          location TEXT,
          url TEXT,
          user_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Database tables initialized');
          resolve();
        }
      });
    });
  });
};

const initializeTrackingTables = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Tracked URLs table with correct schema
      db.run(`
        CREATE TABLE IF NOT EXISTS tracked_urls (
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
      `);

      // Notifications table with correct schema
      db.run(`
        CREATE TABLE IF NOT EXISTS notifications (
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
          reject(err);
        } else {
          console.log('✅ Tracking tables initialized');
          resolve();
        }
      });
    });
  });
};

module.exports = { db, initializeDatabase, initializeTrackingTables };
