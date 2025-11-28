# Testing Guide - To-Do List

This guide explains how to test the todo app, reset data, and repeat tests with fresh data.

## Quick Start Testing

### 1. Start the Application

```bash
# From the todolist directory
npm run dev
```

This starts both:
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`

### 2. Reset Data Before Testing

Before starting each test session, reset the data to defaults:

**Option A: Using the API (Recommended)**
```bash
# Open your browser console or use curl
# In browser console on http://localhost:3000:
fetch('http://localhost:5000/api/reset', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);
```

**Option B: Using the Command Line Script**
```bash
# From the todolist directory
cd backend
node reset-data.js
```

**Option C: Using npm script** (if added to package.json)
```bash
npm run reset
```

### 3. Test the Application

1. Open `http://localhost:3000` in your browser
2. Click the clipboard badge (📋) in the top-right corner
3. Try the following actions:
   - **Complete a todo**: Click "✓ Complete" on any scheduled todo
   - **Snooze a todo**: Click "⏱️ Snooze ▼" and select a duration
   - **Dismiss a todo**: Click "✕ Dismiss" and select a reason
   - **View details**: Click "View details →" on dynamic todos

### 4. Verify Changes

After making changes, you can verify them:

**Check the JSON file directly:**
```bash
# View current todos
cat backend/src/data/todo.json

# Or open in your editor
code backend/src/data/todo.json
```

**Check via API:**
```bash
# Get all todos
curl http://localhost:5000/api/todos

# Get badge count (count Open todos)
curl http://localhost:5000/api/todos | jq '.data | length'
```

## Data Storage

### Where Data is Stored

- **Active Data**: `backend/src/data/todo.json` (gets modified when you interact)
- **Seed Data (Defaults)**: `backend/src/data/seeds/todo.json` (never modified)
- **Todo Types**: `backend/src/data/todotype.json` (rarely changes)

### What Happens When You Interact

When you complete, snooze, or dismiss a todo:
1. The app calls the backend API (`/api/todos/:id/complete`, etc.)
2. The backend updates `backend/src/data/todo.json`
3. The file is **permanently modified** (not restored automatically)
4. Completed/dismissed todos won't show up in the list
5. Snoozed todos will reappear after the snooze time expires

## Repeated Testing Workflow

### Recommended Workflow

1. **Start fresh** - Reset data before each test session
2. **Test features** - Interact with todos, try different actions
3. **Verify changes** - Check that JSON files updated correctly
4. **Reset again** - Reset before next test session

### Example Test Session

```bash
# 1. Reset to defaults
cd backend
node reset-data.js

# 2. Start the app (in another terminal)
cd ..
npm run dev

# 3. Test in browser at http://localhost:3000
# - Complete some todos
# - Snooze some todos
# - Dismiss some todos

# 4. Check what changed
cat backend/src/data/todo.json

# 5. Reset again for next test
cd backend
node reset-data.js
```

## Reset Options

### Via API Endpoint

**Reset all data:**
```bash
curl -X POST http://localhost:5000/api/reset
```

**Reset only todos:**
```bash
curl -X POST http://localhost:5000/api/reset/todos
```

**Reset only todo types:**
```bash
curl -X POST http://localhost:5000/api/reset/todo-types
```

### Via Command Line

```bash
# Reset everything
cd backend
node reset-data.js all

# Reset only todos
node reset-data.js todos

# Reset only types
node reset-data.js types
```

### Via Browser Console

```javascript
// Reset all data
fetch('http://localhost:5000/api/reset', { method: 'POST' })
  .then(r => r.json())
  .then(data => {
    console.log('Reset result:', data);
    // Refresh the page to see changes
    window.location.reload();
  });

// Check current todos
fetch('http://localhost:5000/api/todos')
  .then(r => r.json())
  .then(data => console.log('Current todos:', data));
```

## Understanding the Data

### Todo Statuses

- **Open**: Visible in the list, not completed/snoozed/dismissed
- **Snoozed**: Hidden until `snoozedUntil` time passes, then becomes Open
- **Completed**: Hidden from list, has `completedAt` timestamp
- **Dismissed**: Hidden from list, has `dismissedAt` timestamp

### What the Reset Does

The reset script:
1. Copies seed data from `seeds/todo.json` to `todo.json`
2. Resets all statuses to "Open" (except originally snoozed items)
3. Updates dates to be relative to "now" for better testing
4. Removes `completedAt`, `dismissedAt` fields
5. Keeps snooze times relative to current time

## Monitoring Changes

### Watch the JSON file

On Windows (PowerShell):
```powershell
# Watch for file changes
Get-Content backend\src\data\todo.json -Wait
```

On Mac/Linux:
```bash
# Watch for file changes
watch -n 1 cat backend/src/data/todo.json
```

### Check API responses

Monitor API calls in browser DevTools:
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "todos"
4. See all API requests/responses in real-time

## Troubleshooting

### Data not resetting?

1. Make sure the backend server is running
2. Check that `backend/src/data/seeds/todo.json` exists
3. Verify you have write permissions to `backend/src/data/`

### Todos not showing up?

1. Check if todos are in "Completed" or "Dismissed" status
2. Verify the badge count (only "Open" todos count)
3. Check browser console for errors
4. Verify API is responding: `curl http://localhost:5000/api/todos`

### Reset not working?

1. Stop the backend server
2. Manually copy seed file: `copy backend\src\data\seeds\todo.json backend\src\data\todo.json`
3. Restart the backend server

## Best Practices

1. **Always reset before testing** - Start with known state
2. **Reset after major changes** - Clean slate for next feature test
3. **Keep seed data pristine** - Don't modify `seeds/todo.json`
4. **Test one feature at a time** - Easier to verify changes
5. **Check JSON after actions** - Understand what's being saved

## Production Considerations

⚠️ **Important**: The reset endpoint is disabled in production by default.

In production:
- Reset endpoint requires a secret key
- Set `RESET_SECRET` environment variable
- Use header: `x-reset-secret: your-secret-key`
- Or enable with: `ENABLE_RESET=true` in environment

Example production reset:
```bash
curl -X POST http://your-api.com/api/reset \
  -H "x-reset-secret: your-production-secret"
```

