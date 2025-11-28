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
  console.log('[API/TODOS] Request received:', req.method, req.url, req.path, 'Original path:', req.originalUrl);
  next();
});

// Strip /api/todos prefix from the path so the router sees paths like /, /:id, etc.
app.use((req, res, next) => {
  const originalUrl = req.url;
  const originalPath = req.path;
  
  // If the path or URL starts with /api/todos, strip it
  if ((req.path && req.path.startsWith('/api/todos')) || (req.url && req.url.startsWith('/api/todos'))) {
    // Extract query string if present
    const queryString = originalUrl.includes('?') ? originalUrl.substring(originalUrl.indexOf('?')) : '';
    
    // Remove /api/todos from the path
    let newPath = originalPath ? originalPath.replace('/api/todos', '') : '/';
    if (!newPath || newPath === '') {
      newPath = '/';
    }
    
    // Construct new URL with path and query string
    const newUrl = newPath + queryString;
    
    req.url = newUrl;
    // Manually set path since Express might not recalculate it correctly
    Object.defineProperty(req, 'path', {
      value: newPath,
      writable: true,
      configurable: true
    });
    
    console.log('[API/TODOS] Rewritten path:', req.method, 'Original:', originalPath, 'New:', newPath, 'URL:', newUrl);
  }
  next();
});

// Mount the todos router at root since we've stripped the /api/todos prefix
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

