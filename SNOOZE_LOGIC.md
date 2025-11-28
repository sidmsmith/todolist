# Snooze Logic Documentation

## Overview

The snooze feature allows users to temporarily hide todos from the active list. Snoozed todos automatically reappear when the snooze time expires.

## How It Works

### 1. **Snoozing a Todo (Frontend)**

When a user clicks "⏱️ Snooze ▼" on a todo:

1. **SnoozeMenu Component** (`frontend/src/components/SnoozeMenu.jsx`) displays options:
   - 15 minutes
   - 30 minutes
   - 1 hour
   - 4 hours
   - Until end of shift (5 PM, or next day if past 5 PM)
   - Custom (user enters minutes)

2. **User selects duration** → `handleSnooze(minutes)` is called

3. **Frontend Hook** (`frontend/src/hooks/useTodoList.js`) sends API request:
   ```javascript
   PUT /api/todos/:id/snooze
   Body: { minutes: 30 }
   ```

### 2. **Backend Processing** (`backend/src/routes/todos.js`)

The backend snooze endpoint:

```javascript
PUT /api/todos/:id/snooze
```

**What happens:**
1. Validates that `minutes` is a valid number
2. Calculates `snoozeUntil` timestamp:
   ```javascript
   const snoozeUntil = new Date(Date.now() + minutes * 60 * 1000);
   ```
3. Updates the todo:
   - Sets `status = 'Snoozed'`
   - Sets `snoozedUntil = <calculated timestamp>`
4. Saves to `todo.json`

**Example:**
```json
{
  "id": "todo_009",
  "status": "Snoozed",
  "snoozedUntil": "2025-11-26T14:30:00Z",
  ...
}
```

### 3. **Automatic Expiration (Backend)**

Every time the API is called to get todos (`GET /api/todos`), the backend:

1. **Filters active todos:**
   ```javascript
   const activeTodos = todos.filter(todo => 
     todo.status === 'Open' || todo.status === 'Snoozed'
   );
   ```

2. **Checks each snoozed todo:**
   ```javascript
   if (todo.status === 'Snoozed' && todo.snoozedUntil) {
     const snoozeTime = new Date(todo.snoozedUntil);
     if (now >= snoozeTime) {
       // Time has passed - unsnooze it!
       todo.status = 'Open';
       delete todo.snoozedUntil;
     }
   }
   ```

3. **Saves changes** if any todos were auto-unsnoozed

**Key Point:** This happens **on every API call**, so snoozed todos automatically reappear when their time expires.

### 4. **Display Logic (Frontend)**

The frontend:
- **Badge count** only includes `status === 'Open'` todos (snoozed items don't count)
- **Todo list** shows only active todos (Open + not-yet-expired Snoozed)
- **Snoozed items** are hidden from the main list until they expire

## Snooze Options Explained

### Quick Options

| Option | Minutes | Use Case |
|--------|---------|----------|
| 15 minutes | 15 | Quick break, will check back soon |
| 30 minutes | 30 | Short task, then return |
| 1 hour | 60 | Focus on something else for an hour |
| 4 hours | 240 | Half-day delay |
| Until end of shift | Variable | Until 5 PM (or next day if past 5 PM) |

### "Until End of Shift" Logic

```javascript
const eod = new Date();
eod.setHours(17, 0, 0, 0);  // Set to 5:00 PM today
if (eod <= new Date()) {
  eod.setDate(eod.getDate() + 1);  // If past 5 PM, use tomorrow
}
const minutes = Math.floor((eod - new Date()) / 60000);
```

**Example:**
- Current time: 2:00 PM → Snoozes until 5:00 PM (3 hours)
- Current time: 6:00 PM → Snoozes until 5:00 PM tomorrow (23 hours)

### Custom Snooze

User can enter any number of minutes (minimum 1).

## Data Structure

### Todo Object (Snoozed State)

```json
{
  "id": "todo_009",
  "title": "Safety Walk - Building A",
  "status": "Snoozed",
  "snoozedUntil": "2025-11-26T14:30:00Z",
  "createdAt": "2025-11-26T08:00:00Z",
  "dueTime": "2025-11-26T14:30:00Z",
  ...
}
```

**Fields:**
- `status`: Changed from `"Open"` to `"Snoozed"`
- `snoozedUntil`: ISO timestamp when snooze expires
- Other fields remain unchanged

### After Expiration

```json
{
  "id": "todo_009",
  "title": "Safety Walk - Building A",
  "status": "Open",  // ← Changed back
  // snoozedUntil field is deleted
  ...
}
```

## Flow Diagram

```
User clicks "Snooze" 
    ↓
Select duration (15min, 30min, 1hr, 4hr, EOD, or custom)
    ↓
Frontend: PUT /api/todos/:id/snooze { minutes: 30 }
    ↓
Backend: Calculate snoozeUntil = now + 30 minutes
    ↓
Backend: Update todo.status = "Snoozed", todo.snoozedUntil = <timestamp>
    ↓
Backend: Save to todo.json
    ↓
Todo disappears from active list
    ↓
[Time passes...]
    ↓
User refreshes or frontend polls API
    ↓
Backend: GET /api/todos checks all Snoozed todos
    ↓
Backend: If now >= snoozedUntil → Change status to "Open", delete snoozedUntil
    ↓
Todo reappears in active list!
```

## Important Behaviors

### ✅ What Snooze Does

- **Hides** the todo from the active list
- **Preserves** all todo data (title, description, dueTime, etc.)
- **Automatically** restores the todo when time expires
- **Does NOT** count toward badge count while snoozed
- **Does NOT** affect the original dueTime

### ❌ What Snooze Does NOT Do

- Does NOT delete the todo
- Does NOT change the original dueTime
- Does NOT prevent the todo from becoming overdue
- Does NOT require manual action to restore

### 🔄 Automatic Restoration

**Key Feature:** Snoozed todos automatically become "Open" again when their `snoozedUntil` time passes.

**When does this happen?**
- Every time `GET /api/todos` is called
- Frontend polls every 60 seconds (see `POLL_INTERVAL` in `useTodoList.js`)
- So snoozed todos reappear within 60 seconds of expiration

## Example Scenarios

### Scenario 1: Quick 15-Minute Snooze

1. **2:00 PM** - User snoozes "Restroom Inspection" for 15 minutes
   - `snoozedUntil = "2025-11-26T14:15:00Z"`
   - Todo disappears from list

2. **2:15 PM** - User refreshes page or frontend polls API
   - Backend checks: `now >= snoozedUntil` → **True**
   - Todo status changes to "Open"
   - Todo reappears in list

### Scenario 2: Snooze Until End of Shift

1. **1:30 PM** - User snoozes "Team Meeting" until end of shift
   - Calculates: 5:00 PM - 1:30 PM = 3.5 hours = 210 minutes
   - `snoozedUntil = "2025-11-26T17:00:00Z"`
   - Todo disappears

2. **5:00 PM** - Frontend polls API
   - Backend checks: `now >= snoozedUntil` → **True**
   - Todo reappears

### Scenario 3: Snooze Past Original Due Time

1. **10:00 AM** - Todo "Observe Mike" is due at 10:12 AM
2. **10:05 AM** - User snoozes for 30 minutes
   - `snoozedUntil = "2025-11-26T10:35:00Z"`
   - Original `dueTime = "2025-11-26T10:12:00Z"` (unchanged)
3. **10:35 AM** - Todo reappears
   - Status: "Open"
   - Still shows as "Overdue 23 min" (because original dueTime was 10:12 AM)

## Code Locations

### Frontend
- **Snooze Menu**: `frontend/src/components/SnoozeMenu.jsx`
- **Snooze Handler**: `frontend/src/hooks/useTodoList.js` → `snoozeTodo()`
- **Time Utils**: `frontend/src/utils/timeUtils.js` → `getSnoozeTime()`

### Backend
- **Snooze Endpoint**: `backend/src/routes/todos.js` → `PUT /:id/snooze`
- **Auto-Expiration**: `backend/src/routes/todos.js` → `GET /` (lines 16-38)
- **Data Storage**: `backend/src/data/todo.json`

## Testing Snooze

### Test Quick Snooze
1. Snooze a todo for 15 minutes
2. Verify it disappears from the list
3. Wait 15 minutes (or manually adjust `snoozedUntil` in JSON)
4. Refresh page → Todo should reappear

### Test Auto-Expiration
1. Snooze a todo
2. Manually edit `backend/src/data/todo.json`:
   ```json
   "snoozedUntil": "2020-01-01T00:00:00Z"  // Past date
   ```
3. Refresh page → Todo should immediately reappear

### Test Badge Count
1. Note current badge count
2. Snooze a todo → Badge count should decrease
3. Wait for snooze to expire → Badge count should increase

## Edge Cases

### What if snoozedUntil is missing?
- Todo remains "Snoozed" but never expires
- Should not happen in normal operation

### What if snoozedUntil is in the past?
- Todo immediately becomes "Open" on next API call

### What if user snoozes multiple times?
- Each snooze overwrites the previous `snoozedUntil`
- Latest snooze time wins

### What if todo is completed while snoozed?
- Status changes to "Completed"
- `snoozedUntil` is ignored (completed todos are filtered out)

## Summary

**Snooze = Temporary Hide + Auto-Restore**

1. User selects duration → Todo gets `snoozedUntil` timestamp
2. Todo disappears from active list
3. Backend checks expiration on every API call
4. When time expires → Todo automatically becomes "Open" again
5. No manual intervention needed!

