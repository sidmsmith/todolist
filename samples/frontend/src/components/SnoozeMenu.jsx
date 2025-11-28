import React, { useState } from 'react';

export const SnoozeMenu = ({ onSnooze, onClose }) => {
  const [showCustom, setShowCustom] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');

  const handleSnooze = (minutes) => {
    onSnooze(minutes);
    onClose();
  };

  return (
    <div className="snooze-menu">
      <div className="menu-title">Snooze Until:</div>
      <button onClick={() => handleSnooze(15)}>15 minutes</button>
      <button onClick={() => handleSnooze(30)}>30 minutes</button>
      <button onClick={() => handleSnooze(60)}>1 hour</button>
      <button onClick={() => handleSnooze(240)}>4 hours</button>
      <button onClick={() => {
        const eod = new Date();
        eod.setHours(17, 0, 0, 0);
        if (eod <= new Date()) eod.setDate(eod. getDate() + 1);
        const minutes = Math.floor((eod - new Date()) / 60000);
        handleSnooze(minutes);
      }}>Until end of shift</button>
      <button onClick={() => setShowCustom(! showCustom)}>Custom... </button>
      
      {showCustom && (
        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
          <input
            type="number"
            min="1"
            placeholder="Minutes"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && customMinutes) {
                handleSnooze(parseInt(customMinutes));
              }
            }}
          />
          {customMinutes && (
            <button onClick={() => handleSnooze(parseInt(customMinutes))}>
              Confirm
            </button>
          )}
        </div>
      )}
    </div>
  );
};