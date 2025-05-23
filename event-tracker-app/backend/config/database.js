const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

// Use /tmp for production (writable), local path for development
const getDbPath = () => {
  if (process.env.NODE_ENV === "production") {
    // Use /tmp directory which is writable on most platforms
    return "/tmp/events.db";
  } else {
    // Local development - create directory if needed
    const dbDir = "./database";
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    return process.env.DATABASE_PATH || "./database/events.db";
  }
};

const dbPath = getDbPath();
console.log("📊 Database path:", dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err);
  } else {
    console.log("✅ Connected to SQLite database");
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
      db.run(
        `
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
      `,
        (err) => {
          if (err) {
            reject(err);
          } else {
            console.log("✅ Database tables initialized");
            // Create admin user if it doesn't exist
            createAdminUser().then(resolve).catch(reject);
          }
        }
      );
    });
  });
};

const createAdminUser = async () => {
  return new Promise((resolve) => {
    // Check if admin user exists
    db.get(
      "SELECT * FROM users WHERE username = ?",
      ["admin"],
      async (err, user) => {
        if (err || user) {
          console.log("👤 Admin user check completed");
          resolve();
          return;
        }

        // Create admin user
        try {
          const bcrypt = require("bcryptjs");
          const hashedPassword = await bcrypt.hash("admin", 12);

          const stmt = db.prepare(`
          INSERT INTO users (username, email, password_hash, display_name)
          VALUES (?, ?, ?, ?)
        `);

          stmt.run(
            ["admin", "admin@documentcrunch.com", hashedPassword, "Admin"],
            function (err) {
              stmt.finalize();
              if (err) {
                console.error("Failed to create admin user:", err);
              } else {
                console.log("👤 Created admin user (admin/admin)");
              }
              resolve();
            }
          );
        } catch (error) {
          console.error("Error creating admin user:", error);
          resolve();
        }
      }
    );
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
      db.run(
        `
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
      `,
        (err) => {
          if (err) {
            reject(err);
          } else {
            console.log("✅ Tracking tables initialized");
            resolve();
          }
        }
      );
    });
  });
};

module.exports = { db, initializeDatabase, initializeTrackingTables };
