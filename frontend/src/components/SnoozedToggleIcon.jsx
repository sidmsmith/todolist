import React from 'react';

export const SnoozedToggleIcon = ({ count, isChecked, onClick }) => {
  if (!count || count === 0) return null;

  return (
    <button
      className={`snoozed-toggle-icon ${isChecked ? 'checked' : 'unchecked'}`}
      onClick={onClick}
      title={isChecked ? 'Hide snoozed todos' : 'Show snoozed todos'}
    >
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Bell icon */}
        <path 
          d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M13.73 21a2 2 0 0 1-3.46 0" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        {/* Red X when unchecked */}
        {!isChecked && (
          <>
            <path 
              d="M6 6L18 18M18 6L6 18" 
              stroke="#dc3545" 
              strokeWidth="2.5" 
              strokeLinecap="round"
              className="snooze-x"
            />
          </>
        )}
        {/* Green halo when checked */}
        {isChecked && (
          <circle 
            cx="12" 
            cy="12" 
            r="11" 
            stroke="#28a745" 
            strokeWidth="2.5" 
            fill="none"
            className="snooze-halo"
            strokeDasharray="2 2"
          />
        )}
      </svg>
      <span className="snoozed-count">({count})</span>
    </button>
  );
};

