const TrackedUrl = require('../models/TrackedUrl');
const Notification = require('../models/Notification');

class TrackingController {
  static async addTrackedUrl(req, res) {
    try {
      const { url, name, scan_interval } = req.body;
      const user_id = req.user.id;

      console.log('Adding tracked URL:', { url, name, scan_interval, user_id });

      if (!url || !name) {
        return res.status(400).json({ error: 'URL and name are required' });
      }

      // Validate URL
      try {
        new URL(url);
      } catch (error) {
        return res.status(400).json({ error: 'Invalid URL format' });
      }

      const trackedUrl = await TrackedUrl.create({
        url,
        name,
        user_id,
        scan_interval: scan_interval || 10
      });

      console.log('Created tracked URL:', trackedUrl);

      // Perform initial scan (optional, can be skipped for now)
      try {
        const { scrapingService } = require('../services/scrapingService');
        const events = await scrapingService.scrapeEvents(url);
        await TrackedUrl.updateLastScan(trackedUrl.id, events.length);
        trackedUrl.last_event_count = events.length;
        console.log(`Initial scan found ${events.length} events`);
      } catch (error) {
        console.error('Initial scan failed:', error);
        // Don't fail the request if scanning fails
      }

      res.status(201).json({
        message: 'URL tracking started successfully',
        trackedUrl
      });
    } catch (error) {
      console.error('Add tracked URL error:', error);
      res.status(500).json({ 
        error: 'Failed to add tracked URL',
        details: error.message 
      });
    }
  }

  static async getTrackedUrls(req, res) {
    try {
      const user_id = req.user.id;
      console.log('Getting tracked URLs for user:', user_id);
      
      const trackedUrls = await TrackedUrl.findByUserId(user_id);
      console.log('Found tracked URLs:', trackedUrls.length);
      
      res.json({ trackedUrls });
    } catch (error) {
      console.error('Get tracked URLs error:', error);
      res.status(500).json({ 
        error: 'Failed to get tracked URLs',
        details: error.message 
      });
    }
  }

  static async updateTrackedUrl(req, res) {
    try {
      const { id } = req.params;
      const { name, scan_interval, is_active } = req.body;
      
      const trackedUrl = await TrackedUrl.findById(id);
      if (!trackedUrl) {
        return res.status(404).json({ error: 'Tracked URL not found' });
      }

      if (trackedUrl.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Update fields as needed
      if (is_active !== undefined) {
        await TrackedUrl.updateStatus(id, is_active);
      }

      res.json({ message: 'Tracked URL updated successfully' });
    } catch (error) {
      console.error('Update tracked URL error:', error);
      res.status(500).json({ 
        error: 'Failed to update tracked URL',
        details: error.message 
      });
    }
  }

  static async deleteTrackedUrl(req, res) {
    try {
      const { id } = req.params;
      
      const trackedUrl = await TrackedUrl.findById(id);
      if (!trackedUrl) {
        return res.status(404).json({ error: 'Tracked URL not found' });
      }

      if (trackedUrl.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await TrackedUrl.delete(id);
      res.json({ message: 'Tracked URL deleted successfully' });
    } catch (error) {
      console.error('Delete tracked URL error:', error);
      res.status(500).json({ 
        error: 'Failed to delete tracked URL',
        details: error.message 
      });
    }
  }

  static async getNotifications(req, res) {
    try {
      const user_id = req.user.id;
      console.log('Getting notifications for user:', user_id);
      
      const notifications = await Notification.findByUserId(user_id);
      const unreadCount = await Notification.getUnreadCount(user_id);
      
      res.json({ 
        notifications,
        unreadCount 
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ 
        error: 'Failed to get notifications',
        details: error.message 
      });
    }
  }

  static async markNotificationRead(req, res) {
    try {
      const { id } = req.params;
      await Notification.markAsRead(id);
      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      console.error('Mark notification read error:', error);
      res.status(500).json({ 
        error: 'Failed to mark notification as read',
        details: error.message 
      });
    }
  }

  static async markAllNotificationsRead(req, res) {
    try {
      const user_id = req.user.id;
      await Notification.markAllAsRead(user_id);
      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Mark all notifications read error:', error);
      res.status(500).json({ 
        error: 'Failed to mark all notifications as read',
        details: error.message 
      });
    }
  }
}

module.exports = TrackingController;
