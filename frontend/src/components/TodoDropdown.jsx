import React, { useState } from 'react';
import { TodoCard } from './TodoCard';
import { CompletionModal } from './CompletionModal';
import { SnoozedToggleIcon } from './SnoozedToggleIcon';

export const TodoDropdown = ({ 
  todos, 
  onComplete, 
  onSnooze, 
  onDismiss,
  getTodoTypeById,
  onClose,
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

  // Group todos by priority category
  const critical = todos.filter(t => t.priority === 1);
  const high = todos.filter(t => t.priority === 2);
  const medium = todos.filter(t => t.priority === 3);
  const low = todos.filter(t => t.priority >= 4);

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

  const handleOpenCompletion = (todo) => {
    setSelectedTodo(todo);
    setShowCompletionModal(true);
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

  const renderTypeGroup = (typeId, typeTodos, priorityKey) => {
    const typeKey = `${priorityKey}-${typeId}`;
    const isExpanded = expandedTypes[typeKey] !== false; // Default to expanded
    const todoType = getTodoTypeById(typeId);
    const typeName = todoType?.name || typeId;
    const count = typeTodos.length;

    return (
      <div key={typeKey} className="type-group">
        <div
          className="type-group-header clickable"
          onClick={() => toggleTypeGroup(priorityKey, typeId)}
          title={`Click to ${isExpanded ? 'hide' : 'show'} ${typeName}`}
        >
          <span className="type-group-title">{typeName} ({count})</span>
          <span className="type-group-toggle">
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>
        {isExpanded && (
          <div className="type-group-todos">
            {typeTodos.map(todo => {
              const todoType = getTodoTypeById(todo.typeId);
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
            })}
          </div>
        )}
      </div>
    );
  };

  const renderCategorySection = (title, categoryTodos, icon, categoryKey) => {
    if (categoryTodos.length === 0) return null;

    const isExpanded = expandedCategories[categoryKey];
    const overdueCount = categoryTodos.filter(t => new Date(t.dueTime) < new Date()).length;
    const todosByType = groupTodosByType(categoryTodos);
    const typeIds = Object.keys(todosByType);

    return (
      <div key={title} className="category-section">
        <div 
          className="category-header clickable"
          onClick={() => toggleCategory(categoryKey)}
          title={`Click to ${isExpanded ? 'hide' : 'show'} ${title}`}
        >
          <span className="category-icon">{icon}</span>
          <span className="category-title">{title}</span>
          <span className="category-count">
            {overdueCount > 0 && `${overdueCount} overdue`}
          </span>
          <span className="category-toggle">
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>
        {isExpanded && (
          <div className="category-todos">
            {typeIds.map(typeId => {
              const typeTodos = todosByType[typeId];
              const todoType = getTodoTypeById(typeId);
              // Show type group only if there are 2+ todos of this type
              if (typeTodos.length > 1) {
                return renderTypeGroup(typeId, typeTodos, categoryKey);
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
        )}
      </div>
    );
  };

  return (
    <div className="todo-dropdown">
      <div className="dropdown-header">
        <h2>Supervisor To-Do List</h2>
        <div className="header-actions">
          <SnoozedToggleIcon
            count={snoozedCount}
            isChecked={showSnoozed}
            onClick={toggleShowSnoozed}
          />
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
      </div>

      <div className="dropdown-content">
        {critical.length > 0 && renderCategorySection('CRITICAL', critical, '🔴', 'critical')}
        {high.length > 0 && renderCategorySection('HIGH PRIORITY', high, '🟠', 'high')}
        {medium.length > 0 && renderCategorySection('MEDIUM PRIORITY', medium, '🟡', 'medium')}
        {low.length > 0 && renderCategorySection('LOW PRIORITY', low, '⚪', 'low')}

        {todos.length === 0 && (
          <div className="empty-state">
            <p>✨ No to-dos.  Great job!</p>
          </div>
        )}
      </div>

      <div className="dropdown-footer">
        <small>Last updated: {new Date().toLocaleTimeString()}</small>
      </div>

      {selectedTodo && (
        <CompletionModal
          isOpen={showCompletionModal}
          todo={selectedTodo}
          todoType={getTodoTypeById(selectedTodo.typeId)}
          onComplete={handleCompleteClick}
          onCancel={() => setShowCompletionModal(false)}
        />
      )}
    </div>
  );
};