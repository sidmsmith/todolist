import React, { useState, useEffect } from 'react';

// Drag and Drop List Component
const DragDropList = ({ items, onReorder, renderItem }) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onReorder(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <>
      {items.map((item, index) => (
        <div
          key={index}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`${draggedIndex === index ? 'dragging' : ''} ${dragOverIndex === index ? 'drag-over' : ''}`}
        >
          {renderItem(item, index)}
        </div>
      ))}
    </>
  );
};

const COMPLETION_METHODS = [
  { value: 'auto', label: 'Auto' },
  { value: 'modal', label: 'Modal' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'none', label: 'None' }
];

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Select' },
  { value: 'rating', label: 'Rating' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'datetime', label: 'Date/Time' },
  { value: 'signature', label: 'Signature' },
  { value: 'photo', label: 'Photo' },
  { value: 'barcode', label: 'Barcode' },
  { value: 'qr', label: 'QR Code' }
];

const PRIORITIES = [
  { value: 1, label: '1 - Critical' },
  { value: 2, label: '2 - High' },
  { value: 3, label: '3 - Medium' },
  { value: 4, label: '4 - Low' }
];

export const TodoTypeEditor = ({ isOpen, onClose, todoType, onSave }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    priority: 3,
    completionMethod: 'auto',
    completionFields: [],
    dismissalCodes: [],
    completionCodes: [],
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (isOpen) {
      if (todoType) {
        // Edit mode
        setFormData({
          id: todoType.id || '',
          name: todoType.name || '',
          priority: todoType.priority || 3,
          completionMethod: todoType.completionMethod || 'auto',
          completionFields: todoType.completionFields || [],
          dismissalCodes: Array.isArray(todoType.dismissalCodes) ? todoType.dismissalCodes : (todoType.dismissalCodes === 'none' ? [] : []),
          completionCodes: todoType.completionCodes || [],
          notes: todoType.notes || ''
        });
      } else {
        // Create mode
        setFormData({
          id: '',
          name: '',
          priority: 3,
          completionMethod: 'auto',
          completionFields: [],
          dismissalCodes: [],
          completionCodes: [],
          notes: ''
        });
      }
      setErrors({});
      setActiveTab('basic');
    }
  }, [isOpen, todoType]);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.id.trim()) {
      newErrors.id = 'ID is required';
    } else if (!/^[a-z0-9_]+$/.test(formData.id)) {
      newErrors.id = 'ID must be lowercase letters, numbers, and underscores only';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Validate completion fields
    formData.completionFields.forEach((field, index) => {
      if (!field.fieldName?.trim()) {
        newErrors[`field_${index}_name`] = 'Field name is required';
      }
      if (!field.label?.trim()) {
        newErrors[`field_${index}_label`] = 'Label is required';
      }
      if (field.type === 'select' && (!field.options || field.options.length === 0)) {
        newErrors[`field_${index}_options`] = 'Select fields require at least one option';
      }
    });

    // Validate dismissal codes
    formData.dismissalCodes.forEach((code, index) => {
      if (!code.code?.trim()) {
        newErrors[`dismissal_${index}_code`] = 'Code is required';
      }
      if (!code.label?.trim()) {
        newErrors[`dismissal_${index}_label`] = 'Label is required';
      }
    });

    // Validate completion codes (for dropdown method)
    if (formData.completionMethod === 'dropdown') {
      if (!formData.completionCodes || formData.completionCodes.length === 0) {
        newErrors.completionCodes = 'Completion codes are required for dropdown method';
      } else {
        formData.completionCodes.forEach((code, index) => {
          if (!code.code?.trim()) {
            newErrors[`completion_${index}_code`] = 'Code is required';
          }
          if (!code.label?.trim()) {
            newErrors[`completion_${index}_label`] = 'Label is required';
          }
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    const dataToSave = {
      ...formData,
      dismissalCodes: formData.dismissalCodes.length > 0 ? formData.dismissalCodes : 'none'
    };

    onSave(dataToSave);
  };

  const addCompletionField = () => {
    setFormData(prev => ({
      ...prev,
      completionFields: [...prev.completionFields, {
        fieldName: '',
        type: 'text',
        label: '',
        required: false
      }]
    }));
  };

  const updateCompletionField = (index, updates) => {
    setFormData(prev => ({
      ...prev,
      completionFields: prev.completionFields.map((field, i) => 
        i === index ? { ...field, ...updates } : field
      )
    }));
  };

  const removeCompletionField = (index) => {
    setFormData(prev => ({
      ...prev,
      completionFields: prev.completionFields.filter((_, i) => i !== index)
    }));
  };

  const addFieldOption = (fieldIndex) => {
    setFormData(prev => ({
      ...prev,
      completionFields: prev.completionFields.map((field, i) => 
        i === fieldIndex 
          ? { ...field, options: [...(field.options || []), ''] }
          : field
      )
    }));
  };

  const updateFieldOption = (fieldIndex, optionIndex, value) => {
    setFormData(prev => ({
      ...prev,
      completionFields: prev.completionFields.map((field, i) => 
        i === fieldIndex 
          ? { 
              ...field, 
              options: field.options.map((opt, oi) => oi === optionIndex ? value : opt)
            }
          : field
      )
    }));
  };

  const removeFieldOption = (fieldIndex, optionIndex) => {
    setFormData(prev => ({
      ...prev,
      completionFields: prev.completionFields.map((field, i) => 
        i === fieldIndex 
          ? { ...field, options: field.options.filter((_, oi) => oi !== optionIndex) }
          : field
      )
    }));
  };

  const addDismissalCode = () => {
    setFormData(prev => ({
      ...prev,
      dismissalCodes: [...prev.dismissalCodes, { code: '', label: '' }]
    }));
  };

  const updateDismissalCode = (index, updates) => {
    setFormData(prev => ({
      ...prev,
      dismissalCodes: prev.dismissalCodes.map((code, i) => 
        i === index ? { ...code, ...updates } : code
      )
    }));
  };

  const removeDismissalCode = (index) => {
    setFormData(prev => ({
      ...prev,
      dismissalCodes: prev.dismissalCodes.filter((_, i) => i !== index)
    }));
  };

  const moveDismissalCode = (fromIndex, toIndex) => {
    setFormData(prev => {
      const codes = [...prev.dismissalCodes];
      const [moved] = codes.splice(fromIndex, 1);
      codes.splice(toIndex, 0, moved);
      return { ...prev, dismissalCodes: codes };
    });
  };

  const addCompletionCode = () => {
    setFormData(prev => ({
      ...prev,
      completionCodes: [...prev.completionCodes, { code: '', label: '' }]
    }));
  };

  const updateCompletionCode = (index, updates) => {
    setFormData(prev => ({
      ...prev,
      completionCodes: prev.completionCodes.map((code, i) => 
        i === index ? { ...code, ...updates } : code
      )
    }));
  };

  const removeCompletionCode = (index) => {
    setFormData(prev => ({
      ...prev,
      completionCodes: prev.completionCodes.filter((_, i) => i !== index)
    }));
  };

  const moveCompletionCode = (fromIndex, toIndex) => {
    setFormData(prev => {
      const codes = [...prev.completionCodes];
      const [moved] = codes.splice(fromIndex, 1);
      codes.splice(toIndex, 0, moved);
      return { ...prev, completionCodes: codes };
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content todo-type-editor" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
        <div className="modal-header">
          <h2>{todoType ? 'Edit' : 'Create'} Todo Type</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Tabs */}
          <div className="editor-tabs">
            <button 
              className={activeTab === 'basic' ? 'active' : ''} 
              onClick={() => setActiveTab('basic')}
            >
              Basic Info
            </button>
            {formData.completionMethod !== 'dropdown' && (
              <button 
                className={activeTab === 'fields' ? 'active' : ''} 
                onClick={() => setActiveTab('fields')}
              >
                Completion Fields
              </button>
            )}
            <button 
              className={activeTab === 'dismissal' ? 'active' : ''} 
              onClick={() => setActiveTab('dismissal')}
            >
              Dismissal Codes
            </button>
            {formData.completionMethod === 'dropdown' && (
              <button 
                className={activeTab === 'completion' ? 'active' : ''} 
                onClick={() => setActiveTab('completion')}
              >
                Completion Codes
              </button>
            )}
          </div>

          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="editor-section">
              <div className="form-group">
                <label>ID * {errors.id && <span className="error-text">({errors.id})</span>}</label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                  disabled={!!todoType}
                  placeholder="e.g., meeting, inspection"
                  className={errors.id ? 'error' : ''}
                />
                <small>Lowercase letters, numbers, and underscores only. Cannot be changed after creation.</small>
              </div>

              <div className="form-group">
                <label>Name * {errors.name && <span className="error-text">({errors.name})</span>}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Team Meeting, Safety Inspection"
                  className={errors.name ? 'error' : ''}
                />
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                >
                  {PRIORITIES.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Completion Method</label>
                <select
                  value={formData.completionMethod}
                  onChange={(e) => {
                    const method = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      completionMethod: method,
                      completionCodes: method === 'dropdown' ? prev.completionCodes : []
                    }));
                    if (method !== 'dropdown') {
                      setActiveTab('basic');
                    }
                  }}
                >
                  {COMPLETION_METHODS.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows="3"
                  placeholder="Additional notes about this todo type..."
                />
              </div>
            </div>
          )}

          {/* Completion Fields Tab */}
          {activeTab === 'fields' && (
            <div className="editor-section">
              <div className="section-header">
                <h3>Completion Fields</h3>
                <button type="button" onClick={addCompletionField} className="btn btn-sm btn-primary">
                  + Add Field
                </button>
              </div>

              {formData.completionFields.length === 0 ? (
                <p className="empty-state">No completion fields. Click "Add Field" to add one.</p>
              ) : (
                <DragDropList
                  items={formData.completionFields}
                  onReorder={moveCompletionField}
                  renderItem={(field, index) => (
                    <div className="field-builder-card">
                      <div className="field-builder-header">
                        <strong>Field {index + 1}</strong>
                        <button type="button" onClick={() => removeCompletionField(index)} className="btn btn-sm btn-danger">
                          Remove
                        </button>
                      </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Field Name * {errors[`field_${index}_name`] && <span className="error-text">({errors[`field_${index}_name`]})</span>}</label>
                        <input
                          type="text"
                          value={field.fieldName || ''}
                          onChange={(e) => updateCompletionField(index, { fieldName: e.target.value })}
                          placeholder="e.g., cleanliness_score"
                          className={errors[`field_${index}_name`] ? 'error' : ''}
                        />
                      </div>

                      <div className="form-group">
                        <label>Label * {errors[`field_${index}_label`] && <span className="error-text">({errors[`field_${index}_label`]})</span>}</label>
                        <input
                          type="text"
                          value={field.label || ''}
                          onChange={(e) => updateCompletionField(index, { label: e.target.value })}
                          placeholder="e.g., Cleanliness Score"
                          className={errors[`field_${index}_label`] ? 'error' : ''}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Type</label>
                        <select
                          value={field.type || 'text'}
                          onChange={(e) => {
                            const type = e.target.value;
                            const updates = { type };
                            // Clear type-specific fields when changing type
                            if (type !== 'select') delete updates.options;
                            if (type !== 'rating' && type !== 'number') {
                              delete updates.min;
                              delete updates.max;
                              delete updates.step;
                            }
                            updateCompletionField(index, updates);
                          }}
                        >
                          {FIELD_TYPES.map(ft => (
                            <option key={ft.value} value={ft.value}>{ft.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={field.required || false}
                            onChange={(e) => updateCompletionField(index, { required: e.target.checked })}
                          />
                          Required
                        </label>
                      </div>
                    </div>

                    {/* Select options */}
                    {field.type === 'select' && (
                      <div className="form-group">
                        <label>Options * {errors[`field_${index}_options`] && <span className="error-text">({errors[`field_${index}_options`]})</span>}</label>
                        {(field.options || []).map((option, optIndex) => (
                          <div key={optIndex} className="option-row">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateFieldOption(index, optIndex, e.target.value)}
                              placeholder="Option value"
                            />
                            <button type="button" onClick={() => removeFieldOption(index, optIndex)}>×</button>
                          </div>
                        ))}
                        <button type="button" onClick={() => addFieldOption(index)} className="btn btn-sm">
                          + Add Option
                        </button>
                      </div>
                    )}

                    {/* Rating/Number min/max/step */}
                    {(field.type === 'rating' || field.type === 'number') && (
                      <div className="form-row">
                        <div className="form-group">
                          <label>Min</label>
                          <input
                            type="number"
                            value={field.min || ''}
                            onChange={(e) => updateCompletionField(index, { min: e.target.value ? parseFloat(e.target.value) : undefined })}
                          />
                        </div>
                        <div className="form-group">
                          <label>Max</label>
                          <input
                            type="number"
                            value={field.max || ''}
                            onChange={(e) => updateCompletionField(index, { max: e.target.value ? parseFloat(e.target.value) : undefined })}
                          />
                        </div>
                        {field.type === 'number' && (
                          <div className="form-group">
                            <label>Step</label>
                            <input
                              type="number"
                              value={field.step || ''}
                              onChange={(e) => updateCompletionField(index, { step: e.target.value ? parseFloat(e.target.value) : undefined })}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    </div>
                  )}
                />
              )}
            </div>
          )}

          {/* Dismissal Codes Tab */}
          {activeTab === 'dismissal' && (
            <div className="editor-section">
              <div className="section-header">
                <h3>Dismissal Codes</h3>
                <button type="button" onClick={addDismissalCode} className="btn btn-sm btn-primary">
                  + Add Code
                </button>
              </div>

              {formData.dismissalCodes.length === 0 ? (
                <p className="empty-state">No dismissal codes. Leave empty to set to "none".</p>
              ) : (
                <DragDropList
                  items={formData.dismissalCodes}
                  onReorder={moveDismissalCode}
                  renderItem={(code, index) => (
                    <div className="code-builder-row">
                      <div className="form-group">
                        <label>Code * {errors[`dismissal_${index}_code`] && <span className="error-text">({errors[`dismissal_${index}_code`]})</span>}</label>
                        <input
                          type="text"
                          value={code.code || ''}
                          onChange={(e) => updateDismissalCode(index, { code: e.target.value })}
                          placeholder="e.g., false_alert"
                          className={errors[`dismissal_${index}_code`] ? 'error' : ''}
                        />
                      </div>
                      <div className="form-group">
                        <label>Label * {errors[`dismissal_${index}_label`] && <span className="error-text">({errors[`dismissal_${index}_label`]})</span>}</label>
                        <input
                          type="text"
                          value={code.label || ''}
                          onChange={(e) => updateDismissalCode(index, { label: e.target.value })}
                          placeholder="e.g., False Alarm"
                          className={errors[`dismissal_${index}_label`] ? 'error' : ''}
                        />
                      </div>
                      <button type="button" onClick={() => removeDismissalCode(index)} className="btn btn-sm btn-danger">
                        Remove
                      </button>
                    </div>
                  )}
                />
              )}
            </div>
          )}

          {/* Completion Codes Tab (only for dropdown method) */}
          {activeTab === 'completion' && formData.completionMethod === 'dropdown' && (
            <div className="editor-section">
              <div className="section-header">
                <h3>Completion Codes</h3>
                <button type="button" onClick={addCompletionCode} className="btn btn-sm btn-primary">
                  + Add Code
                </button>
              </div>

              {errors.completionCodes && <p className="error-text">{errors.completionCodes}</p>}

              {formData.completionCodes.length === 0 ? (
                <p className="empty-state">No completion codes. Add at least one for dropdown method.</p>
              ) : (
                <DragDropList
                  items={formData.completionCodes}
                  onReorder={moveCompletionCode}
                  renderItem={(code, index) => (
                    <div className="code-builder-row">
                      <div className="form-group">
                        <label>Code * {errors[`completion_${index}_code`] && <span className="error-text">({errors[`completion_${index}_code`]})</span>}</label>
                        <input
                          type="text"
                          value={code.code || ''}
                          onChange={(e) => updateCompletionCode(index, { code: e.target.value })}
                          placeholder="e.g., passed"
                          className={errors[`completion_${index}_code`] ? 'error' : ''}
                        />
                      </div>
                      <div className="form-group">
                        <label>Label * {errors[`completion_${index}_label`] && <span className="error-text">({errors[`completion_${index}_label`]})</span>}</label>
                        <input
                          type="text"
                          value={code.label || ''}
                          onChange={(e) => updateCompletionCode(index, { label: e.target.value })}
                          placeholder="e.g., Passed"
                          className={errors[`completion_${index}_label`] ? 'error' : ''}
                        />
                      </div>
                      <button type="button" onClick={() => removeCompletionCode(index)} className="btn btn-sm btn-danger">
                        Remove
                      </button>
                    </div>
                  )}
                />
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button type="button" onClick={handleSave} className="btn btn-primary">Save</button>
        </div>
      </div>
    </div>
  );
};

