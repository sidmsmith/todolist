import React, { useState } from 'react';
import { TodoCard } from './TodoCard';
import { CompletionModal } from './CompletionModal';

export const TodoDropdown = ({ 
  todos, 
  onComplete, 
  onSnooze, 
  onDismiss,
  getTodoTypeById,
  onClose
}) => {
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Group todos by priority category
  const critical = todos.filter(t => t.priority === 1);
  const high = todos.filter(t => t.priority === 2);
  const medium = todos.filter(t => t.priority === 3);
  const low = todos.filter(t => t.priority >= 4);

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

  const renderCategorySection = (title, categoryTodos, icon) => {
    if (categoryTodos.length === 0) return null;

    const isDynamic = categoryTodos.some(t => t.type?. completionMethod === 'none');

    return (
      <div key={title} className="category-section">
        <div className="category-header">
          <span className="category-icon">{icon}</span>
          <span className="category-title">{title}</span>
          <span className="category-count">
            {categoryTodos.filter(t => {
              const timeInfo = new Date(t.dueTime) < new Date();
              return timeInfo;
            }).length > 0 && (
              `${categoryTodos.filter(t => new Date(t.dueTime) < new Date()).length} overdue`
            )}
          </span>
        </div>
        <div className="category-todos">
          {categoryTodos. map(todo => (
            <TodoCard
              key={todo. id}
              todo={todo}
              onComplete={handleCompleteClick}
              onSnooze={(minutes) => handleSnoozeClick(todo.id, minutes)}
              onDismiss={(reason) => handleDismissClick(todo.id, reason)}
              onOpenCompletion={handleOpenCompletion}
              isDynamic={isDynamic}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="todo-dropdown">
      <div className="dropdown-header">
        <h2>Supervisor To-Do List</h2>
        <button className="btn-close" onClick={onClose}>✕</button>
      </div>

      <div className="dropdown-content">
        {critical.length > 0 && renderCategorySection('🔴 CRITICAL', critical, '🔴')}
        {high.length > 0 && renderCategorySection('🟠 HIGH PRIORITY', high, '🟠')}
        {medium.length > 0 && renderCategorySection('🟡 MEDIUM PRIORITY', medium, '🟡')}
        {low.length > 0 && renderCategorySection('⚪ LOW PRIORITY', low, '⚪')}

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