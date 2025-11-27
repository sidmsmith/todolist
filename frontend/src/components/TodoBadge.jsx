import React from 'react';

export const TodoBadge = ({ count, onClick }) => {
  return (
    <button 
      className="todo-badge"
      onClick={onClick}
      title={`${count} todo item${count !== 1 ? 's' : ''}`}
    >
      <span className="badge-icon">
        {/* Using SVG for white icon - can also use emoji with filter */}
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="2" width="6" height="4" rx="1"/>
          <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2"/>
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
        </svg>
      </span>
      {count > 0 && <span className="badge-count">{count}</span>}
    </button>
  );
};