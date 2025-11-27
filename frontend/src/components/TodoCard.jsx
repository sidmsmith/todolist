import React, { useState, useEffect, useRef } from 'react';
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
  isDynamic = false,
  getTodoTypeById
}) => {
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false);
  const [showDismissMenu, setShowDismissMenu] = useState(false);
  const [showExternalLink, setShowExternalLink] = useState(false);
  const snoozeRef = useRef(null);
  const dismissRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSnoozeMenu && snoozeRef.current && !snoozeRef.current.contains(event.target)) {
        setShowSnoozeMenu(false);
      }
      if (showDismissMenu && dismissRef.current && !dismissRef.current.contains(event.target)) {
        setShowDismissMenu(false);
      }
    };

    if (showSnoozeMenu || showDismissMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSnoozeMenu, showDismissMenu]);

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
            {/* People & Teams */}
            {todo.details.employee && <span>👤 {todo.details.employee}</span>}
            {todo.details.assignedTo && <span>👥 {todo.details.assignedTo}</span>}
            {todo.details.supervisor && <span>👔 {todo.details.supervisor}</span>}
            {todo.details.shift && <span>🕐 {todo.details.shift}</span>}
            {todo.details.teamSize && <span>👨‍👩‍👧‍👦 Team: {todo.details.teamSize}</span>}
            
            {/* Location & Movement */}
            {todo.details.zone && <span>📍 {todo.details.zone}</span>}
            {todo.details.location && <span>📍 {todo.details.location}</span>}
            {todo.details.fromLocation && <span>⬅️ From: {todo.details.fromLocation}</span>}
            {todo.details.toLocation && <span>➡️ To: {todo.details.toLocation}</span>}
            {todo.details.aisle && <span>🗺️ Aisle: {todo.details.aisle}</span>}
            {todo.details.dock && <span>🚢 Dock: {todo.details.dock}</span>}
            
            {/* Equipment & Assets */}
            {todo.details.equipmentId && <span>🔧 Equipment: {todo.details.equipmentId}</span>}
            {todo.details.vehicleId && <span>🚛 Vehicle: {todo.details.vehicleId}</span>}
            {todo.details.machineStatus && <span>⚙️ Status: {todo.details.machineStatus}</span>}
            {todo.details.assetTag && <span>🏷️ Asset: {todo.details.assetTag}</span>}
            
            {/* Orders & Inventory */}
            {todo.details.orderNumber && <span>📦 {todo.details.orderNumber}</span>}
            {todo.details.orderStatus && <span>📝 Order: {todo.details.orderStatus}</span>}
            {todo.details.inventoryLevel && <span>📉 Stock: {todo.details.inventoryLevel}</span>}
            {todo.details.batchNumber && <span>🔢 Batch: {todo.details.batchNumber}</span>}
            {todo.details.lotNumber && <span>🎫 Lot: {todo.details.lotNumber}</span>}
            
            {/* Quantity & Volume */}
            {todo.details.quantity && <span>📊 Qty: {todo.details.quantity}</span>}
            {todo.details.weight && <span>⚖️ Weight: {todo.details.weight}</span>}
            {todo.details.volume && <span>📦📦 Volume: {todo.details.volume}</span>}
            {todo.details.palletCount && <span>🗂️ Pallets: {todo.details.palletCount}</span>}
            
            {/* Time & Urgency */}
            {todo.details.cutoffMinutes && <span>⏱️ Cutoff in {todo.details.cutoffMinutes} min</span>}
            {todo.details.timeRemaining && <span>⏰ Time remaining: {todo.details.timeRemaining}</span>}
            {todo.details.deadline && <span>🕐 Deadline: {todo.details.deadline}</span>}
            {todo.details.escalationLevel && <span>⚠️ Escalation: {todo.details.escalationLevel}</span>}
            {todo.details.slaMinutes && <span>⏳ SLA: {todo.details.slaMinutes} min remaining</span>}
            
            {/* Environmental */}
            {todo.details.temperature && <span>🌡️ {todo.details.temperature}</span>}
            {todo.details.humidity && <span>💧 Humidity: {todo.details.humidity}</span>}
            {todo.details.pressure && <span>🌪️ Pressure: {todo.details.pressure}</span>}
            {todo.details.lighting && <span>💡 Lighting: {todo.details.lighting}</span>}
            
            {/* Status & Condition */}
            {todo.details.condition && <span>✅ Condition: {todo.details.condition}</span>}
            {todo.details.qualityStatus && <span>⭐ Quality: {todo.details.qualityStatus}</span>}
            {todo.details.severity && <span>🔴 Severity: {todo.details.severity}</span>}
            {todo.details.statusCode && <span>🏷️ Status: {todo.details.statusCode}</span>}
            
            {/* Safety & Compliance */}
            {todo.details.safetyLevel && <span>🦺 Safety: {todo.details.safetyLevel}</span>}
            {todo.details.complianceStatus && <span>📋 Compliance: {todo.details.complianceStatus}</span>}
            {todo.details.incidentType && <span>🚨 Incident: {todo.details.incidentType}</span>}
            {todo.details.certification && <span>🎓 Cert: {todo.details.certification}</span>}
            
            {/* Communication & Escalation */}
            {todo.details.notificationCount && <span>🔔 Notifications: {todo.details.notificationCount}</span>}
            {todo.details.escalatedBy && <span>📢 Escalated by: {todo.details.escalatedBy}</span>}
            {todo.details.priorityReason && <span>💬 Reason: {todo.details.priorityReason}</span>}
            {todo.details.relatedTodoCount && <span>🔗 Related: {todo.details.relatedTodoCount} todos</span>}
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
            const dismissalCodes = todoType?.dismissalCodes || [];
            // Hide Dismiss button if completionMethod is "none" and there are no dismissal codes
            if (todoType?.completionMethod === 'none' && dismissalCodes.length === 0) {
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