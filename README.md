# To-Do List - WMS

A React-based todo list application for Warehouse Management System supervisors.

## Project Structure

```
todolist/
├── frontend/          # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── styles/
│   │   └── utils/
│   ├── public/        # Static assets (screenshots go here)
│   └── package.json
├── backend/           # Express backend API
│   ├── src/
│   │   ├── routes/
│   │   ├── data/
│   │   └── utils/
│   └── package.json
├── samples/           # Original design files and starter code
├── server.js          # Root server for production
└── package.json       # Root package.json with scripts
```

## Quick Start

### 1. Add WMS Screenshot

**Important:** Before running the app, add your WMS screenshot:

1. Save your screenshot as `wms-background.png` (or `.jpg`)
2. Place it in `frontend/public/wms-background.png`

See [SCREENSHOT_SETUP.md](./SCREENSHOT_SETUP.md) for details.

### 2. Install Dependencies

```bash
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

### 3. Start Development

```bash
npm run dev
```

This will:
- Start the React frontend dev server on `http://localhost:3000`
- Start the Express backend API on `http://localhost:5000`

## Features

- ✅ WMS screenshot as background (add your own image)
- ✅ Clipboard badge in top-right corner (where help icon would be)
- ✅ Responsive design (desktop dropdown, mobile sheet)
- ✅ Priority-based sorting (Critical, High, Medium, Low)
- ✅ Snooze functionality with multiple duration options
- ✅ Dismiss with reason codes
- ✅ Completion modals for scheduled todos
- ✅ Real-time badge count
- ✅ Auto-expiring snoozed items
- ✅ External link support for dynamic todos

## Testing

For comprehensive testing instructions, see [TESTING.md](./TESTING.md).

**Quick Reset (Before Testing):**
```bash
# Reset all data to defaults
npm run reset
```

## API Endpoints

The backend API runs on port 5000 and provides:

- `GET /api/todos` - Get all todos
- `GET /api/todos/:id` - Get a specific todo
- `GET /api/todo-types` - Get all todo types
- `PUT /api/todos/:id/complete` - Complete a todo
- `PUT /api/todos/:id/snooze` - Snooze a todo
- `PUT /api/todos/:id/dismiss` - Dismiss a todo
- `POST /api/todos` - Create a new todo
- `DELETE /api/todos/:id` - Delete a todo
- `POST /api/reset` - Reset data to defaults (development only)

## Data Storage

The backend uses file-based JSON storage:
- `backend/src/data/todo.json` - Todo items (gets modified)
- `backend/src/data/todotype.json` - Todo type definitions
- `backend/src/data/seeds/` - Default/backup data (never modified)

## Deployment

### Vercel

The project is configured for Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the configuration from `vercel.json`
3. Set environment variables if needed:
   - `BACKEND_URL` - URL of your backend API (for production)

**Note:** For Vercel deployment, you may need to convert the Express backend to serverless functions or deploy the backend separately.

## Design Specification

See `samples/Supervisor_ToDo_List_Design_Spec.md` for full design details.

## Screenshot Setup

See [SCREENSHOT_SETUP.md](./SCREENSHOT_SETUP.md) for instructions on adding your WMS screenshot as the background.
