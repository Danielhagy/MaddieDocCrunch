const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { db } = require('./database');

const setupWebSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Authentication middleware for WebSocket
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      db.get('SELECT * FROM users WHERE id = ?', [decoded.id], (err, user) => {
        if (err || !user) {
          return next(new Error('Authentication error'));
        }
        
        socket.userId = user.id;
        socket.user = user;
        next();
      });
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.username} connected to WebSocket`);
    
    // Join user-specific room
    socket.join(`user_${socket.userId}`);
    
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.username} disconnected from WebSocket`);
    });
  });

  // Make io available globally for notifications
  global.io = io;
  
  return io;
};

module.exports = { setupWebSocket };
