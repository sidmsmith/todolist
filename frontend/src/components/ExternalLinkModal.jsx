import React from 'react';

export const ExternalLinkModal = ({ isOpen, onClose, title, linkText }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p>{linkText || 'Opens WMS Screen'}</p>
          <p style={{ marginTop: '1rem', color: '#666', fontSize: '12px' }}>
            (External link modal - opens WMS record in production)
          </p>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
  );
};