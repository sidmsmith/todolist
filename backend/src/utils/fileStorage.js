const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
}

// Read JSON file
async function readFile(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
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