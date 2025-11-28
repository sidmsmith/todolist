// Vercel serverless function for /api/todo-types routes
console.log('[API/TODO-TYPES] Serverless function loading...');

const express = require('express');
const cors = require('cors');

console.log('[API/TODO-TYPES] Express and CORS loaded');

let todoTypeRoutes;
try {
  console.log('[API/TODO-TYPES] Attempting to load todo-types routes from ../../backend/src/routes/todoTypes');
  todoTypeRoutes = require('../../backend/src/routes/todoTypes');
  console.log('[API/TODO-TYPES] Todo-types routes loaded successfully');
} catch (error) {
  console.error('[API/TODO-TYPES] Failed to load todo-types routes:', error);
  console.error('[API/TODO-TYPES] Error stack:', error.stack);
  // Return error handler if routes can't be loaded
  module.exports = (req, res) => {
    console.log('[API/TODO-TYPES] Error handler called for request:', req.method, req.url);
    res.status(500).json({ 
      error: 'Failed to load todo-types routes',
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
  console.log('[API/TODO-TYPES] Request received:', req.method, req.url, req.path, 'Original path:', req.originalUrl);
  next();
});

// Strip /api/todo-types prefix from the path so the router sees paths like /, /:id, etc.
app.use((req, res, next) => {
  // If the path starts with /api/todo-types, strip it
  if (req.path && req.path.startsWith('/api/todo-types')) {
    const newPath = req.path.replace('/api/todo-types', '') || '/';
    const newUrl = req.url ? req.url.replace('/api/todo-types', '') || '/' : newPath;
    req.url = newUrl;
    req.path = newPath;
    console.log('[API/TODO-TYPES] Rewritten path:', req.method, req.url, req.path);
  } else if (req.path === '/api/todo-types' || req.url === '/api/todo-types') {
    // Handle exact match
    req.url = '/';
    req.path = '/';
    console.log('[API/TODO-TYPES] Rewritten exact path to root');
  }
  next();
});

// Mount the todo-types router at root since we've stripped the /api/todo-types prefix
// The router internally handles paths like /, /:id, etc.
app.use('/', todoTypeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[API/TODO-TYPES] Error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  console.log('[API/TODO-TYPES] 404 - Route not found:', req.method, req.url, req.path);
  res.status(404).json({ error: 'Route not found', path: req.path, url: req.url });
});

console.log('[API/TODO-TYPES] Express app configured, exporting...');

// Export as Vercel serverless function
module.exports = app;

