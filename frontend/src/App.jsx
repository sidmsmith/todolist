import React, { useState, useEffect } from 'react';
import { useTodoList } from './hooks/useTodoList';
import { TodoBadge } from './components/TodoBadge';
import { TodoDropdown } from './components/TodoDropdown';
import { TodoSheet } from './components/TodoSheet';
import { ILPNScreen } from './components/ILPNScreen';
import { TodoTypeManager } from './components/TodoTypeManager';
import { MenuOverlay } from './components/MenuOverlay';
import './styles/globals.css';

function App() {
  const [showTodoPanel, setShowTodoPanel] = useState(false);
  const [showILPNScreen, setShowILPNScreen] = useState(false);
  const [showTodoTypeManager, setShowTodoTypeManager] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const {
    todos,
    loading,
    error,
    completeTodo,
    snoozeTodo,
    dismissTodo,
    getTodoTypeById,
    getBadgeCount,
    snoozedCount,
    showSnoozed,
    toggleShowSnoozed
  } = useTodoList();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const badgeCount = getBadgeCount();

  // Show To Dos Screen if requested
  if (showILPNScreen) {
    return (
      <div className="app">
        <ILPNScreen />
        {/* Toggle button to go back to todo view */}
        <button 
          className="view-toggle-btn"
          onClick={() => setShowILPNScreen(false)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 10000,
            padding: '12px 24px',
            backgroundColor: '#007BFF',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          Back to Todo List
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      {/* WMS Background Screenshot (desktop only) */}
      {!isMobile && (
        <>
          <div className="wms-background">
            <picture>
              <source srcSet="/wms-background.png" type="image/png" />
              <source srcSet="/wms-background.jpg" type="image/jpeg" />
              <img 
                src="/wms-background.png" 
                alt="WMS Interface" 
                className="wms-screenshot"
                onError={(e) => {
                  // Fallback if image doesn't exist yet
                  e.target.style.display = 'none';
                  e.target.parentElement.classList.add('wms-background-fallback');
                }}
              />
            </picture>
          </div>

          {/* Clickable overlay for existing hamburger menu icon in WMS background */}
          <div 
            className="wms-hamburger-clickable"
            onClick={() => setShowMenu(true)}
            title="Open menu"
          />

          {/* Menu Overlay */}
          {showMenu && (
            <MenuOverlay
              isOpen={showMenu}
              onClose={() => setShowMenu(false)}
              onToDoListClick={() => {
                setShowMenu(false);
                setShowILPNScreen(true);
              }}
              onManageTodoTypesClick={() => {
                setShowMenu(false);
                setShowTodoTypeManager(true);
              }}
            />
          )}
        </>
      )}

      {/* Todo Badge - Positioned in top-right corner (desktop only) */}
      {!isMobile && (
        <div className="todo-badge-container">
          <TodoBadge 
            count={badgeCount} 
            onClick={() => setShowTodoPanel(!showTodoPanel)}
          />
        </div>
      )}

      {/* Toggle button to show To Dos Screen (desktop only) */}
      {!isMobile && (
        <>
          <button 
            className="view-toggle-btn"
            onClick={() => setShowILPNScreen(true)}
            style={{
              position: 'fixed',
              bottom: '20px',
              left: '20px',
              zIndex: 10000,
              padding: '12px 24px',
              backgroundColor: '#28A745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            View To Dos
          </button>

          {/* Button to manage Todo Types */}
          <button 
            className="view-toggle-btn"
            onClick={() => setShowTodoTypeManager(true)}
            style={{
              position: 'fixed',
              bottom: '20px',
              left: '180px',
              zIndex: 10000,
              padding: '12px 24px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Manage Todo Types
          </button>
        </>
      )}

      {/* Todo Type Manager Modal */}
      {showTodoTypeManager && (
        <TodoTypeManager
          isOpen={showTodoTypeManager}
          onClose={() => setShowTodoTypeManager(false)}
        />
      )}

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          Error: {error}
        </div>
      )}

        {/* Todo Panel (Dropdown or Sheet based on screen size) */}
        {isMobile ? (
          // Mobile: Always show TodoSheet, no close option
          <TodoSheet
            todos={todos}
            onComplete={completeTodo}
            onSnooze={snoozeTodo}
            onDismiss={dismissTodo}
            getTodoTypeById={getTodoTypeById}
            onClose={null}
            badgeCount={badgeCount}
            snoozedCount={snoozedCount}
            showSnoozed={showSnoozed}
            toggleShowSnoozed={toggleShowSnoozed}
          />
        ) : (
          // Desktop: Show dropdown when badge is clicked
          showTodoPanel && (
            <div className="todo-dropdown-container">
              <TodoDropdown
                todos={todos}
                onComplete={completeTodo}
                onSnooze={snoozeTodo}
                onDismiss={dismissTodo}
                getTodoTypeById={getTodoTypeById}
                onClose={() => setShowTodoPanel(false)}
                snoozedCount={snoozedCount}
                showSnoozed={showSnoozed}
                toggleShowSnoozed={toggleShowSnoozed}
              />
            </div>
          )
        )}
    </div>
  );
}

export default App;