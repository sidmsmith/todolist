import React, { useRef, useEffect, useState } from 'react';

export const SignaturePad = ({ field, value, onChange, required }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, []);

  // Freeze screen scrolling on mobile when drawing
  useEffect(() => {
    if (isDrawing) {
      // Prevent body scroll and touch scrolling
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      const originalPosition = document.body.style.position;
      
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      
      // Also prevent scrolling on modal overlay
      const modalOverlay = document.querySelector('.modal-overlay');
      if (modalOverlay) {
        modalOverlay.style.overflow = 'hidden';
        modalOverlay.style.touchAction = 'none';
      }
      
      return () => {
        // Restore original styles when done drawing
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
        document.body.style.position = originalPosition;
        document.body.style.width = '';
        
        if (modalOverlay) {
          modalOverlay.style.overflow = '';
          modalOverlay.style.touchAction = '';
        }
      };
    }
  }, [isDrawing]);

  const startDrawing = (e) => {
    // Prevent default to stop scrolling
    if (e.touches) {
      e.preventDefault();
    }
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const y = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    ctx.beginPath();
    ctx.moveTo(x - rect.left, y - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    // Prevent default to stop scrolling
    if (e.touches) {
      e.preventDefault();
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const y = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    ctx.lineTo(x - rect.left, y - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL();
      onChange(dataURL);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onChange('');
    }
  };

  return (
    <div className={`form-group ${required ? 'required-field' : ''}`}>
      <label>{field.label} {required && <span className="required-asterisk">*</span>}</label>
      <div className="signature-pad-container">
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={(e) => {
            e.preventDefault();
            startDrawing(e);
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            draw(e);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            stopDrawing();
          }}
          style={{
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'crosshair',
            backgroundColor: '#fff',
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <button type="button" onClick={clearSignature} style={{ padding: '4px 12px' }}>
            Clear
          </button>
          {value && (
            <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
              ✍️ Signature captured (not saved - testing mode)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

