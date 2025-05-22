import { io } from 'socket.io-client';

let socket = null;

export const connectWebSocket = (user) => {
  if (socket) {
    socket.disconnect();
  }

  const token = localStorage.getItem('token');
  
  socket = io(process.env.REACT_APP_API_URL || 'http://localhost:3001', {
    auth: {
      token: token
    }
  });

  socket.on('connect', () => {
    console.log('í´Œ Connected to WebSocket');
  });

  socket.on('disconnect', () => {
    console.log('í´Œ Disconnected from WebSocket');
  });

  socket.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error);
  });

  return socket;
};

export const getSocket = () => socket;
