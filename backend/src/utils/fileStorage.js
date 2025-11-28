const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// In Vercel, use /tmp for writes (read-only filesystem except /tmp)
// In local dev, use the project data directory
const IS_VERCEL = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
const DATA_DIR = IS_VERCEL ? '/tmp/todo-data' : path.join(__dirname, '../data');
const SOURCE_DATA_DIR = path.join(__dirname, '../data'); // Always read from source

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
}

// Read JSON file
// In Vercel: Try /tmp first (for writes), then fall back to source
// In local: Read from data directory
async function readFile(filename) {
  try {
    // First try the writable location (for Vercel, this is /tmp)
    const writablePath = path.join(DATA_DIR, filename);
    try {
      const data = await fs.readFile(writablePath, 'utf-8');
      return JSON.parse(data);
    } catch (tmpErr) {
      // If not found in writable location and we're in Vercel, try source
      if (IS_VERCEL && tmpErr.code === 'ENOENT') {
        const sourcePath = path.join(SOURCE_DATA_DIR, filename);
        const data = await fs.readFile(sourcePath, 'utf-8');
        return JSON.parse(data);
      }
      throw tmpErr;
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.warn(`File not found: ${filename}`);
      return [];
    }
    throw err;
  }
}

// Write JSON file
async function writeFile(filename, data) {
  try {
    await ensureDataDir();
    const filePath = path.join(DATA_DIR, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing file ${filename}:`, err);
    throw err;
  }
}

// Read todo types
async function readTodoTypes() {
  return await readFile('todotype.json');
}

// Read todos
async function readTodos() {
  return await readFile('todo.json');
}

// Write todos
async function writeTodos(todos) {
  return await writeFile('todo.json', todos);
}

// Write todo types
async function writeTodoTypes(todoTypes) {
  return await writeFile('todotype.json', todoTypes);
}

module.exports = {
  readFile,
  writeFile,
  readTodoTypes,
  readTodos,
  writeTodos,
  writeTodoTypes
};