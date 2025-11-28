import { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.DEV ? 'http://localhost:5000/api' : '/api';
const POLL_INTERVAL = 60000; // 60 seconds
const CURRENT_SUPERVISOR = 'Miles Atwater';

// Get userId from localStorage or use supervisor name as fallback
const getUserId = () => {
  try {
    const stored = localStorage.getItem('todoUserId');
    return stored || CURRENT_SUPERVISOR;
  } catch {
    return CURRENT_SUPERVISOR;
  }
};

export const useTodoList = () => {
  const [todos, setTodos] = useState([]);
  const [todoTypes, setTodoTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [snoozedCount, setSnoozedCount] = useState(0);
  
  // Get showSnoozed preference from localStorage
  const getShowSnoozed = () => {
    try {
      const stored = localStorage.getItem('showSnoozedTodos');
      return stored === 'true';
    } catch {
      return false;
    }
  };
  
  const [showSnoozed, setShowSnoozed] = useState(getShowSnoozed);

  // Fetch todo types
  const fetchTodoTypes = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/todo-types`);
      const data = await response.json();
      setTodoTypes(data.data || []);
    } catch (err) {
      console.error('Error fetching todo types:', err);
    }
  }, []);

  // Fetch todos from API
  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = getUserId();
      const includeSnoozed = showSnoozed;
      // Pass userId and includeSnoozed as query parameters
      const response = await fetch(`${API_BASE}/todos?userId=${encodeURIComponent(userId)}&includeSnoozed=${includeSnoozed}`);
      const data = await response.json();
      setTodos(data.data || []);
      setSnoozedCount(data.snoozedCount || 0);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  }, [showSnoozed]);

  // Initial fetch + setup polling
  useEffect(() => {
    fetchTodoTypes();
    fetchTodos();
    const interval = setInterval(fetchTodos, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchTodoTypes, fetchTodos]);

  // Complete a todo
  const completeTodo = useCallback(async (todoId, completionData = null) => {
    try {
      const userId = getUserId();
      const response = await fetch(`${API_BASE}/todos/${todoId}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completionData, userId })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to complete todo: ${response.status} ${response.statusText}`);
      }
      
      await fetchTodos(); // Refresh list
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error completing todo:', err);
      return false;
    }
  }, [fetchTodos]);

  // Snooze a todo (minutes = 0 means unsnooze)
  const snoozeTodo = useCallback(async (todoId, minutes) => {
    try {
      const userId = getUserId();
      const response = await fetch(`${API_BASE}/todos/${todoId}/snooze`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes, userId })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to snooze todo: ${response.status} ${response.statusText}`);
      }
      
      await fetchTodos(); // Refresh list
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [fetchTodos]);
  
  // Toggle show snoozed
  const toggleShowSnoozed = useCallback(() => {
    const newValue = !showSnoozed;
    setShowSnoozed(newValue);
    try {
      localStorage.setItem('showSnoozedTodos', String(newValue));
    } catch {
      // Ignore localStorage errors
    }
  }, [showSnoozed]);

  // Dismiss a todo
  const dismissTodo = useCallback(async (todoId, dismissalReason = null) => {
    try {
      const userId = getUserId();
      const response = await fetch(`${API_BASE}/todos/${todoId}/dismiss`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dismissalReason, userId })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to dismiss todo: ${response.status} ${response.statusText}`);
      }
      
      await fetchTodos(); // Refresh list
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error dismissing todo:', err);
      return false;
    }
  }, [fetchTodos]);

  // Get todo type by ID
  const getTodoTypeById = useCallback((typeId) => {
    return todoTypes.find(t => t.id === typeId);
  }, [todoTypes]);

  // Calculate badge count (visible todos only)
  // Note: todos are already filtered by user snoozes on the backend
  const getBadgeCount = useCallback(() => {
    return todos.length; // All returned todos are visible to this user
  }, [todos]);

  // Group todos by priority
  const getGroupedTodos = useCallback(() => {
    const grouped = {
      critical: [],
      high: [],
      medium: [],
      low: []
    };

    todos.forEach(todo => {
      if (todo.priority === 1) grouped.critical.push(todo);
      else if (todo. priority === 2) grouped.high.push(todo);
      else if (todo.priority === 3) grouped.medium.push(todo);
      else grouped.low. push(todo);
    });

    return grouped;
  }, [todos]);


  return {
    todos,
    loading,
    error,
    lastUpdate,
    completeTodo,
    snoozeTodo,
    dismissTodo,
    getTodoTypeById,
    getBadgeCount,
    getGroupedTodos,
    currentSupervisor: CURRENT_SUPERVISOR,
    userId: getUserId(),
    snoozedCount,
    showSnoozed,
    toggleShowSnoozed,
    refetch: fetchTodos
  };
};