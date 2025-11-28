// Vercel serverless function wrapper for Express app
const express = require('express');
const cors = require('cors');
const path = require('path');
const todoRoutes = require('../backend/src/routes/todos');
const todoTypeRoutes = require('../backend/src/routes/todoTypes');

// Add reset routes if enabled
let resetRoutes = null;
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_RESET === 'true') {
  try {
    resetRoutes = require('../backend/src/routes/reset');
  } catch (err) {
    console.warn('Reset routes not available:', err.message);
  }
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/todos', todoRoutes);
app.use('/api/todo-types', todoTypeRoutes);

// Reset routes (only for development/testing)
if (resetRoutes) {
  app.use('/api/reset', resetRoutes);
  console.log('🔄 Reset endpoint available at: POST /api/reset');
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server running', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Export as Vercel serverless function
module.exports = app;

