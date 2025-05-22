const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

console.log('� Starting DocumentCrunch Event Hub API...');

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Load scraping routes
try {
  const scrapingRoutes = require('./routes/scraping');
  app.use('/api/scraping', scrapingRoutes);
  console.log('✅ Scraping routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load scraping routes:', error.message);
  process.exit(1);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'DocumentCrunch Event Hub API is running!',
    team: 'Maddie\'s Event Tracking Team',
    version: '1.0.0',
    features: ['Event Finding (Demo Mode)'],
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: '� Event Finder is ready!',
    status: 'online',
    demoMode: true,
    instructions: 'Use POST /api/scraping/analyze with {"url": "https://example.com"}'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('� Server error:', error);
  res.status(500).json({
    error: 'Something went wrong on our end',
    message: 'Please try again in a moment'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `${req.method} ${req.path} is not available`,
    availableEndpoints: [
      'GET /api/health',
      'GET /api/test', 
      'POST /api/scraping/analyze',
      'POST /api/scraping/extract'
    ]
  });
});

// Start server
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('');
  console.log('� DocumentCrunch Event Hub API Started!');
  console.log('========================================');
  console.log(`� API URL: http://localhost:${PORT}`);
  console.log(`� Health Check: http://localhost:${PORT}/api/health`);
  console.log(`� Test: http://localhost:${PORT}/api/test`);
  console.log(`� Event Finder: http://localhost:${PORT}/api/scraping/analyze`);
  console.log('');
  console.log('�‍� Project Lead: Maddie');
  console.log('� Team: DocumentCrunch Event Division');
  console.log('');
  console.log('✅ Ready to find events!');
});
