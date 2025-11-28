const express = require('express');
const router = express.Router();
const { readTodos, readTodoTypes, writeTodos } = require('../utils/fileStorage');

// Get all todos (filtered and sorted)
router.get('/', async (req, res, next) => {
  try {
    const userId = req.query.userId || req.headers['x-user-id'];
    const includeSnoozed = req.query.includeSnoozed === 'true';
    const includeAll = req.query.includeAll === 'true'; // For ILPN screen - show all todos
    const todos = await readTodos();
    const todoTypes = await readTodoTypes();
    const now = new Date();

    // Filter out Completed and Dismissed todos unless includeAll is true
    const activeTodos = includeAll 
      ? todos 
      : todos.filter(todo => 
          todo.status !== 'Completed' && todo.status !== 'Dismissed'
        );

    // Clean up expired snoozes and migrate old snoozedUntil format
    let hasChanges = false;
    const processedTodos = activeTodos.map(todo => {
      const todoCopy = { ...todo };
      
      // Initialize snoozes array if it doesn't exist
      if (!todoCopy.snoozes) {
        todoCopy.snoozes = [];
      }

      // Migrate old snoozedUntil to snoozes array (if exists and no snoozes yet)
      if (todoCopy.snoozedUntil && todoCopy.snoozes.length === 0) {
        // This is a legacy snooze - we'll remove it since we don't know the userId
        // In production, you might want to handle this differently
        delete todoCopy.snoozedUntil;
        hasChanges = true;
      }

      // Remove expired snoozes
      const initialSnoozeCount = todoCopy.snoozes.length;
      todoCopy.snoozes = todoCopy.snoozes.filter(snooze => {
        const snoozeTime = new Date(snooze.snoozedUntil);
        return now < snoozeTime; // Keep only active snoozes
      });
      
      if (todoCopy.snoozes.length !== initialSnoozeCount) {
        hasChanges = true;
      }

      // Remove snoozedUntil if empty snoozes array
      if (todoCopy.snoozes.length === 0 && todoCopy.snoozedUntil) {
        delete todoCopy.snoozedUntil;
        hasChanges = true;
      }

      return todoCopy;
    });

    // Save if any changes were made
    if (hasChanges) {
      const allTodos = todos.map(t => {
        const processed = processedTodos.find(pt => pt.id === t.id);
        return processed || t;
      });
      await writeTodos(allTodos);
    }

    // Count user's snoozed todos (before filtering)
    let userSnoozedCount = 0;
    let userSnoozedTodos = [];
    if (userId) {
      userSnoozedTodos = processedTodos.filter(todo => {
        const userSnooze = todo.snoozes?.find(s => s.userId === userId);
        if (userSnooze) {
          const snoozeTime = new Date(userSnooze.snoozedUntil);
          if (now < snoozeTime) {
            return true; // This todo is snoozed by user
          }
        }
        return false;
      });
      userSnoozedCount = userSnoozedTodos.length;
    }

    // Filter by user-specific snoozes (if userId provided and not including snoozed)
    // Skip user filtering entirely if includeAll is true
    let userFilteredTodos = processedTodos;
    if (!includeAll) {
      if (userId && !includeSnoozed) {
        userFilteredTodos = processedTodos.filter(todo => {
          // Check if this user has snoozed this todo
          const userSnooze = todo.snoozes?.find(s => s.userId === userId);
          if (userSnooze) {
            const snoozeTime = new Date(userSnooze.snoozedUntil);
            // If snooze is still active, hide this todo from this user
            if (now < snoozeTime) {
              return false; // Hide snoozed todo
            }
          }
          return true; // Show todo
        });
      } else if (userId && includeSnoozed) {
        // Include all non-snoozed todos plus user's snoozed todos
        const nonSnoozedTodos = processedTodos.filter(todo => {
          const userSnooze = todo.snoozes?.find(s => s.userId === userId);
          if (userSnooze) {
            const snoozeTime = new Date(userSnooze.snoozedUntil);
            if (now < snoozeTime) {
              return false; // This is snoozed, will add separately
            }
          }
          return true;
        });
        userFilteredTodos = [...nonSnoozedTodos, ...userSnoozedTodos];
      }
    }

    // Enrich todos with type info and mark snoozed status
    const enrichedTodos = userFilteredTodos.map(todo => {
      const todoType = todoTypes.find(t => t.id === todo.typeId);
      const userSnooze = userId ? todo.snoozes?.find(s => s.userId === userId) : null;
      const isSnoozed = userSnooze && now < new Date(userSnooze.snoozedUntil);
      
      return {
        ...todo,
        type: todoType,
        isSnoozedByUser: isSnoozed || false,
        userSnoozeInfo: isSnoozed ? userSnooze : null
      };
    });

    // Sort by priority (lower number = higher priority)
    // Critical (1) always at top, then by priority, then by due time
    // Snoozed todos should appear after non-snoozed within same priority
    enrichedTodos.sort((a, b) => {
      // First, separate snoozed from non-snoozed
      if (a.isSnoozedByUser !== b.isSnoozedByUser) {
        return a.isSnoozedByUser ? 1 : -1; // Non-snoozed first
      }
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return new Date(a.dueTime) - new Date(b.dueTime);
    });

    res.json({
      timestamp: new Date(),
      count: enrichedTodos.length,
      snoozedCount: userSnoozedCount,
      data: enrichedTodos
    });
  } catch (error) {
    next(error);
  }
});

// Get todo by ID
router.get('/:id', async (req, res, next) => {
  try {
    const todos = await readTodos();
    const todo = todos.find(t => t.id === req.params.id);
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const todoTypes = await readTodoTypes();
    const todoType = todoTypes.find(t => t. id === todo.typeId);

    res.json({
      ...todo,
      type: todoType
    });
  } catch (error) {
    next(error);
  }
});

// Complete a todo
router.put('/:id/complete', async (req, res, next) => {
  try {
    const { completionData, userId } = req.body;
    const todos = await readTodos();
    const todoIndex = todos.findIndex(t => t.id === req.params.id);

    if (todoIndex === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    todos[todoIndex].status = 'Completed';
    todos[todoIndex].completedAt = new Date().toISOString();
    if (userId) {
      todos[todoIndex].completedBy = userId;
    }
    if (completionData) {
      todos[todoIndex].completionData = completionData;
    }

    await writeTodos(todos);

    res.json({
      message: 'Todo completed',
      todo: todos[todoIndex]
    });
  } catch (error) {
    next(error);
  }
});

// Snooze a todo (minutes = 0 means unsnooze/remove snooze)
router.put('/:id/snooze', async (req, res, next) => {
  try {
    const { minutes, userId } = req.body;

    if (minutes === undefined || typeof minutes !== 'number') {
      return res.status(400).json({ error: 'Valid minutes required' });
    }

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId is required' });
    }

    const todos = await readTodos();
    const todoIndex = todos.findIndex(t => t.id === req.params.id);

    if (todoIndex === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    // Don't allow snoozing completed or dismissed todos
    if (todos[todoIndex].status === 'Completed' || todos[todoIndex].status === 'Dismissed') {
      return res.status(400).json({ error: 'Cannot snooze completed or dismissed todos' });
    }

    // Initialize snoozes array if it doesn't exist
    if (!todos[todoIndex].snoozes) {
      todos[todoIndex].snoozes = [];
    }

    // Find existing snooze for this user
    const existingSnoozeIndex = todos[todoIndex].snoozes.findIndex(s => s.userId === userId);

    // If minutes is 0 or negative, remove the snooze (unsnooze)
    if (minutes <= 0) {
      if (existingSnoozeIndex >= 0) {
        todos[todoIndex].snoozes.splice(existingSnoozeIndex, 1);
      }
      
      // Clean up empty snoozes array
      if (todos[todoIndex].snoozes.length === 0) {
        delete todos[todoIndex].snoozes;
      }
      
      // Remove old snoozedUntil field if it exists (migration)
      if (todos[todoIndex].snoozedUntil) {
        delete todos[todoIndex].snoozedUntil;
      }

      await writeTodos(todos);

      return res.json({
        message: 'Todo unsnoozed',
        todo: todos[todoIndex]
      });
    }

    // Otherwise, add or update snooze
    const snoozeUntil = new Date(Date.now() + minutes * 60 * 1000);
    const snoozedAt = new Date();

    if (existingSnoozeIndex >= 0) {
      // Update existing snooze
      todos[todoIndex].snoozes[existingSnoozeIndex] = {
        userId,
        snoozedUntil: snoozeUntil.toISOString(),
        snoozedAt: snoozedAt.toISOString()
      };
    } else {
      // Add new snooze
      todos[todoIndex].snoozes.push({
        userId,
        snoozedUntil: snoozeUntil.toISOString(),
        snoozedAt: snoozedAt.toISOString()
      });
    }

    // Remove old snoozedUntil field if it exists (migration)
    if (todos[todoIndex].snoozedUntil) {
      delete todos[todoIndex].snoozedUntil;
    }

    await writeTodos(todos);

    res.json({
      message: `Todo snoozed until ${snoozeUntil.toISOString()}`,
      todo: todos[todoIndex]
    });
  } catch (error) {
    next(error);
  }
});

// Dismiss a todo
router.put('/:id/dismiss', async (req, res, next) => {
  try {
    const { dismissalReason, userId } = req.body;

    const todos = await readTodos();
    const todoIndex = todos.findIndex(t => t.id === req.params.id);

    if (todoIndex === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    todos[todoIndex].status = 'Dismissed';
    todos[todoIndex].dismissedAt = new Date().toISOString();
    if (userId) {
      todos[todoIndex].dismissedBy = userId;
    }
    if (dismissalReason) {
      todos[todoIndex].dismissalReason = dismissalReason;
    }

    await writeTodos(todos);

    res.json({
      message: 'Todo dismissed',
      todo: todos[todoIndex]
    });
  } catch (error) {
    next(error);
  }
});

// Create or update a todo (for manual management)
router.post('/', async (req, res, next) => {
  try {
    const newTodo = req.body;

    if (!newTodo.id || !newTodo.typeId || !newTodo.title) {
      return res.status(400).json({ 
        error: 'Missing required fields: id, typeId, title' 
      });
    }

    const todos = await readTodos();
    const existingIndex = todos.findIndex(t => t.id === newTodo.id);

    if (existingIndex !== -1) {
      // Update existing
      todos[existingIndex] = { ...todos[existingIndex], ... newTodo };
    } else {
      // Create new
      newTodo.status = newTodo.status || 'Open';
      newTodo.createdAt = newTodo.createdAt || new Date();
      todos.push(newTodo);
    }

    await writeTodos(todos);

    res.json({
      message: existingIndex !== -1 ? 'Todo updated' : 'Todo created',
      todo: todos[existingIndex !== -1 ? existingIndex : todos.length - 1]
    });
  } catch (error) {
    next(error);
  }
});

// Delete a todo
router.delete('/:id', async (req, res, next) => {
  try {
    const todos = await readTodos();
    const filteredTodos = todos.filter(t => t.id !== req.params.id);

    if (filteredTodos.length === todos.length) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    await writeTodos(filteredTodos);

    res.json({ message: 'Todo deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;