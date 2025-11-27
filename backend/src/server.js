const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const todoRoutes = require('./routes/todos');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/todos', todoRoutes);

// Reset routes (only for development/testing)
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_RESET === 'true') {
  const resetRoutes = require('./routes/reset');
  app.use('/api/reset', resetRoutes);
  console.log('🔄 Reset endpoint available at: POST /api/reset');
}

// Get todo types
app.get('/api/todo-types', async (req, res, next) => {
  try {
    const { readTodoTypes } = require('./utils/fileStorage');
    const todoTypes = await readTodoTypes();
    res.json({
      timestamp: new Date(),
      count: todoTypes.length,
      data: todoTypes
    });
  } catch (error) {
    next(error);
  }
});

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

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 API Base: http://localhost:${PORT}/api/todos`);
});