import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SignaturePad } from './SignaturePad';
import { PhotoUpload } from './PhotoUpload';
import { BarcodeScanner } from './BarcodeScanner';

export const CompletionModal = ({ isOpen, todo, todoType, onComplete, onCancel }) => {
  const [formData, setFormData] = useState({});

  // Reset form data when modal opens/closes or todo changes
  useEffect(() => {
    if (isOpen && todo) {
      setFormData({});
    }
  }, [isOpen, todo?.id]);

  if (!isOpen || !todo || ! todoType) return null;

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const validateForm = useCallback(() => {
    if (!todoType?.completionFields) return true; // No fields = valid
    
    // Check all required fields
    for (const field of todoType.completionFields) {
      if (field.required) {
        const value = formData[field.fieldName];
        // Check if value is empty, null, undefined, or empty string
        if (value === null || value === undefined || value === '' || 
            (Array.isArray(value) && value.length === 0)) {
          return false;
        }
      }
    }
    return true;
  }, [todoType, formData]);

  const handleSubmit = useCallback(() => {
    if (!validateForm()) {
      // Show error message or highlight missing fields
      alert('Please fill in all required fields before completing.');
      return;
    }
    onComplete(formData);
  }, [validateForm, onComplete, formData]);

  // Handle Enter key to submit form
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        // Don't submit if user is typing in a textarea
        if (e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          handleSubmit();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isOpen, handleSubmit]);

  // Calculate color for rating based on position in scale (HSL interpolation)
  const getRatingColor = (rating, min, max) => {
    if (min === max) return 'hsl(120, 70%, 50%)'; // Green if only one option
    
    // Calculate position (0 = red, 1 = green)
    const position = (rating - min) / (max - min);
    
    // Interpolate HSL: red (0°) to green (120°)
    const hue = position * 120; // 0° = red, 120° = green
    const saturation = 70;
    const lightness = 50;
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'rating':
        // Determine rating scale (default 1-5, or use field options)
        const minRating = field.min || 1;
        const maxRating = field.max || 5;
        const ratings = Array.from({ length: maxRating - minRating + 1 }, (_, i) => minRating + i);
        
        return (
          <div key={field.fieldName} className={`form-group ${field.required ? 'required-field' : ''}`}>
            <label>{field. label} {field.required && <span className="required-asterisk">*</span>}</label>
            <div className="rating-group">
              {ratings.map(rating => {
                const isSelected = formData[field.fieldName] === rating;
                const color = getRatingColor(rating, minRating, maxRating);
                
                return (
                  <button
                    key={rating}
                    type="button"
                    className={`rating-btn ${isSelected ? 'active' : ''}`}
                    style={{
                      backgroundColor: color,
                      color: 'white',
                      borderColor: isSelected ? color : 'rgba(0, 0, 0, 0.2)',
                      '--rating-color': color,
                      boxShadow: isSelected 
                        ? `0 0 0 2px rgba(255, 255, 255, 0.8), 0 0 0 4px ${color}, 0 0 12px ${color}, 0 4px 8px rgba(0, 0, 0, 0.3)`
                        : '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInputChange(field.fieldName, rating);
                    }}
                  >
                    {rating}
                  </button>
                );
              })}
            </div>
          </div>
        );
      
      case 'textarea':
        return (
          <div key={field.fieldName} className={`form-group ${field.required ? 'required-field' : ''}`}>
            <label>{field.label} {field.required ? <span className="required-asterisk">*</span> : '(optional)'}</label>
            <textarea
              value={formData[field. fieldName] || ''}
              onChange={(e) => handleInputChange(field. fieldName, e.target.value)}
              rows="3"
              required={field.required}
            />
          </div>
        );
      
      case 'select':
        return (
          <div key={field.fieldName} className={`form-group ${field.required ? 'required-field' : ''}`}>
            <label>{field.label} {field.required && <span className="required-asterisk">*</span>}</label>
            <select
              value={formData[field.fieldName] || ''}
              onChange={(e) => handleInputChange(field.fieldName, e.target. value)}
              required={field. required}
            >
              <option value="">-- Select --</option>
              {field.options && field.options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        );
      
      case 'number':
        return (
          <div key={field.fieldName} className={`form-group ${field.required ? 'required-field' : ''}`}>
            <label>{field.label} {field.required ? <span className="required-asterisk">*</span> : '(optional)'}</label>
            <input
              type="number"
              value={formData[field.fieldName] || ''}
              onChange={(e) => handleInputChange(field.fieldName, e.target.value ? parseFloat(e.target.value) : '')}
              min={field.min}
              max={field.max}
              step={field.step || 1}
              required={field.required}
            />
          </div>
        );
      
      case 'date':
        return (
          <div key={field.fieldName} className={`form-group ${field.required ? 'required-field' : ''}`}>
            <label>{field.label} {field.required ? <span className="required-asterisk">*</span> : '(optional)'}</label>
            <input
              type="date"
              value={formData[field.fieldName] || ''}
              onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
              required={field.required}
            />
          </div>
        );
      
      case 'datetime':
        return (
          <div key={field.fieldName} className={`form-group ${field.required ? 'required-field' : ''}`}>
            <label>{field.label} {field.required ? <span className="required-asterisk">*</span> : '(optional)'}</label>
            <input
              type="datetime-local"
              value={formData[field.fieldName] || ''}
              onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
              required={field.required}
            />
          </div>
        );
      
      case 'signature':
        return (
          <SignaturePad
            key={field.fieldName}
            field={field}
            value={formData[field.fieldName]}
            onChange={(value) => handleInputChange(field.fieldName, value)}
            required={field.required}
          />
        );
      
      case 'photo':
        return (
          <PhotoUpload
            key={field.fieldName}
            field={field}
            value={formData[field.fieldName]}
            onChange={(value) => handleInputChange(field.fieldName, value)}
            required={field.required}
          />
        );
      
      case 'barcode':
      case 'qr':
        return (
          <BarcodeScanner
            key={field.fieldName}
            field={field}
            value={formData[field.fieldName] || ''}
            onChange={(value) => handleInputChange(field.fieldName, value)}
            required={field.required}
          />
        );
      
      case 'text':
      default:
        return (
          <div key={field.fieldName} className={`form-group ${field.required ? 'required-field' : ''}`}>
            <label>{field.label} {field.required ? <span className="required-asterisk">*</span> : '(optional)'}</label>
            <input
              type="text"
              value={formData[field.fieldName] || ''}
              onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
              required={field.required}
            />
          </div>
        );
    }
  };

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Complete: {todo.title}</h2>
          <button className="modal-close" onClick={handleCancel}>✕</button>
        </div>

        <div className="modal-body">
          <p className="todo-meta">
            Due: {new Date(todo. dueTime).toLocaleString()} | Assigned to: {todo.assignmentGroup}
          </p>

          {todoType. completionFields && todoType.completionFields.length > 0 ?  (
            <form>
              {todoType.completionFields.map(field => renderField(field))}
            </form>
          ) : (
            <p>Click Complete to mark this todo as done.</p>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" onClick={handleCancel} className="btn btn-secondary">Cancel</button>
          <button type="button" onClick={handleSubmit} className="btn btn-primary">Complete</button>
        </div>
      </div>
    </div>
  );
};