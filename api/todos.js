// Vercel serverless function for /api/todos routes
const express = require('express');
const cors = require('cors');
const todoRoutes = require('../backend/src/routes/todos');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount the todos router at /api/todos
app.use('/api/todos', todoRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error'
  });
});

// Export as Vercel serverless function
module.exports = app;

