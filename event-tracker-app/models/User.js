const { db } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { username, email, password, displayName } = userData;
    
    // Validate required fields
    if (!username || !email || !password) {
      throw new Error('Username, email, and password are required');
    }

    // Hash password with a high salt rounds for security
    const passwordHash = await bcrypt.hash(password, 12);
    
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO users (username, email, password_hash, display_name, created_at, updated_at)
        VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
      `);
      
      stmt.run([username, email, passwordHash, displayName || username], function(err) {
        stmt.finalize();
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            if (err.message.includes('username')) {
              reject(new Error('Username already exists'));
            } else if (err.message.includes('email')) {
              reject(new Error('Email already exists'));
            } else {
              reject(new Error('User already exists'));
            }
          } else {
            reject(err);
          }
        } else {
          console.log(`âœ… User created: ${username} (ID: ${this.lastID})`);
          resolve({ 
            id: this.lastID, 
            username, 
            email, 
            displayName: displayName || username,
            created_at: new Date().toISOString()
          });
        }
      });
    });
  }

  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) reject(err);
        else resolve(user);
      });
    });
  }

  static async findByUsername(username) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) reject(err);
        else resolve(user);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
        if (err) reject(err);
        else resolve(user);
      });
    });
  }

  static async validatePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  static async createAdminUser() {
    try {
      // Check if admin user already exists
      const existingAdmin = await User.findByUsername('admin');
      if (existingAdmin) {
        console.log('â„¹ï¸  Admin user already exists');
        return existingAdmin;
      }

      // Create admin user
      const admin = await User.create({
        username: 'admin',
        email: 'admin@documentcrunch.com',
        password: 'admin',
        displayName: 'Administrator'
      });

      console.log('í±‘ Admin user created successfully');
      return admin;
    } catch (error) {
      console.error('âŒ Error creating admin user:', error);
      throw error;
    }
  }

  static async getUserStats(userId) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          (SELECT COUNT(*) FROM tracked_urls WHERE user_id = ? AND is_active = 1) as tracked_urls,
          (SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0) as unread_notifications,
          (SELECT SUM(last_event_count) FROM tracked_urls WHERE user_id = ?) as total_events_found
      `, [userId, userId, userId], (err, result) => {
        if (err) reject(err);
        else resolve(result[0] || { tracked_urls: 0, unread_notifications: 0, total_events_found: 0 });
      });
    });
  }
}

module.exports = User;
