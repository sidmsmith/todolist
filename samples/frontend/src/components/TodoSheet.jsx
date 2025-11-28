import React, { useState } from 'react';
import { TodoCard } from './TodoCard';
import { CompletionModal } from './CompletionModal';

export const TodoSheet = ({ 
  todos, 
  onComplete, 
  onSnooze, 
  onDismiss,
  getTodoTypeById,
  onClose,
  badgeCount
}) => {
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState('critical');

  // Group todos by priority category
  const critical = todos. filter(t => t.priority === 1);
  const high = todos.filter(t => t. priority === 2);
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

  const renderCategoryHeader = (title, count, icon, category) => {
    if (count === 0) return null;

    return (
      <div
        key={`header-${category}`}
        className="mobile-category-header"
        onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
      >
        <span>{icon} {title}</span>
        <span className="count">{count}</span>
        <span className="arrow">{expandedCategory === category ? '▲' : '▼'}</span>
      </div>
    );
  };

  const renderCategoryTodos = (category, todos) => {
    if (expandedCategory !== category || todos.length === 0) return null;

    return (
      <div key={`todos-${category}`} className="mobile-category-todos">
        {todos.map(todo => (
          <TodoCard
            key={todo.id}
            todo={todo}
            onComplete={handleCompleteClick}
            onSnooze={(minutes) => handleSnoozeClick(todo.id, minutes)}
            onDismiss={(reason) => handleDismissClick(todo.id, reason)}
            onOpenCompletion={handleOpenCompletion}
            isDynamic={todo.type?.completionMethod === 'none'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="todo-sheet">
      <div className="sheet-header">
        <div className="sheet-title">
          <span>📋</span>
          <span className="badge-mobile">{badgeCount}</span>
          <span>Supervisor To-Do List</span>
        </div>
        <button className="btn-close" onClick={onClose}>✕</button>
      </div>

      <div className="sheet-content">
        {renderCategoryHeader('🔴 CRITICAL', critical.length, '🔴', 'critical')}
        {renderCategoryTodos('critical', critical)}

        {renderCategoryHeader('🟠 HIGH', high.length, '🟠', 'high')}
        {renderCategoryTodos('high', high)}

        {renderCategoryHeader('🟡 MEDIUM', medium.length, '🟡', 'medium')}
        {renderCategoryTodos('medium', medium)}

        {renderCategoryHeader('⚪ LOW', low.length, '⚪', 'low')}
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
          todoType={getTodoTypeById(selectedTodo. typeId)}
          onComplete={handleCompleteClick}
          onCancel={() => setShowCompletionModal(false)}
        />
      )}
    </div>
  );
};