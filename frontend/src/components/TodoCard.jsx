import React, { useState, useEffect, useRef } from 'react';
import { getTimeUntilDue } from '../utils/timeUtils';
import { SnoozeMenu } from './SnoozeMenu';
import { DismissMenu } from './DismissMenu';
import { CompletionDropdown } from './CompletionDropdown';
import { ExternalLinkModal } from './ExternalLinkModal';

// Mapping of detail types to icons
const DETAIL_ICONS = {
  // People & Teams
  employee: '👤',
  assignedTo: '👥',
  supervisor: '👔',
  shift: '🕐',
  teamSize: '👨‍👩‍👧‍👦',
  
  // Location & Movement
  zone: '📍',
  location: '📍',
  fromLocation: '⬅️',
  toLocation: '➡️',
  aisle: '🗺️',
  dock: '🚢',
  
  // Equipment & Assets
  equipmentId: '🔧',
  vehicleId: '🚛',
  machineStatus: '⚙️',
  assetTag: '🏷️',
  product: '🏷️',
  item: '🏷️',
  
  // Orders & Inventory
  orderNumber: '📦',
  orderStatus: '📝',
  inventoryLevel: '📉',
  batchNumber: '🔢',
  lotNumber: '🎫',
  
  // Quantity & Volume
  quantity: '📊',
  weight: '⚖️',
  volume: '📦📦',
  palletCount: '🗂️',
  
  // Time & Urgency
  cutoffMinutes: '⏱️',
  timeRemaining: '⏰',
  deadline: '🕐',
  escalationLevel: '⚠️',
  slaMinutes: '⏳',
  
  // Environmental
  temperature: '🌡️',
  humidity: '💧',
  pressure: '🌪️',
  lighting: '💡',
  
  // Status & Condition
  condition: '✅',
  qualityStatus: '⭐',
  severity: '🔴',
  statusCode: '🏷️',
  
  // Safety & Compliance
  safetyLevel: '🦺',
  complianceStatus: '📋',
  incidentType: '🚨',
  certification: '🎓',
  
  // Communication & Escalation
  notificationCount: '🔔',
  escalatedBy: '📢',
  priorityReason: '💬',
  relatedTodoCount: '🔗',
  
  // External Link
  externalLink: '🔗'
};

// Default icon for unmapped detail types
const DEFAULT_DETAIL_ICON = '❌';

export const TodoCard = ({ 
  todo, 
  onComplete, 
  onSnooze, 
  onDismiss,
  onOpenCompletion,
  isDynamic = false,
  getTodoTypeById
}) => {
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false);
  const [showDismissMenu, setShowDismissMenu] = useState(false);
  const [showCompletionDropdown, setShowCompletionDropdown] = useState(false);
  const [showExternalLink, setShowExternalLink] = useState(false);
  const snoozeRef = useRef(null);
  const dismissRef = useRef(null);
  const completionRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSnoozeMenu && snoozeRef.current && !snoozeRef.current.contains(event.target)) {
        setShowSnoozeMenu(false);
      }
      if (showDismissMenu && dismissRef.current && !dismissRef.current.contains(event.target)) {
        setShowDismissMenu(false);
      }
      if (showCompletionDropdown && completionRef.current && !completionRef.current.contains(event.target)) {
        setShowCompletionDropdown(false);
      }
    };

    if (showSnoozeMenu || showDismissMenu || showCompletionDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSnoozeMenu, showDismissMenu, showCompletionDropdown]);

  const timeInfo = getTimeUntilDue(todo.dueTime);
  const hasDynamicLink = isDynamic && todo.details?.externalLink;
  const isSnoozed = todo.isSnoozedByUser || false;
  const snoozeInfo = todo.userSnoozeInfo;
  
  // Format snooze time
  const getSnoozeTimeText = () => {
    if (!snoozeInfo) return '';
    const snoozeTime = new Date(snoozeInfo.snoozedUntil);
    return snoozeTime.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };


  return (
    <>
      <div className={`todo-card priority-${todo.priority} ${isSnoozed ? 'snoozed' : ''}`}>
        <div className="todo-header">
          <div className="todo-title-section">
            <div className="todo-title-group">
              <h3 className="todo-title">
                <span className="todo-title-text">{todo.title}</span>
                <span className={`todo-time-inline ${timeInfo.isOverdue ? 'overdue' : ''}`}>
                  {timeInfo.text}
                </span>
              </h3>
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
        </div>

        <p className="todo-description">{todo.description}</p>
        
        {isSnoozed && snoozeInfo && (
          <div className="snooze-indicator">
            ⏱️ Snoozed until {getSnoozeTimeText()}
          </div>
        )}

        {todo.details && Object.keys(todo.details).length > 0 && (
          <div className="todo-details">
            {Object.entries(todo.details)
              .filter(([key, value]) => value != null && value !== '' && key !== 'externalLink')
              .map(([key, value]) => {
                const icon = DETAIL_ICONS[key] || DEFAULT_DETAIL_ICON;
                const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                
                // Special handling for orderNumber (make it a link)
                if (key === 'orderNumber') {
                  return (
                    <span key={key}>
                      {icon} <a href="https://espn.com" target="_blank" rel="noopener noreferrer">{value}</a>
                    </span>
                  );
                }
                
                // Format display text - match original format where applicable
                let displayText = value;
                
                // Fields that should show with label prefix
                const labelFields = [
                  'teamSize', 'equipmentId', 'vehicleId', 'assetTag', 'product', 'item', 'orderStatus', 
                  'inventoryLevel', 'batchNumber', 'lotNumber', 'quantity', 'weight', 
                  'volume', 'palletCount', 'humidity', 'pressure', 'lighting', 
                  'condition', 'qualityStatus', 'severity', 'statusCode', 'safetyLevel', 
                  'complianceStatus', 'incidentType', 'certification', 'notificationCount', 
                  'escalatedBy', 'priorityReason', 'relatedTodoCount', 'aisle', 'dock',
                  'escalationLevel', 'slaMinutes', 'cutoffMinutes', 'timeRemaining', 'deadline'
                ];
                
                if (labelFields.includes(key)) {
                  // Format key for display (e.g., "teamSize" -> "Team Size")
                  const formattedKey = displayKey;
                  displayText = `${formattedKey}: ${value}`;
                } else if (key === 'fromLocation') {
                  displayText = `From: ${value}`;
                } else if (key === 'toLocation') {
                  displayText = `To: ${value}`;
                } else if (key === 'cutoffMinutes') {
                  displayText = `Cutoff in ${value} min`;
                } else if (key === 'slaMinutes') {
                  displayText = `SLA: ${value} min remaining`;
                } else if (key === 'timeRemaining') {
                  displayText = `Time remaining: ${value}`;
                } else if (key === 'deadline') {
                  displayText = `Deadline: ${value}`;
                } else if (key === 'relatedTodoCount') {
                  displayText = `Related: ${value} todos`;
                }
                
                return (
                  <span key={key}>
                    {icon} {displayText}
                  </span>
                );
              })}
          </div>
        )}

        <div className="todo-actions">
          {!isDynamic ?  (
            <>
              {(() => {
                const todoType = getTodoTypeById ? getTodoTypeById(todo.typeId) : null;
                const completionCodes = todoType?.completionCodes || [];
                
                // If dropdown completion method, show dropdown menu
                if (todoType?.completionMethod === 'dropdown' && completionCodes.length > 0) {
                  return (
                    <div className="dropdown-group" ref={completionRef}>
                      <button 
                        className="btn btn-check"
                        onClick={() => setShowCompletionDropdown(!showCompletionDropdown)}
                        title="Mark complete"
                      >
                        ✓ Complete ▼
                      </button>
                      {showCompletionDropdown && (
                        <CompletionDropdown
                          codes={completionCodes}
                          onComplete={async (code, text) => {
                            const completionData = { 
                              completionCode: code, 
                              completionReason: text || code 
                            };
                            await onComplete(todo.id, completionData);
                            setShowCompletionDropdown(false);
                          }}
                          onClose={() => setShowCompletionDropdown(false)}
                        />
                      )}
                    </div>
                  );
                } else {
                  // Modal or auto completion
                  return (
                    <div className="dropdown-group">
                      <button 
                        className="btn btn-check"
                        onClick={() => onOpenCompletion(todo)}
                        title="Mark complete"
                      >
                        ✓ Complete
                      </button>
                    </div>
                  );
                }
              })()}
            </>
          ) : null}
          
          <div className="dropdown-group" ref={snoozeRef}>
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
                isSnoozed={isSnoozed}
              />
            )}
          </div>

          {(() => {
            const todoType = getTodoTypeById ? getTodoTypeById(todo.typeId) : null;
            const dismissalCodes = todoType?.dismissalCodes;
            // Handle dismissalCodes: if it's "none" or not an array, hide the button
            const hasDismissalCodes = Array.isArray(dismissalCodes) && dismissalCodes.length > 0;
            // Hide Dismiss button if dismissalCodes is "none" or not an array, or if completionMethod is "none" and there are no dismissal codes
            if (dismissalCodes === 'none' || !hasDismissalCodes) {
              return null;
            }
            return (
              <div className="dropdown-group" ref={dismissRef}>
                <button 
                  className="btn btn-dismiss"
                  onClick={() => setShowDismissMenu(!showDismissMenu)}
                >
                  ✕ Dismiss
                </button>
                {showDismissMenu && (
                  <DismissMenu
                    codes={dismissalCodes}
                    onDismiss={onDismiss}
                    onClose={() => setShowDismissMenu(false)}
                  />
                )}
              </div>
            );
          })()}
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