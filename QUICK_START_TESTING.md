# Quick Start Testing Guide

## The Problem You Asked About

**Q: Will clicking on things update JSON files and run out of data?**

**A: Yes, but we've solved this!** ✅

- When you complete/snooze/dismiss todos, they **DO** update `backend/src/data/todo.json`
- Completed/dismissed todos disappear and won't come back
- **BUT** we've added a reset feature so you can restore defaults anytime!

## Quick Answer: How to Test Repeatedly

### Option 1: Reset via Command Line (Easiest)

```bash
# From the todolist directory
npm run reset
```

This restores all 10 default todos with fresh dates.

### Option 2: Reset via Browser Console

1. Open `http://localhost:3000` in your browser
2. Open DevTools (F12)
3. Go to Console tab
4. Run:
```javascript
fetch('http://localhost:5000/api/reset', { method: 'POST' })
  .then(r => r.json())
  .then(data => {
    console.log('Reset complete!', data);
    window.location.reload(); // Refresh the page
  });
```

### Option 3: Reset via API Call

```bash
curl -X POST http://localhost:5000/api/reset
```

## Testing Workflow

### Step 1: Reset Before Testing
```bash
npm run reset
```

### Step 2: Start the App
```bash
npm run dev
```

### Step 3: Test the App
- Open `http://localhost:3000`
- Click the clipboard badge (📋)
- Try completing, snoozing, dismissing todos

### Step 4: Reset Again for Next Test
```bash
npm run reset
```

## What Gets Reset?

✅ **Resets:**
- All todos restored to original 10 items
- All statuses set to "Open" (except originally snoozed)
- Dates updated to be relative to "now"
- Removes completion/dismissal timestamps

❌ **Never Changes:**
- `backend/src/data/seeds/todo.json` (the backup/template)
- `backend/src/data/seeds/todotype.json` (the backup/template)

## How Data Works

### Files That Change (During Testing)
- `backend/src/data/todo.json` ← Gets modified when you interact

### Files That Never Change (Backups)
- `backend/src/data/seeds/todo.json` ← Reset copies from here
- `backend/src/data/seeds/todotype.json` ← Reset copies from here

### What Happens
1. **Reset** = Copy from `seeds/` to `data/` + update dates
2. **Interact** = Modify `data/todo.json` directly
3. **Reset again** = Copy from `seeds/` again (fresh start!)

## Viewing Changes

### Check JSON File
```bash
# View current todos
cat backend/src/data/todo.json

# Or open in editor
code backend/src/data/todo.json
```

### Check via API
```bash
# Get all todos
curl http://localhost:5000/api/todos

# Get count
curl http://localhost:5000/api/todos | grep -o '"count":[0-9]*'
```

## No Manual Backup Needed! 🎉

You **don't need** to:
- ❌ Manually backup `todo.json` before testing
- ❌ Manually restore it after testing
- ❌ Worry about running out of data

Just run `npm run reset` anytime you want fresh data!

## Full Testing Guide

For detailed testing instructions, see [TESTING.md](./TESTING.md)

