import React from 'react';

export const TodoBadge = ({ count, onClick }) => {
  return (
    <button 
      className="todo-badge"
      onClick={onClick}
      title={`${count} todo item${count !== 1 ? 's' : ''}`}
    >
      <span className="badge-icon">📋</span>
      {count > 0 && <span className="badge-count">{count}</span>}
    </button>
  );
};