import React, { useState } from 'react';
import { TodoCard } from './TodoCard';
import { CompletionModal } from './CompletionModal';
import { SnoozedToggleIcon } from './SnoozedToggleIcon';

export const TodoSheet = ({ 
  todos, 
  onComplete, 
  onSnooze, 
  onDismiss,
  getTodoTypeById,
  onClose,
  badgeCount,
  snoozedCount,
  showSnoozed,
  toggleShowSnoozed
}) => {
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({
    critical: true,
    high: true,
    medium: true,
    low: true
  });
  
  // State for expanded type groups (key format: "priority-typeId")
  const [expandedTypes, setExpandedTypes] = useState({});

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleTypeGroup = (priorityKey, typeId) => {
    const key = `${priorityKey}-${typeId}`;
    setExpandedTypes(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Group todos by type within a priority category
  const groupTodosByType = (categoryTodos) => {
    const grouped = {};
    categoryTodos.forEach(todo => {
      const typeId = todo.typeId || 'unknown';
      if (!grouped[typeId]) {
        grouped[typeId] = [];
      }
      grouped[typeId].push(todo);
    });
    return grouped;
  };

  // Group todos by priority category
  const critical = todos.filter(t => t.priority === 1);
  const high = todos.filter(t => t.priority === 2);
  const medium = todos.filter(t => t.priority === 3);
  const low = todos.filter(t => t.priority >= 4);

  const handleOpenCompletion = async (todo) => {
    // Check completion method
    const todoType = getTodoTypeById ? getTodoTypeById(todo.typeId) : null;
    
    if (todoType?.completionMethod === 'auto') {
      // Auto-complete: skip modal and complete directly
      await onComplete(todo.id, null);
    } else if (todoType?.completionMethod === 'modal') {
      // Modal completion: show modal
      setSelectedTodo(todo);
      setShowCompletionModal(true);
    }
    // dropdown completion is handled in TodoCard
  };

  const handleCompleteClick = async (completionData) => {
    if (selectedTodo) {
      const success = await onComplete(selectedTodo.id, completionData);
      if (success) {
        setShowCompletionModal(false);
        setSelectedTodo(null);
      }
    }
  };

  const handleSnoozeClick = async (todoId, minutes) => {
    await onSnooze(todoId, minutes);
  };

  const handleDismissClick = async (todoId, reason) => {
    await onDismiss(todoId, reason);
  };

  const renderCategoryHeader = (title, count, icon, category, categoryTodos) => {
    if (count === 0) return null;

    const isExpanded = expandedCategories[category];
    const overdueCount = categoryTodos.filter(t => new Date(t.dueTime) < new Date()).length;

    return (
      <div
        key={`header-${category}`}
        className="mobile-category-header"
        onClick={() => toggleCategory(category)}
      >
        <span>{icon} {title}</span>
        <span className="count">{count}</span>
        {overdueCount > 0 && <span className="overdue-count">{overdueCount} overdue</span>}
        <span className="arrow">{isExpanded ? '▼' : '▶'}</span>
      </div>
    );
  };

  const renderTypeGroup = (typeId, typeTodos, priorityKey) => {
    const typeKey = `${priorityKey}-${typeId}`;
    const isExpanded = expandedTypes[typeKey] !== false; // Default to expanded
    const todoType = getTodoTypeById(typeId);
    const typeName = todoType?.name || typeId;
    const count = typeTodos.length;

    return (
      <div key={typeKey} className="mobile-type-group">
        <div
          className="mobile-type-group-header clickable"
          onClick={() => toggleTypeGroup(priorityKey, typeId)}
          title={`Click to ${isExpanded ? 'hide' : 'show'} ${typeName}`}
        >
          <span className="mobile-type-group-title">{typeName} ({count})</span>
          <span className="mobile-type-group-toggle">
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>
        {isExpanded && (
          <div className="mobile-type-group-todos">
            {typeTodos.map(todo => {
              const todoType = getTodoTypeById(todo.typeId);
              const isDynamic = todoType?.completionMethod === 'none';
              return (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  onComplete={onComplete}
                  onSnooze={(minutes) => handleSnoozeClick(todo.id, minutes)}
                  onDismiss={(reason) => handleDismissClick(todo.id, reason)}
                  onOpenCompletion={handleOpenCompletion}
                  isDynamic={isDynamic}
                  getTodoTypeById={getTodoTypeById}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderCategoryTodos = (category, todos) => {
    const isExpanded = expandedCategories[category];
    if (!isExpanded || todos.length === 0) return null;

    const todosByType = groupTodosByType(todos);
    const typeIds = Object.keys(todosByType);

    return (
      <div key={`todos-${category}`} className="mobile-category-todos">
        {typeIds.map(typeId => {
          const typeTodos = todosByType[typeId];
          const todoType = getTodoTypeById(typeId);
          // Show type group only if there are 2+ todos of this type
          if (typeTodos.length > 1) {
            return renderTypeGroup(typeId, typeTodos, category);
          } else {
            // Single todo of this type - show directly (no grouping)
            const todo = typeTodos[0];
            const isDynamic = todoType?.completionMethod === 'none';
            return (
              <TodoCard
                key={todo.id}
                todo={todo}
                onComplete={handleCompleteClick}
                onSnooze={(minutes) => handleSnoozeClick(todo.id, minutes)}
                onDismiss={(reason) => handleDismissClick(todo.id, reason)}
                onOpenCompletion={handleOpenCompletion}
                isDynamic={isDynamic}
                getTodoTypeById={getTodoTypeById}
              />
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="todo-sheet">
      <div className="sheet-header">
        <div className="sheet-title">
          <span>📋</span>
          <span className="badge-mobile">{badgeCount}</span>
          <span>To-Do List</span>
        </div>
        <div className="header-actions">
          <SnoozedToggleIcon
            count={snoozedCount}
            isChecked={showSnoozed}
            onClick={toggleShowSnoozed}
          />
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
      </div>

      <div className="sheet-content">
        {renderCategoryHeader('CRITICAL', critical.length, '🔴', 'critical', critical)}
        {renderCategoryTodos('critical', critical)}

        {renderCategoryHeader('HIGH', high.length, '🟠', 'high', high)}
        {renderCategoryTodos('high', high)}

        {renderCategoryHeader('MEDIUM', medium.length, '🟡', 'medium', medium)}
        {renderCategoryTodos('medium', medium)}

        {renderCategoryHeader('LOW', low.length, '⚪', 'low', low)}
        {renderCategoryTodos('low', low)}

        {todos.length === 0 && (
          <div className="empty-state">
            <p>✨ No to-dos. Great job!</p>
          </div>
        )}
      </div>

      <div className="sheet-footer">
        <small>Last updated: {new Date().toLocaleTimeString()}</small>
      </div>

      {selectedTodo && (
        <CompletionModal
          isOpen={showCompletionModal}
          todo={selectedTodo}
          todoType={getTodoTypeById(selectedTodo.typeId)}
          onComplete={handleCompleteClick}
          onCancel={() => {
            setShowCompletionModal(false);
            setSelectedTodo(null);
          }}
        />
      )}
    </div>
  );
};