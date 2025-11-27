#!/usr/bin/env node

/**
 * Command-line script to reset todo data to defaults
 * Usage: node reset-data.js [todos|types|all]
 */

const { resetAll, resetTodos, resetTodoTypes } = require('./src/utils/resetData');

const command = process.argv[2] || 'all';

async function main() {
  try {
    console.log('🔄 Resetting data...\n');
    
    switch (command) {
      case 'todos':
        await resetTodos();
        break;
      case 'types':
        await resetTodoTypes();
        break;
      case 'all':
        await resetAll();
        break;
      default:
        console.error(`Unknown command: ${command}`);
        console.log('Usage: node reset-data.js [todos|types|all]');
        process.exit(1);
    }
    
    console.log('\n✓ Reset complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  }
}

main();

