// Vercel serverless function for /api/reset routes
console.log('[API/RESET] Serverless function loading...');

const express = require('express');
const cors = require('cors');

console.log('[API/RESET] Express and CORS loaded');

let resetRoutes;
try {
  console.log('[API/RESET] Attempting to load reset routes from ../../backend/src/routes/reset');
  resetRoutes = require('../../backend/src/routes/reset');
  console.log('[API/RESET] Reset routes loaded successfully');
} catch (error) {
  console.error('[API/RESET] Failed to load reset routes:', error);
  console.error('[API/RESET] Error stack:', error.stack);
  // Return error handler if routes can't be loaded
  module.exports = (req, res) => {
    console.log('[API/RESET] Error handler called for request:', req.method, req.url);
    res.status(500).json({ 
      error: 'Failed to load reset routes',
      details: error.message,
      stack: error.stack
    });
  };
  return;
}

const app = express();

// CORS middleware
app.use(cors());

// Body parser middleware
app.use(express.json());

console.log('[API/RESET] Middleware configured');

// Path rewriting middleware - strip /api/reset prefix
app.use((req, res, next) => {
  const originalUrl = req.url || '';
  const originalPath = req.path || '';
  
  console.log('[API/RESET] Path rewrite middleware - Original URL:', originalUrl, 'Path:', originalPath, 'Method:', req.method);
  
  // Always strip /api/reset since this function only handles /api/reset routes
  // Extract query string if present
  const urlWithoutQuery = originalUrl.includes('?') ? originalUrl.substring(0, originalUrl.indexOf('?')) : originalUrl;
  const queryString = originalUrl.includes('?') ? originalUrl.substring(originalUrl.indexOf('?')) : '';
  
  // Remove /api/reset from the path (handles both /api/reset and /api/reset/...)
  let newPath = originalPath ? originalPath.replace(/^\/api\/reset/, '') : urlWithoutQuery.replace(/^\/api\/reset/, '');
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
  
  console.log('[API/RESET] Rewritten path:', req.method, 'Original:', originalPath, 'New:', newPath, 'URL:', newUrl);
  next();
});

// Mount the reset router at root since we've stripped the /api/reset prefix
app.use('/', resetRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[API/RESET] Error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  console.log('[API/RESET] 404 - Route not found:', req.method, req.url);
  res.status(404).json({ error: 'Route not found' });
});

console.log('[API/RESET] Serverless function ready');

// Export as Vercel serverless function
module.exports = app;

