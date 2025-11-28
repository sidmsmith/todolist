const express = require('express');
const router = express.Router();
const { readTodos, readTodoTypes, writeTodos } = require('../utils/fileStorage');

// Get all todos (filtered and sorted)
router.get('/', async (req, res, next) => {
  try {
    const todos = await readTodos();
    const todoTypes = await readTodoTypes();

    // Filter: only Open or Snoozed (not Dismissed or Completed)
    const activeTodos = todos.filter(todo => 
      todo.status === 'Open' || todo.status === 'Snoozed'
    );

    // Check if snoozed todos should revert to Open
    const now = new Date();
    const processedTodos = activeTodos. map(todo => {
      if (todo.status === 'Snoozed' && todo.snoozedUntil) {
        const snoozeTime = new Date(todo.snoozedUntil);
        if (now >= snoozeTime) {
          todo.status = 'Open';
          delete todo.snoozedUntil;
        }
      }
      return todo;
    });

    // Save if any todos were reverted from Snoozed to Open
    const hasChanges = processedTodos.some((todo, idx) => 
      JSON.stringify(todo) !== JSON. stringify(activeTodos[idx])
    );
    if (hasChanges) {
      const allTodos = todos.map(t => 
        processedTodos.find(pt => pt.id === t.id) || t
      );
      await writeTodos(allTodos);
    }

    // Enrich todos with type info
    const enrichedTodos = processedTodos.map(todo => {
      const todoType = todoTypes.find(t => t.id === todo.typeId);
      return {
        ...todo,
        type: todoType
      };
    });

    // Sort by priority (lower number = higher priority)
    // Critical (1) always at top, then by priority, then by due time
    enrichedTodos.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return new Date(a.dueTime) - new Date(b.dueTime);
    });

    res.json({
      timestamp: new Date(),
      count: enrichedTodos.length,
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
      ... todo,
      type: todoType
    });
  } catch (error) {
    next(error);
  }
});

// Complete a todo
router.put('/:id/complete', async (req, res, next) => {
  try {
    const { completionData } = req.body;
    const todos = await readTodos();
    const todoIndex = todos.findIndex(t => t.id === req.params.id);

    if (todoIndex === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    todos[todoIndex].status = 'Completed';
    todos[todoIndex].completedAt = new Date();
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

// Snooze a todo
router.put('/:id/snooze', async (req, res, next) => {
  try {
    const { minutes } = req.body;

    if (! minutes || typeof minutes !== 'number') {
      return res.status(400).json({ error: 'Valid minutes required' });
    }

    const todos = await readTodos();
    const todoIndex = todos. findIndex(t => t.id === req.params.id);

    if (todoIndex === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const snoozeUntil = new Date(Date. now() + minutes * 60 * 1000);
    todos[todoIndex].status = 'Snoozed';
    todos[todoIndex]. snoozedUntil = snoozeUntil;

    await writeTodos(todos);

    res.json({
      message: `Todo snoozed until ${snoozeUntil}`,
      todo: todos[todoIndex]
    });
  } catch (error) {
    next(error);
  }
});

// Dismiss a todo
router.put('/:id/dismiss', async (req, res, next) => {
  try {
    const { dismissalReason } = req.body;

    const todos = await readTodos();
    const todoIndex = todos.findIndex(t => t.id === req.params.id);

    if (todoIndex === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    todos[todoIndex].status = 'Dismissed';
    todos[todoIndex].dismissedAt = new Date();
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
    const filteredTodos = todos.filter(t => t.id !== req. params.id);

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