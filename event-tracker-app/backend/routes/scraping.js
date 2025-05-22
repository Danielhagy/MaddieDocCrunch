const express = require('express');
const { body, validationResult } = require('express-validator');
const ScrapingController = require('../controllers/scrapingController');

const router = express.Router();

// Simple validation middleware
const validateUrl = [
  body('url').isURL().withMessage('Please provide a valid URL'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Invalid URL provided',
        errors: errors.array() 
      });
    }
    next();
  }
];

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    message: 'í¾ª Event Finder API is working!',
    status: 'online',
    endpoints: [
      'POST /analyze - Find events on a website',
      'POST /extract - Download events as Excel'
    ]
  });
});

// Main endpoints
router.post('/analyze', validateUrl, ScrapingController.analyzeUrl);
router.post('/extract', ScrapingController.extractData);

module.exports = router;
