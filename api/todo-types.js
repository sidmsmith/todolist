// Vercel serverless function for /api/todo-types routes
const express = require('express');
const cors = require('cors');
const todoTypeRoutes = require('../backend/src/routes/todoTypes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount the todo-types router at /api/todo-types
app.use('/api/todo-types', todoTypeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error'
  });
});

// Export as Vercel serverless function
module.exports = app;

