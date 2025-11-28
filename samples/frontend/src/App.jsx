import React, { useState, useEffect } from 'react';
import { useTodoList } from './hooks/useTodoList';
import { TodoBadge } from './components/TodoBadge';
import { TodoDropdown } from './components/TodoDropdown';
import { TodoSheet } from './components/TodoSheet';
import './styles/globals.css';

function App() {
  const [showTodoPanel, setShowTodoPanel] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const {
    todos,
    loading,
    error,
    completeTodo,
    snoozeTodo,
    dismissTodo,
    getTodoTypeById,
    getBadgeCount
  } = useTodoList();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window. addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const badgeCount = getBadgeCount();

  return (
    <div className="app">
      {/* Mock WMS Header */}
      <div className="wms-header">
        <div className="header-content">
          <h1>Warehouse Management System</h1>
          <div className="header-actions">
            <TodoBadge 
              count={badgeCount} 
              onClick={() => setShowTodoPanel(! showTodoPanel)}
            />
          </div>
        </div>
      </div>

      {/* Main WMS Content Area */}
      <div className="wms-content">
        <div className="placeholder-content">
          <h2>WMS Main Content</h2>
          <p>This is a placeholder for the main WMS application.</p>
          <p>Click the badge (📋) in the top-right to open the Supervisor To-Do List.</p>
          {error && <p style={{ color: '#dc3545' }}>Error: {error}</p>}
        </div>
      </div>

      {/* Todo Panel (Dropdown or Sheet based on screen size) */}
      {showTodoPanel && (
        isMobile ? (
          <TodoSheet
            todos={todos}
            onComplete={completeTodo}
            onSnooze={snoozeTodo}
            onDismiss={dismissTodo}
            getTodoTypeById={getTodoTypeById}
            onClose={() => setShowTodoPanel(false)}
            badgeCount={badgeCount}
          />
        ) : (
          <div className="todo-dropdown-container">
            <TodoDropdown
              todos={todos}
              onComplete={completeTodo}
              onSnooze={snoozeTodo}
              onDismiss={dismissTodo}
              getTodoTypeById={getTodoTypeById}
              onClose={() => setShowTodoPanel(false)}
            />
          </div>
        )
      )}
    </div>
  );
}

export default App;