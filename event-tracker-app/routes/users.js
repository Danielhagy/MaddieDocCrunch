const express = require('express');
const { authenticateJWT } = require('../middleware/auth');
const router = express.Router();

// Get current user
router.get('/me', authenticateJWT, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
