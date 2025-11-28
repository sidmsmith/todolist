const fs = require('fs').promises;
const path = require('path');

// In Vercel, use /tmp for writes (read-only filesystem except /tmp)
// In local dev, use the project data directory
const IS_VERCEL = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
const DATA_DIR = IS_VERCEL ? '/tmp/todo-data' : path.join(__dirname, '../data');
const SOURCE_DATA_DIR = path.join(__dirname, '../data'); // Always read from source
const SEEDS_DIR = path.join(SOURCE_DATA_DIR, 'seeds'); // Seeds are always in source

// Ensure data directory exists (for /tmp in Vercel)
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
}

/**
 * Reset todo.json to default seed data
 */
async function resetTodos() {
  try {
    await ensureDataDir();
    const seedPath = path.join(SEEDS_DIR, 'todo.json');
    const targetPath = path.join(DATA_DIR, 'todo.json');
    
    // Read seed file
    const seedData = await fs.readFile(seedPath, 'utf-8');
    const todos = JSON.parse(seedData);
    
    // Update dates to be relative to now for better testing
    const now = new Date();
    const todosWithFreshDates = todos.map(todo => {
      const todoCopy = { ...todo };
      
    // Reset status to Open (unless it was originally Snoozed)
    if (todoCopy.status === 'Completed' || todoCopy.status === 'Dismissed') {
      todoCopy.status = 'Open';
      delete todoCopy.completedAt;
      delete todoCopy.completedBy;
      delete todoCopy.dismissedAt;
      delete todoCopy.dismissedBy;
      delete todoCopy.dismissalReason;
      delete todoCopy.completionData;
    }
    
    // Update dates to be relative to now for consistent testing
    // Keep relative time differences, but shift base to now
    const createdAt = new Date(todo.createdAt);
    const dueTime = new Date(todo.dueTime);
    const timeUntilDue = dueTime - createdAt;
    
    // Set creation time to 2 hours ago, then calculate due time
    const baseTime = new Date(now - 2 * 60 * 60 * 1000); // Created 2 hours ago
    todoCopy.createdAt = baseTime.toISOString();
    todoCopy.dueTime = new Date(baseTime.getTime() + timeUntilDue).toISOString();
    
    // Handle snoozes array (new format)
    if (todoCopy.status === 'Snoozed' && Array.isArray(todoCopy.snoozes) && todoCopy.snoozes.length > 0) {
      // Update snooze times relative to new base time
      todoCopy.snoozes = todoCopy.snoozes.map(snooze => {
        const snoozeTime = new Date(snooze.snoozedUntil);
        const snoozeOffset = snoozeTime - createdAt;
        return {
          ...snooze,
          snoozedUntil: new Date(baseTime.getTime() + snoozeOffset).toISOString(),
          snoozedAt: new Date(baseTime.getTime() + (snoozeOffset - 15 * 60 * 1000)).toISOString() // 15 min before snoozedUntil
        };
      });
    } else if (todoCopy.status === 'Snoozed') {
      // If snoozed but no valid snoozes array, remove snooze status
      todoCopy.status = 'Open';
      delete todoCopy.snoozes;
    } else {
      // Ensure snoozes array exists (empty) for non-snoozed todos
      todoCopy.snoozes = [];
    }
    
    // Clean up old snoozedUntil field if it exists (migration)
    if (todoCopy.snoozedUntil) {
      delete todoCopy.snoozedUntil;
    }
      
      return todoCopy;
    });
    
    // Write to target file
    await fs.writeFile(targetPath, JSON.stringify(todosWithFreshDates, null, 2), 'utf-8');
    
    console.log(`✓ Reset ${todosWithFreshDates.length} todos to seed data`);
    return todosWithFreshDates;
  } catch (err) {
    console.error('Error resetting todos:', err);
    throw err;
  }
}

/**
 * Reset todo types (usually doesn't change, but included for completeness)
 */
async function resetTodoTypes() {
  try {
    await ensureDataDir();
    const seedPath = path.join(SEEDS_DIR, 'todotype.json');
    const targetPath = path.join(DATA_DIR, 'todotype.json');
    
    const seedData = await fs.readFile(seedPath, 'utf-8');
    await fs.writeFile(targetPath, seedData, 'utf-8');
    
    console.log('✓ Reset todo types to seed data');
    return JSON.parse(seedData);
  } catch (err) {
    console.error('Error resetting todo types:', err);
    throw err;
  }
}

/**
 * Reset all data to defaults
 */
async function resetAll() {
  await resetTodoTypes();
  await resetTodos();
  console.log('✓ All data reset to defaults');
}

module.exports = {
  resetTodos,
  resetTodoTypes,
  resetAll
};

