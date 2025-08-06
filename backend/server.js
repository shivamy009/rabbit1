const express = require('express');
const cors = require('cors');
const http = require('http');
const setupSocket = require('./socket/socket');
const apiRoutes = require('./routes/api');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = setupSocket(server);

// CORS middleware
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from Vite dev server
  credentials: true
}));

// Middleware for parsing JSON and URL-encoded data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'WhatsApp Webhook Server is running!', 
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
});

// API routes
app.use('/api', apiRoutes(io));

// 404 handler - Simple approach
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));