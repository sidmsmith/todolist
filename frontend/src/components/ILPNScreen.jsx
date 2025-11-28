import React, { useState, useEffect } from 'react';
import { useTodoList } from '../hooks/useTodoList';
import { CustomTooltip } from './CustomTooltip';
import './ILPNScreen.css';

export const ILPNScreen = () => {
  const { todos: todosFromHook, getTodoTypeById, refetch } = useTodoList();
  const [todos, setTodos] = useState([]);
  
  // Fetch all todos for To Dos screen (including completed/dismissed)
  useEffect(() => {
    const fetchAllTodos = async () => {
      try {
        const API_BASE = import.meta.env.DEV ? 'http://localhost:5000/api' : '/api';
        // Don't pass userId when includeAll=true to avoid any user-specific filtering
        const response = await fetch(`${API_BASE}/todos?includeAll=true`);
        const data = await response.json();
        console.log(`Fetched ${data.data?.length || 0} todos for To Dos screen`);
        setTodos(data.data || []);
      } catch (err) {
        console.error('Error fetching all todos:', err);
        // Fallback to regular todos if fetch fails
        setTodos(todosFromHook);
      }
    };
    fetchAllTodos();
  }, [todosFromHook]);
  const [filters, setFilters] = useState({
    filter1: '',
    filter2: '',
    filter3: '',
    filter4: ''
  });

  // Helper function to get active snoozes
  const getActiveSnoozes = (todo) => {
    if (!todo.snoozes || !Array.isArray(todo.snoozes)) return [];
    const now = new Date();
    return todo.snoozes.filter(snooze => {
      const snoozeTime = new Date(snooze.snoozedUntil);
      return now < snoozeTime;
    });
  };

  // Helper function to format snoozed display
  const getSnoozedDisplay = (todo) => {
    if (todo.status !== 'Open') return null;
    
    const activeSnoozes = getActiveSnoozes(todo);
    
    if (activeSnoozes.length === 0) {
      return { text: 'No', needsTooltip: false };
    } else if (activeSnoozes.length === 1) {
      return { text: activeSnoozes[0].userId, needsTooltip: false };
    } else {
      return { text: 'MULTIPLE', needsTooltip: true };
    }
  };

  // Helper function to get snoozed tooltip content
  const getSnoozedTooltipContent = (todo) => {
    const activeSnoozes = getActiveSnoozes(todo);
    if (activeSnoozes.length <= 1) return null;
    
    return (
      <div>
        <div className="tooltip-title">Snoozed By:</div>
        <ul>
          {activeSnoozes.map((snooze, index) => (
            <li key={index}>{snooze.userId}</li>
          ))}
        </ul>
      </div>
    );
  };

  // Helper function to get details display
  const getDetailsDisplay = (todo) => {
    if (!todo.details || typeof todo.details !== 'object') return null;
    
    const detailKeys = Object.keys(todo.details);
    if (detailKeys.length === 0) return null;
    
    if (detailKeys.length === 1) {
      const key = detailKeys[0];
      const value = todo.details[key];
      return { text: `${key}: ${value}`, needsTooltip: false };
    } else {
      return { text: 'MULTIPLE', needsTooltip: true };
    }
  };

  // Helper function to get details tooltip content
  const getDetailsTooltipContent = (todo) => {
    if (!todo.details || typeof todo.details !== 'object') return null;
    
    const detailKeys = Object.keys(todo.details);
    if (detailKeys.length <= 1) return null;
    
    return (
      <div>
        <div className="tooltip-title">Details:</div>
        <ul>
          {detailKeys.map((key) => (
            <li key={key}>
              <span className="tooltip-item-label">{key}:</span>
              {String(todo.details[key])}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Helper function to format text to capitalize first letter, rest lowercase
  const formatCase = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  // Helper function to format reason with human-readable labels from todotype
  const formatReason = (todo) => {
    const todoType = getTodoTypeById(todo.typeId);
    
    if (todo.status === 'Completed') {
      if (todo.completionData) {
        if (typeof todo.completionData === 'object' && todoType?.completionFields) {
          // Build human-readable string from completionFields
          const parts = [];
          Object.keys(todo.completionData).forEach(key => {
            const field = todoType.completionFields.find(f => f.fieldName === key);
            const label = field ? field.label : key;
            const value = todo.completionData[key];
            parts.push(`${label}: ${value}`);
          });
          return parts.length > 0 ? parts.join(', ') : JSON.stringify(todo.completionData);
        }
        return typeof todo.completionData === 'object' 
          ? JSON.stringify(todo.completionData)
          : String(todo.completionData);
      }
      return 'N/A';
    } else if (todo.status === 'Dismissed') {
      if (todo.dismissalReason && todoType?.dismissalCodes) {
        // Find the label for the dismissal code
        const dismissalCode = todoType.dismissalCodes.find(dc => dc.code === todo.dismissalReason);
        return dismissalCode ? dismissalCode.label : todo.dismissalReason;
      }
      return todo.dismissalReason || 'N/A';
    }
    return 'N/A';
  };

  // Helper function to get priority display
  const getPriorityDisplay = (priority) => {
    const priorityMap = {
      1: 'Critical',
      2: 'High',
      3: 'Medium',
      4: 'Low'
    };
    return priorityMap[priority] || `Priority ${priority}`;
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleCardArrowClick = (cardId) => {
    // Placeholder for future pull-out menu functionality
    console.log('Card arrow clicked for card:', cardId);
  };

  return (
    <div className="ilpn-screen">
      {/* Header */}
      <header className="ilpn-header">
        <div className="header-left">
          <button className="menu-toggle">☰</button>
          <h1 className="header-title">To Dos</h1>
        </div>
        <div className="header-center">
          <span>Org: SS-DEMO | Profile: SS-DEMO | Facility: SS-DEMO-DM1</span>
        </div>
        <div className="header-right">
          <button className="header-icon" title="Favorites">★</button>
          <button className="header-icon" title="Folder">📁</button>
          <button className="header-icon" title="Search">🔍</button>
          <button className="header-icon" title="Chat">💬</button>
          <button className="header-icon" title="Profile">👤</button>
          <button className="header-icon" title="Refresh">🔄</button>
          <button className="header-icon" title="Settings">⚙️</button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="ilpn-main-content">
        {/* Left Sidebar - Filters */}
        <aside className="ilpn-filters-panel">
          <div className="filters-header">
            <h2 className="filters-title">
              FILTERS
              <span className="filter-count">1</span>
            </h2>
            <div className="filters-header-actions">
              <button className="clear-all-btn">Clear All</button>
              <button className="settings-icon">⚙️</button>
            </div>
          </div>

          <div className="filters-tabs">
            <button className="filter-tab active">Basic</button>
            <button className="filter-tab">Advanced</button>
          </div>

          <div className="filters-content">
            <div className="filter-section">
              <label className="filter-label">Select Saved Filter</label>
              <div className="filter-input-group">
                <input 
                  type="text" 
                  className="filter-input"
                  placeholder="Select Saved Filter"
                />
                <button className="filter-bookmark-icon">🔖</button>
              </div>
            </div>

            <div className="filter-section">
              <label className="filter-label">Filter 1</label>
              <div className="filter-input-group">
                <input 
                  type="text" 
                  className="filter-input"
                  placeholder="Search..."
                  value={filters.filter1}
                  onChange={(e) => handleFilterChange('filter1', e.target.value)}
                />
                <button className="filter-search-icon">🔍</button>
                <button className="filter-clear-btn">Clear</button>
              </div>
            </div>

            <div className="filter-section">
              <label className="filter-label">Filter 2</label>
              <div className="filter-checkbox-group">
                <label className="filter-checkbox-label">
                  <input type="checkbox" />
                  <span>Option 1</span>
                </label>
                <label className="filter-checkbox-label">
                  <input type="checkbox" />
                  <span>Option 2</span>
                </label>
                <label className="filter-checkbox-label">
                  <input type="checkbox" checked />
                  <span>Option 3</span>
                </label>
                <label className="filter-checkbox-label">
                  <input type="checkbox" />
                  <span>Option 4</span>
                </label>
              </div>
            </div>

            <div className="filter-section">
              <label className="filter-label">Filter 3</label>
              <div className="filter-input-group">
                <input 
                  type="text" 
                  className="filter-input"
                  placeholder="Search..."
                  value={filters.filter3}
                  onChange={(e) => handleFilterChange('filter3', e.target.value)}
                />
                <button className="filter-search-icon">🔍</button>
              </div>
              <div className="filter-buttons">
                <button className="filter-btn">IS NULL</button>
                <button className="filter-btn">NOT NULL</button>
              </div>
            </div>

            <div className="filter-section">
              <label className="filter-label">Filter 4</label>
              <div className="filter-input-group">
                <input 
                  type="text" 
                  className="filter-input"
                  placeholder="Search..."
                  value={filters.filter4}
                  onChange={(e) => handleFilterChange('filter4', e.target.value)}
                />
                <button className="filter-search-icon">🔍</button>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Panel - Cards */}
        <main className="ilpn-content-panel">
          {/* Action Bar */}
          <div className="action-bar">
            <button className="action-btn">🔽</button>
            <button className="action-btn">Select All Rows</button>
            <button className="action-btn">Related Links</button>
            <button className="action-btn">Export</button>
            <button className="action-btn">Export Data Loader</button>
          </div>

          {/* Column Header */}
          <div className="column-header">
            <span className="column-title">Current location</span>
            <span className="sort-indicator">↑</span>
            <div className="view-controls">
              <button className="view-btn">📋</button>
              <button className="view-btn">⚙️</button>
            </div>
          </div>

          {/* Cards Container */}
          <div className="cards-container">
            {todos.map(todo => {
              const snoozedInfo = getSnoozedDisplay(todo);
              const snoozedTooltip = snoozedInfo?.needsTooltip ? getSnoozedTooltipContent(todo) : null;
              const detailsInfo = getDetailsDisplay(todo);
              const detailsTooltip = detailsInfo?.needsTooltip ? getDetailsTooltipContent(todo) : null;
              
              return (
                <div key={todo.id} className="ilpn-card">
                  {/* Card Content */}
                  <div className="card-content">
                    <div className="card-column card-column-1">
                      <div className="status-pill">{todo.status}</div>
                    </div>

                    <div className="card-column card-column-2">
                      <div className="field-row field-row-first">
                        <span className="field-label">Type ID:</span>
                        <span className="field-value">
                          {getTodoTypeById(todo.typeId)?.name || todo.typeId}
                        </span>
                      </div>
                      <div className="field-row">
                        <span className="field-label">Title:</span>
                        <span className="field-value">{todo.title}</span>
                      </div>
                      <div className="field-row">
                        <span className="field-label">Category:</span>
                        <span className="field-value">{formatCase(todo.category)}</span>
                      </div>
                      <div className="field-row field-row-last">
                        <span className="field-label">Priority:</span>
                        <span className="field-value">{getPriorityDisplay(todo.priority)}</span>
                      </div>
                    </div>

                    <div className="card-column card-column-3">
                      <div className="field-row field-row-first">
                        <span className="field-label">Assignment Group:</span>
                        <span className="field-value">{todo.assignmentGroup}</span>
                      </div>
                      <div className="field-row">
                        {todo.status === 'Open' && snoozedInfo ? (
                          <>
                            <span className="field-label">Snoozed:</span>
                            <span className="field-value">
                              {snoozedTooltip ? (
                                <CustomTooltip content={snoozedTooltip}>
                                  {snoozedInfo.text}
                                </CustomTooltip>
                              ) : (
                                snoozedInfo.text
                              )}
                            </span>
                          </>
                        ) : null}
                      </div>
                      <div className="field-row">
                        {detailsInfo ? (
                          <>
                            <span className="field-label">Details:</span>
                            <span className="field-value">
                              {detailsTooltip ? (
                                <CustomTooltip content={detailsTooltip}>
                                  {detailsInfo.text}
                                </CustomTooltip>
                              ) : (
                                detailsInfo.text
                              )}
                            </span>
                          </>
                        ) : null}
                      </div>
                      <div className="field-row field-row-last"></div>
                    </div>

                    <div className="card-column card-column-4">
                      <div className="field-row field-row-first">
                        {(todo.status === 'Completed' || todo.status === 'Dismissed') && (
                          <>
                            <span className="field-label">
                              {todo.status === 'Completed' ? 'Completed' : 'Dismissed'} By:
                            </span>
                            <span className="field-value">
                              {todo.status === 'Completed' ? (todo.completedBy || 'N/A') : (todo.dismissedBy || 'N/A')}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="field-row">
                        {(todo.status === 'Completed' || todo.status === 'Dismissed') && (
                          <>
                            <span className="field-label">
                              {todo.status === 'Completed' ? 'Completed' : 'Dismissed'} At:
                            </span>
                            <span className="field-value">
                              {todo.status === 'Completed' 
                                ? formatDate(todo.completedAt)
                                : formatDate(todo.dismissedAt)
                              }
                            </span>
                          </>
                        )}
                      </div>
                      <div className="field-row">
                        {(todo.status === 'Completed' || todo.status === 'Dismissed') && (
                          <>
                            <span className="field-label">Reason:</span>
                            <span className="field-value">{formatReason(todo)}</span>
                          </>
                        )}
                      </div>
                      <div className="field-row field-row-last"></div>
                    </div>
                  </div>

                  <button 
                    className="card-arrow"
                    onClick={() => handleCardArrowClick(todo.id)}
                    title="Open menu"
                  >
                    <span className="arrow-icon"></span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer - Pagination */}
          <div className="pagination-footer">
            <span className="pagination-text">
              Showing 1 - {todos.length} of {todos.length} Records
            </span>
            <div className="pagination-controls">
              <button className="pagination-btn">◀</button>
              <span className="pagination-page">Page 1 of 1</span>
              <button className="pagination-btn">▶</button>
            </div>
            <div className="records-per-page">
              <label>Records Per Page</label>
              <select className="page-select">
                <option>25</option>
                <option>50</option>
                <option>100</option>
              </select>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

