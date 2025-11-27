const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const SEEDS_DIR = path.join(DATA_DIR, 'seeds');

/**
 * Reset todo.json to default seed data
 */
async function resetTodos() {
  try {
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
        delete todoCopy.dismissedAt;
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
      
      // If it was snoozed, update snoozedUntil too
      if (todoCopy.status === 'Snoozed' && todo.snoozedUntil) {
        const snoozeTime = new Date(todo.snoozedUntil);
        const snoozeOffset = snoozeTime - createdAt;
        todoCopy.snoozedUntil = new Date(baseTime.getTime() + snoozeOffset).toISOString();
      } else if (todoCopy.status === 'Snoozed' && !todo.snoozedUntil) {
        // If snoozed but no snoozedUntil, remove snooze status
        todoCopy.status = 'Open';
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

