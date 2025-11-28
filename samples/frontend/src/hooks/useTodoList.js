import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:5000/api';
const POLL_INTERVAL = 60000; // 60 seconds
const CURRENT_SUPERVISOR = 'Miles Atwater';

export const useTodoList = () => {
  const [todos, setTodos] = useState([]);
  const [todoTypes, setTodoTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fetch todos from API
  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/todos`);
      const data = await response.json();
      setTodos(data. data || []);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Complete a todo
  const completeTodo = useCallback(async (todoId, completionData = null) => {
    try {
      const response = await fetch(`${API_BASE}/todos/${todoId}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completionData })
      });
      
      if (! response.ok) throw new Error('Failed to complete todo');
      
      await fetchTodos(); // Refresh list
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error completing todo:', err);
      return false;
    }
  }, [fetchTodos]);

  // Snooze a todo
  const snoozeTodo = useCallback(async (todoId, minutes) => {
    try {
      const response = await fetch(`${API_BASE}/todos/${todoId}/snooze`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes })
      });
      
      if (!response.ok) throw new Error('Failed to snooze todo');
      
      await fetchTodos(); // Refresh list
      return true;
    } catch (err) {
      setError(err.message);
      console. error('Error snoozing todo:', err);
      return false;
    }
  }, [fetchTodos]);

  // Dismiss a todo
  const dismissTodo = useCallback(async (todoId, dismissalReason = null) => {
    try {
      const response = await fetch(`${API_BASE}/todos/${todoId}/dismiss`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dismissalReason })
      });
      
      if (!response. ok) throw new Error('Failed to dismiss todo');
      
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
    return todoTypes.find(t => t. id === typeId);
  }, [todoTypes]);

  // Calculate badge count (visible todos only)
  const getBadgeCount = useCallback(() => {
    return todos.filter(todo => todo.status === 'Open').length;
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

  // Initial fetch + setup polling
  useEffect(() => {
    fetchTodos();
    const interval = setInterval(fetchTodos, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchTodos]);

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
    refetch: fetchTodos
  };
};