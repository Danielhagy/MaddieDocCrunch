const { db } = require('../config/database');

class Notification {
  static async create(notificationData) {
    const { 
      user_id, 
      tracked_url_id, 
      title, 
      message, 
      event_data, 
      type = 'new_event' 
    } = notificationData;
    
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO notifications (user_id, tracked_url_id, title, message, event_data, type, is_read)
        VALUES (?, ?, ?, ?, ?, ?, 0)
      `);
      
      stmt.run([
        user_id, 
        tracked_url_id, 
        title, 
        message, 
        JSON.stringify(event_data), 
        type
      ], function(err) {
        stmt.finalize();
        if (err) {
          console.error('Notification.create error:', err);
          reject(err);
        } else {
          resolve({ 
            id: this.lastID, 
            user_id, 
            tracked_url_id, 
            title, 
            message, 
            event_data,
            type,
            is_read: false,
            created_at: new Date().toISOString()
          });
        }
      });
    });
  }

  static async findByUserId(userId, limit = 50) {
    return new Promise((resolve, reject) => {
      console.log('Notification.findByUserId called with:', userId);
      
      db.all(`
        SELECT n.*, tu.name as url_name, tu.url 
        FROM notifications n
        LEFT JOIN tracked_urls tu ON n.tracked_url_id = tu.id
        WHERE n.user_id = ? 
        ORDER BY n.created_at DESC 
        LIMIT ?
      `, [userId, limit], (err, rows) => {
        if (err) {
          console.error('Notification.findByUserId error:', err);
          reject(err);
        } else {
          console.log('Notification.findByUserId result:', rows);
          const notifications = (rows || []).map(row => ({
            ...row,
            event_data: row.event_data ? JSON.parse(row.event_data) : null
          }));
          resolve(notifications);
        }
      });
    });
  }

  static async markAsRead(id) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE notifications SET is_read = 1 WHERE id = ?', [id], (err) => {
        if (err) {
          console.error('Notification.markAsRead error:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  static async markAllAsRead(userId) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId], (err) => {
        if (err) {
          console.error('Notification.markAllAsRead error:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  static async getUnreadCount(userId) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
        [userId],
        (err, row) => {
          if (err) {
            console.error('Notification.getUnreadCount error:', err);
            reject(err);
          } else {
            resolve(row ? row.count : 0);
          }
        }
      );
    });
  }
}

module.exports = Notification;
