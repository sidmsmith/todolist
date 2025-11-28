// Vercel serverless function for /api/todo-types routes
const express = require('express');
const cors = require('cors');

let todoTypeRoutes;
try {
  todoTypeRoutes = require('../../backend/src/routes/todoTypes');
} catch (error) {
  console.error('Failed to load todo-types routes:', error);
  // Return error handler if routes can't be loaded
  module.exports = (req, res) => {
    res.status(500).json({ 
      error: 'Failed to load todo-types routes',
      details: error.message 
    });
  };
  return;
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount the todo-types router at root since Vercel already routes /api/todo-types to this function
// The router internally handles paths like /, /:id, etc.
app.use('/', todoTypeRoutes);

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

