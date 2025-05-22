const { db } = require('../config/database');
const TrackedUrl = require('../models/TrackedUrl');
const Notification = require('../models/Notification');

async function testModels() {
  try {
    console.log('� Testing database models...');
    
    // Test TrackedUrl.findByUserId
    console.log('Testing TrackedUrl.findByUserId(1)...');
    const urls = await TrackedUrl.findByUserId(1);
    console.log('✅ TrackedUrl.findByUserId result:', urls);
    
    // Test Notification.findByUserId
    console.log('Testing Notification.findByUserId(1)...');
    const notifications = await Notification.findByUserId(1);
    console.log('✅ Notification.findByUserId result:', notifications);
    
    // Test Notification.getUnreadCount
    console.log('Testing Notification.getUnreadCount(1)...');
    const unreadCount = await Notification.getUnreadCount(1);
    console.log('✅ Notification.getUnreadCount result:', unreadCount);
    
    console.log('✅ All model tests passed!');
    
  } catch (error) {
    console.error('❌ Model test failed:', error);
  } finally {
    db.close();
    process.exit(0);
  }
}

testModels();
