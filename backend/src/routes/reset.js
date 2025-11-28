const express = require('express');
const router = express.Router();
const { resetAll, resetTodos, resetTodoTypes } = require('../utils/resetData');

// Only allow reset in development mode or with a secret key
const isDevelopment = process.env.NODE_ENV !== 'production';
const RESET_SECRET = process.env.RESET_SECRET || 'dev-reset-secret';
const ENABLE_RESET = process.env.ENABLE_RESET === 'true';

// Reset all data to defaults
router.post('/', async (req, res, next) => {
  try {
    // Check for secret key in production (commented out for easy testing when ENABLE_RESET=true)
    // if (!isDevelopment && !ENABLE_RESET) {
    //   const providedSecret = req.headers['x-reset-secret'] || req.body.secret;
    //   if (providedSecret !== RESET_SECRET) {
    //     return res.status(403).json({ 
    //       error: 'Reset not allowed. Provide valid secret key in x-reset-secret header or body.secret' 
    //     });
    //   }
    // }

    await resetAll();
    
    res.json({
      success: true,
      message: 'All data reset to defaults',
      timestamp: new Date()
    });
  } catch (error) {
    next(error);
  }
});

// Reset only todos
router.post('/todos', async (req, res, next) => {
  try {
    // Secret check commented out for easy testing when ENABLE_RESET=true
    // if (!isDevelopment && !ENABLE_RESET) {
    //   const providedSecret = req.headers['x-reset-secret'] || req.body.secret;
    //   if (providedSecret !== RESET_SECRET) {
    //     return res.status(403).json({ error: 'Reset not allowed' });
    //   }
    // }

    await resetTodos();
    
    res.json({
      success: true,
      message: 'Todos reset to defaults',
      timestamp: new Date()
    });
  } catch (error) {
    next(error);
  }
});

// Reset only todo types
router.post('/todo-types', async (req, res, next) => {
  try {
    // Secret check commented out for easy testing when ENABLE_RESET=true
    // if (!isDevelopment && !ENABLE_RESET) {
    //   const providedSecret = req.headers['x-reset-secret'] || req.body.secret;
    //   if (providedSecret !== RESET_SECRET) {
    //     return res.status(403).json({ error: 'Reset not allowed' });
    //   }
    // }

    await resetTodoTypes();
    
    res.json({
      success: true,
      message: 'Todo types reset to defaults',
      timestamp: new Date()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

