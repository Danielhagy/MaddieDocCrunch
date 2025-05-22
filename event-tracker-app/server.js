const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const path = require('path');
require('dotenv').config();

const { initializeDatabase, initializeTrackingTables } = require('./config/database');
const User = require('./models/User');

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users');
const trackingRoutes = require('./routes/tracking');

const app = express();
const server = http.createServer(app);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: true, // Allow all origins for now
  credentials: true
}));

// Rate limiting
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tracking', trackingRoutes);

// Scraping endpoint
app.post('/api/scraping/analyze', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const { scrapingService } = require('./services/scrapingService');
    const events = await scrapingService.scrapeEvents(url);
    
    res.json({
      url,
      events,
      fetchMethod: 'Smart Detection',
      totals: { total: events.length, events: events.length }
    });
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ error: 'Failed to analyze website' });
  }
});

// Excel export
app.post('/api/scraping/extract', async (req, res) => {
  try {
    const { selectedEvents } = req.body;
    if (!selectedEvents?.length) {
      return res.status(400).json({ error: 'No events selected' });
    }

    const XLSX = require('xlsx');
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(
      selectedEvents.map(event => ({
        'Event Name': event.name || '',
        'Date': event.date || '',
        'Time': event.time || '',
        'Location': event.location || '',
        'Description': event.description || ''
      }))
    );
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Events');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="events.xlsx"');
    res.send(buffer);
  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ error: 'Failed to generate Excel file' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'DocumentCrunch Event Hub API', 
    status: 'running',
    endpoints: ['/api/health', '/api/auth/login', '/api/scraping/analyze']
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Use Railway's PORT or fallback
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    console.log('Ì¥Ñ Initializing database...');
    await initializeDatabase();
    await initializeTrackingTables();
    await User.createAdminUser();
    
    // Bind to 0.0.0.0 for Railway
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Ì∫Ä Server running on port ${PORT}`);
      console.log(`Ìºç Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('‚ùå Failed to start:', error);
    process.exit(1);
  }
};

startServer();
