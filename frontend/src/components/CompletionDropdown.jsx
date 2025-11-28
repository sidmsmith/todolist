import React, { useState } from 'react';

export const CompletionDropdown = ({ codes, onComplete, onClose }) => {
  const [showOther, setShowOther] = useState(false);
  const [otherText, setOtherText] = useState('');

  const handleComplete = (reasonCode, reasonText = null) => {
    onComplete(reasonCode, reasonText);
    onClose();
  };

  return (
    <div className="completion-dropdown-menu">
      {codes && codes.map((code) => (
        <button
          key={code.code}
          onClick={() => {
            if (code.code === 'other') {
              setShowOther(true);
            } else {
              handleComplete(code.code, code.label);
            }
          }}
        >
          {code.label}
        </button>
      ))}
      
      {showOther && (
        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
          <textarea
            placeholder="Enter reason..."
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            rows="3"
            style={{ width: '100%', fontSize: '12px' }}
          />
          {otherText && (
            <button onClick={() => handleComplete('other', otherText)}>
              Confirm
            </button>
          )}
        </div>
      )}
    </div>
  );
};

