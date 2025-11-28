// Vercel serverless function for /api/todos routes
const express = require('express');
const cors = require('cors');

let todoRoutes;
try {
  todoRoutes = require('../../backend/src/routes/todos');
} catch (error) {
  console.error('Failed to load todos routes:', error);
  // Return error handler if routes can't be loaded
  module.exports = (req, res) => {
    res.status(500).json({ 
      error: 'Failed to load todos routes',
      details: error.message 
    });
  };
  return;
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount the todos router at root since Vercel already routes /api/todos to this function
// The router internally handles paths like /, /:id, /:id/complete, etc.
app.use('/', todoRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Export as Vercel serverless function
module.exports = app;

