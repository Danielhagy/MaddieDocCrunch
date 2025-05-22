const cron = require('node-cron');
const TrackedUrl = require('../models/TrackedUrl');
const Notification = require('../models/Notification');

class MonitoringService {
  constructor() {
    this.isRunning = false;
    this.cronJob = null;
  }

  start() {
    if (this.isRunning) return;
    
    console.log('íµ’ Starting URL monitoring service...');
    
    // Run every 10 minutes
    this.cronJob = cron.schedule('*/10 * * * *', async () => {
      await this.checkAllTrackedUrls();
    }, {
      scheduled: false
    });
    
    this.cronJob.start();
    this.isRunning = true;
    console.log('âœ… URL monitoring service started');
  }

  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
    this.isRunning = false;
    console.log('í»‘ URL monitoring service stopped');
  }

  async checkAllTrackedUrls() {
    try {
      console.log('í´ Checking all tracked URLs for changes...');
      
      const trackedUrls = await TrackedUrl.getAllActive();
      
      for (const trackedUrl of trackedUrls) {
        await this.checkSingleUrl(trackedUrl);
        // Add delay between requests to be respectful
        await this.delay(2000);
      }
      
      console.log(`âœ… Completed checking ${trackedUrls.length} tracked URLs`);
    } catch (error) {
      console.error('âŒ Error in monitoring service:', error);
    }
  }

  async checkSingleUrl(trackedUrl) {
    try {
      console.log(`í´ Checking ${trackedUrl.name} (${trackedUrl.url})`);
      
      // Import scraping service
      const { scrapingService } = require('./scrapingService');
      const events = await scrapingService.scrapeEvents(trackedUrl.url);
      const currentEventCount = events.length;
      const previousEventCount = trackedUrl.last_event_count || 0;
      
      // Update last scan time and event count
      await TrackedUrl.updateLastScan(trackedUrl.id, currentEventCount);
      
      // Check if new events were found
      if (currentEventCount > previousEventCount) {
        const newEventCount = currentEventCount - previousEventCount;
        console.log(`í¾‰ Found ${newEventCount} new events on ${trackedUrl.name}`);
        
        // Create notification
        await Notification.create({
          user_id: trackedUrl.user_id,
          tracked_url_id: trackedUrl.id,
          title: `New Events Found!`,
          message: `${newEventCount} new event(s) discovered on ${trackedUrl.name}`,
          event_data: {
            newEventCount,
            totalEvents: currentEventCount,
            url: trackedUrl.url,
            events: events.slice(-newEventCount) // Get the newest events
          },
          type: 'new_event'
        });
        
        // Emit real-time notification if WebSocket is available
        if (global.io) {
          global.io.to(`user_${trackedUrl.user_id}`).emit('new_events', {
            trackedUrlId: trackedUrl.id,
            urlName: trackedUrl.name,
            newEventCount,
            totalEvents: currentEventCount,
            events: events.slice(-newEventCount)
          });
        }
      }
    } catch (error) {
      console.error(`âŒ Error checking ${trackedUrl.name}:`, error);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

const monitoringService = new MonitoringService();
module.exports = { monitoringService };
