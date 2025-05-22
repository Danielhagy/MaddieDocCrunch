const express = require('express');
const { authenticateJWT } = require('../middleware/auth');
const TrackingController = require('../controllers/trackingController');

const router = express.Router();

// All routes require authentication
router.use(authenticateJWT);

// Add error handling middleware for tracking routes
router.use((err, req, res, next) => {
  console.error('Tracking route error:', err);
  res.status(500).json({ 
    error: 'Internal server error in tracking module',
    details: err.message 
  });
});

// Tracked URLs
router.post('/urls', async (req, res, next) => {
  try {
    await TrackingController.addTrackedUrl(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/urls', async (req, res, next) => {
  try {
    await TrackingController.getTrackedUrls(req, res);
  } catch (error) {
    next(error);
  }
});

router.put('/urls/:id', async (req, res, next) => {
  try {
    await TrackingController.updateTrackedUrl(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete('/urls/:id', async (req, res, next) => {
  try {
    await TrackingController.deleteTrackedUrl(req, res);
  } catch (error) {
    next(error);
  }
});

// Notifications
router.get('/notifications', async (req, res, next) => {
  try {
    await TrackingController.getNotifications(req, res);
  } catch (error) {
    next(error);
  }
});

router.put('/notifications/:id/read', async (req, res, next) => {
  try {
    await TrackingController.markNotificationRead(req, res);
  } catch (error) {
    next(error);
  }
});

router.put('/notifications/read-all', async (req, res, next) => {
  try {
    await TrackingController.markAllNotificationsRead(req, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
