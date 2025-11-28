import React, { useState } from 'react';
import { getTimeUntilDue } from '../utils/timeUtils';
import { SnoozeMenu } from './SnoozeMenu';
import { DismissMenu } from './DismissMenu';
import { ExternalLinkModal } from './ExternalLinkModal';

export const TodoCard = ({ 
  todo, 
  onComplete, 
  onSnooze, 
  onDismiss,
  onOpenCompletion,
  isDynamic = false
}) => {
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false);
  const [showDismissMenu, setShowDismissMenu] = useState(false);
  const [showExternalLink, setShowExternalLink] = useState(false);

  const timeInfo = getTimeUntilDue(todo.dueTime);
  const hasDynamicLink = isDynamic && todo.details?. externalLink;

  return (
    <>
      <div className={`todo-card priority-${todo.priority}`}>
        <div className="todo-header">
          <div className="todo-title-section">
            {! isDynamic && (
              <input 
                type="checkbox" 
                className="todo-checkbox"
                onClick={() => onOpenCompletion(todo)}
              />
            )}
            <div className="todo-title-group">
              <h3 className="todo-title">{todo. title}</h3>
              {hasDynamicLink && (
                <button 
                  className="btn-link"
                  onClick={() => setShowExternalLink(true)}
                >
                  View details →
                </button>
              )}
            </div>
          </div>
          <div className={`todo-time ${timeInfo.isOverdue ? 'overdue' : ''}`}>
            {timeInfo.text}
          </div>
        </div>

        <p className="todo-description">{todo.description}</p>

        {todo.details && Object.keys(todo.details).length > 0 && (
          <div className="todo-details">
            {todo.details.employee && <span>👤 {todo.details.employee}</span>}
            {todo.details.zone && <span>📍 {todo.details.zone}</span>}
            {todo.details. temperature && <span>🌡️ {todo.details.temperature}</span>}
            {todo. details.orderNumber && <span>📦 {todo.details.orderNumber}</span>}
            {todo.details.cutoffMinutes && <span>⏱️ Cutoff in {todo.details.cutoffMinutes} min</span>}
            {todo.details.location && <span>📍 {todo.details.location}</span>}
          </div>
        )}

        <div className="todo-actions">
          {!isDynamic ?  (
            <>
              <button 
                className="btn btn-check"
                onClick={() => onOpenCompletion(todo)}
                title="Mark complete"
              >
                ✓ Complete
              </button>
            </>
          ) : null}
          
          <div className="dropdown-group">
            <button 
              className="btn btn-snooze"
              onClick={() => setShowSnoozeMenu(! showSnoozeMenu)}
            >
              ⏱️ Snooze ▼
            </button>
            {showSnoozeMenu && (
              <SnoozeMenu
                onSnooze={onSnooze}
                onClose={() => setShowSnoozeMenu(false)}
              />
            )}
          </div>

          <div className="dropdown-group">
            <button 
              className="btn btn-dismiss"
              onClick={() => setShowDismissMenu(!showDismissMenu)}
            >
              ✕ Dismiss
            </button>
            {showDismissMenu && (
              <DismissMenu
                codes={todo.type?. dismissalCodes || []}
                onDismiss={onDismiss}
                onClose={() => setShowDismissMenu(false)}
              />
            )}
          </div>
        </div>
      </div>

      {hasDynamicLink && (
        <ExternalLinkModal
          isOpen={showExternalLink}
          onClose={() => setShowExternalLink(false)}
          title={todo.title}
          linkText="Opens WMS screen"
        />
      )}
    </>
  );
};