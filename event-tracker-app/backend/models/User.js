const { db } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { username, email, password, displayName } = userData;
    const passwordHash = password ? await bcrypt.hash(password, 12) : null;
    
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO users (username, email, password_hash, display_name)
        VALUES (?, ?, ?, ?)
      `);
      
      stmt.run([username, email, passwordHash, displayName || username], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, username, email, displayName: displayName || username });
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
}

module.exports = User;
