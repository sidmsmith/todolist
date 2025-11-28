import React, { useState } from 'react';

export const CompletionModal = ({ isOpen, todo, todoType, onComplete, onCancel }) => {
  const [formData, setFormData] = useState({});

  if (!isOpen || !todo || ! todoType) return null;

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = () => {
    onComplete(formData);
  };

  const renderField = (field) => {
    switch (field. type) {
      case 'rating':
        return (
          <div key={field.fieldName} className="form-group">
            <label>{field. label}</label>
            <div className="rating-group">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  className={`rating-btn ${formData[field.fieldName] === rating ? 'active' : ''}`}
                  onClick={() => handleInputChange(field.fieldName, rating)}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>
        );
      
      case 'textarea':
        return (
          <div key={field.fieldName} className="form-group">
            <label>{field.label} {! field.required && '(optional)'}</label>
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
          <div key={field.fieldName} className="form-group">
            <label>{field.label}</label>
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
      
      case 'text':
      default:
        return (
          <div key={field.fieldName} className="form-group">
            <label>{field.label} {!field.required && '(optional)'}</label>
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
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Complete: {todo.title}</h2>
          <button className="modal-close" onClick={onCancel}>✕</button>
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
          <button onClick={onCancel} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSubmit} className="btn btn-primary">Complete</button>
        </div>
      </div>
    </div>
  );
};