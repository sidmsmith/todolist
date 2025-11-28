// Vercel serverless function for /api/todos routes
console.log('[API/TODOS] Serverless function loading...');

const express = require('express');
const cors = require('cors');

console.log('[API/TODOS] Express and CORS loaded');

let todoRoutes;
try {
  console.log('[API/TODOS] Attempting to load todos routes from ../../backend/src/routes/todos');
  todoRoutes = require('../../backend/src/routes/todos');
  console.log('[API/TODOS] Todos routes loaded successfully');
} catch (error) {
  console.error('[API/TODOS] Failed to load todos routes:', error);
  console.error('[API/TODOS] Error stack:', error.stack);
  // Return error handler if routes can't be loaded
  module.exports = (req, res) => {
    console.log('[API/TODOS] Error handler called for request:', req.method, req.url);
    res.status(500).json({ 
      error: 'Failed to load todos routes',
      details: error.message,
      stack: error.stack
    });
  };
  return;
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log('[API/TODOS] Request received:', req.method, req.url, req.path);
  next();
});

// Mount the todos router at root since Vercel already routes /api/todos to this function
// The router internally handles paths like /, /:id, /:id/complete, etc.
app.use('/', todoRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[API/TODOS] Error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  console.log('[API/TODOS] 404 - Route not found:', req.method, req.url, req.path);
  res.status(404).json({ error: 'Route not found', path: req.path, url: req.url });
});

console.log('[API/TODOS] Express app configured, exporting...');

// Export as Vercel serverless function
module.exports = app;

