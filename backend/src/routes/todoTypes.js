const express = require('express');
const router = express.Router();
const { readTodoTypes, writeTodoTypes } = require('../utils/fileStorage');

// Get all todo types
router.get('/', async (req, res, next) => {
  try {
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

// Get todo type by ID
router.get('/:id', async (req, res, next) => {
  try {
    const todoTypes = await readTodoTypes();
    const todoType = todoTypes.find(t => t.id === req.params.id);
    
    if (!todoType) {
      return res.status(404).json({ error: 'Todo type not found' });
    }

    res.json(todoType);
  } catch (error) {
    next(error);
  }
});

// Create a new todo type
router.post('/', async (req, res, next) => {
  try {
    const { id, name, priority, completionMethod, completionFields, dismissalCodes, completionCodes, notes } = req.body;

    // Validation
    if (!id || !name) {
      return res.status(400).json({ error: 'id and name are required' });
    }

    if (priority !== undefined && (priority < 1 || priority > 4)) {
      return res.status(400).json({ error: 'priority must be between 1 and 4' });
    }

    const validCompletionMethods = ['auto', 'modal', 'dropdown', 'none'];
    if (completionMethod && !validCompletionMethods.includes(completionMethod)) {
      return res.status(400).json({ error: `completionMethod must be one of: ${validCompletionMethods.join(', ')}` });
    }

    const todoTypes = await readTodoTypes();

    // Check if ID already exists
    if (todoTypes.find(t => t.id === id)) {
      return res.status(400).json({ error: 'Todo type with this id already exists' });
    }

    // Create new todo type
    const newTodoType = {
      id,
      name,
      priority: priority || 3,
      completionMethod: completionMethod || 'auto',
      completionFields: completionFields || [],
      dismissalCodes: dismissalCodes || [],
      ...(completionCodes && { completionCodes }),
      ...(notes && { notes })
    };

    todoTypes.push(newTodoType);
    await writeTodoTypes(todoTypes);

    res.status(201).json({
      message: 'Todo type created',
      todoType: newTodoType
    });
  } catch (error) {
    next(error);
  }
});

// Update a todo type
router.put('/:id', async (req, res, next) => {
  try {
    const { name, priority, completionMethod, completionFields, dismissalCodes, completionCodes, notes } = req.body;

    const todoTypes = await readTodoTypes();
    const todoTypeIndex = todoTypes.findIndex(t => t.id === req.params.id);

    if (todoTypeIndex === -1) {
      return res.status(404).json({ error: 'Todo type not found' });
    }

    // Validation
    if (priority !== undefined && (priority < 1 || priority > 4)) {
      return res.status(400).json({ error: 'priority must be between 1 and 4' });
    }

    const validCompletionMethods = ['auto', 'modal', 'dropdown', 'none'];
    if (completionMethod && !validCompletionMethods.includes(completionMethod)) {
      return res.status(400).json({ error: `completionMethod must be one of: ${validCompletionMethods.join(', ')}` });
    }

    // Update todo type
    const updatedTodoType = {
      ...todoTypes[todoTypeIndex],
      ...(name !== undefined && { name }),
      ...(priority !== undefined && { priority }),
      ...(completionMethod !== undefined && { completionMethod }),
      ...(completionFields !== undefined && { completionFields }),
      ...(dismissalCodes !== undefined && { dismissalCodes }),
      ...(completionCodes !== undefined && { completionCodes }),
      ...(notes !== undefined && { notes })
    };

    todoTypes[todoTypeIndex] = updatedTodoType;
    await writeTodoTypes(todoTypes);

    res.json({
      message: 'Todo type updated',
      todoType: updatedTodoType
    });
  } catch (error) {
    next(error);
  }
});

// Delete a todo type
router.delete('/:id', async (req, res, next) => {
  try {
    const todoTypes = await readTodoTypes();
    const todoTypeIndex = todoTypes.findIndex(t => t.id === req.params.id);

    if (todoTypeIndex === -1) {
      return res.status(404).json({ error: 'Todo type not found' });
    }

    todoTypes.splice(todoTypeIndex, 1);
    await writeTodoTypes(todoTypes);

    res.json({
      message: 'Todo type deleted'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

