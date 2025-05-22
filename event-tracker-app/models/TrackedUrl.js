const { db } = require('../config/database');

class TrackedUrl {
  static async create(urlData) {
    const { url, name, user_id, scan_interval = 10 } = urlData;
    
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO tracked_urls (url, name, user_id, scan_interval, last_scanned, last_event_count, is_active)
        VALUES (?, ?, ?, ?, datetime('now'), 0, 1)
      `);
      
      stmt.run([url, name, user_id, scan_interval], function(err) {
        stmt.finalize();
        if (err) {
          console.error('TrackedUrl.create error:', err);
          reject(err);
        } else {
          console.log('TrackedUrl created with ID:', this.lastID);
          resolve({ 
            id: this.lastID, 
            url, 
            name, 
            user_id, 
            scan_interval,
            last_event_count: 0,
            is_active: 1,
            created_at: new Date().toISOString()
          });
        }
      });
    });
  }

  static async findByUserId(userId) {
    return new Promise((resolve, reject) => {
      console.log('TrackedUrl.findByUserId called with:', userId);
      
      db.all(`
        SELECT * FROM tracked_urls 
        WHERE user_id = ? AND is_active = 1 
        ORDER BY created_at DESC
      `, [userId], (err, rows) => {
        if (err) {
          console.error('TrackedUrl.findByUserId error:', err);
          reject(err);
        } else {
          console.log('TrackedUrl.findByUserId result:', rows);
          resolve(rows || []);
        }
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM tracked_urls WHERE id = ?', [id], (err, row) => {
        if (err) {
          console.error('TrackedUrl.findById error:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static async updateLastScan(id, eventCount) {
    return new Promise((resolve, reject) => {
      db.run(`
        UPDATE tracked_urls 
        SET last_scanned = datetime('now'), last_event_count = ?
        WHERE id = ?
      `, [eventCount, id], (err) => {
        if (err) {
          console.error('TrackedUrl.updateLastScan error:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  static async updateStatus(id, isActive) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE tracked_urls SET is_active = ? WHERE id = ?',
        [isActive ? 1 : 0, id],
        (err) => {
          if (err) {
            console.error('TrackedUrl.updateStatus error:', err);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE tracked_urls SET is_active = 0 WHERE id = ?', [id], (err) => {
        if (err) {
          console.error('TrackedUrl.delete error:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  static async getAllActive() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM tracked_urls WHERE is_active = 1', (err, rows) => {
        if (err) {
          console.error('TrackedUrl.getAllActive error:', err);
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }
}

module.exports = TrackedUrl;
