const express = require('express');
const { authenticateJWT } = require('../middleware/auth');
const router = express.Router();

// Get user's events
router.get('/', authenticateJWT, (req, res) => {
  res.json({ events: [] });
});

module.exports = router;
