import React, { useState, useEffect } from 'react';
import { TodoTypeEditor } from './TodoTypeEditor';

const API_BASE = import.meta.env.DEV 
  ? 'http://localhost:5000/api'
  : '/api';

export const TodoTypeManager = ({ isOpen, onClose }) => {
  const [todoTypes, setTodoTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTodoTypes();
    }
  }, [isOpen]);

  const fetchTodoTypes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/todo-types`);
      if (!response.ok) throw new Error('Failed to fetch todo types');
      const data = await response.json();
      setTodoTypes(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingType(null);
    setShowEditor(true);
  };

  const handleEdit = (todoType) => {
    setEditingType(todoType);
    setShowEditor(true);
  };

  const handleDelete = async (id) => {
    if (!confirm(`Are you sure you want to delete todo type "${id}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/todo-types/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete todo type');
      await fetchTodoTypes();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleSave = async (todoTypeData) => {
    try {
      const isEdit = !!editingType;
      const url = isEdit 
        ? `${API_BASE}/todo-types/${editingType.id}`
        : `${API_BASE}/todo-types`;
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoTypeData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to save todo type');
      }

      setShowEditor(false);
      setEditingType(null);
      await fetchTodoTypes();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content todo-type-manager" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '90vh' }}>
          <div className="modal-header todo-type-manager-header">
            <h2>Manage Todo Types</h2>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>

          <div className="modal-body" style={{ maxHeight: '70vh', overflow: 'auto' }}>
            {loading && <p>Loading...</p>}
            {error && <p className="error-text">Error: {error}</p>}

            <div className="manager-actions">
              <button onClick={handleCreate} className="btn btn-primary">
                + Create New Todo Type
              </button>
            </div>

            {todoTypes.length === 0 && !loading ? (
              <p className="empty-state">No todo types found. Create one to get started.</p>
            ) : (
              <table className="todo-types-table">
                <thead>
                  <tr className="table-header-row">
                    <th>ID</th>
                    <th>Name</th>
                    <th>Priority</th>
                    <th>Completion Method</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {todoTypes.map(type => (
                    <tr key={type.id}>
                      <td><code>{type.id}</code></td>
                      <td>{type.name}</td>
                      <td>{type.priority}</td>
                      <td>{type.completionMethod}</td>
                      <td>
                        <button onClick={() => handleEdit(type)} className="btn btn-sm btn-primary">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(type.id)} className="btn btn-sm btn-danger" style={{ marginLeft: '8px' }}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="modal-footer">
            <button onClick={onClose} className="btn btn-secondary">Close</button>
          </div>
        </div>
      </div>

      {showEditor && (
        <TodoTypeEditor
          isOpen={showEditor}
          onClose={() => {
            setShowEditor(false);
            setEditingType(null);
          }}
          todoType={editingType}
          onSave={handleSave}
        />
      )}
    </>
  );
};

