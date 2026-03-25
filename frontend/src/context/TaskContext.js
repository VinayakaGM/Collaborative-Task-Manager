import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../utils/api';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const { user } = useAuth();
  const socket = useSocket();
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });

  const fetchTasks = useCallback(async (page = 1, extraFilters = {}) => {
    setLoading(true);
    try {
      const params = { page, limit: 20, ...filters, ...extraFilters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const res = await api.get('/tasks', { params });
      setTasks(res.data.tasks);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/tasks/stats');
      setStats(res.data);
    } catch {}
  }, []);

  const createTask = useCallback(async (data) => {
    const res = await api.post('/tasks', data);
    setTasks((prev) => [res.data.task, ...prev]);
    await fetchStats();
    return res.data.task;
  }, [fetchStats]);

  const updateTask = useCallback(async (id, data) => {
    const res = await api.put(`/tasks/${id}`, data);
    setTasks((prev) => prev.map((t) => t._id === id ? res.data.task : t));
    await fetchStats();
    return res.data.task;
  }, [fetchStats]);

  const updateStatus = useCallback(async (id, status) => {
    const res = await api.patch(`/tasks/${id}/status`, { status });
    setTasks((prev) => prev.map((t) => t._id === id ? res.data.task : t));
    await fetchStats();
    return res.data.task;
  }, [fetchStats]);

  const deleteTask = useCallback(async (id) => {
    await api.delete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t._id !== id));
    await fetchStats();
  }, [fetchStats]);

  const reorderTasks = useCallback(async (reordered) => {
    setTasks(reordered);
    const payload = reordered.map((t, i) => ({ id: t._id, order: i }));
    await api.patch('/tasks/reorder', { tasks: payload });
  }, []);

  // Real-time socket updates
  useEffect(() => {
    if (!socket) return;
    const onCreated = ({ task }) => {
      setTasks((prev) => {
        if (prev.find((t) => t._id === task._id)) return prev;
        return [task, ...prev];
      });
      fetchStats();
    };
    const onUpdated = ({ task }) => {
      setTasks((prev) => prev.map((t) => t._id === task._id ? task : t));
      fetchStats();
    };
    const onDeleted = ({ taskId }) => {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      fetchStats();
    };
    socket.on('task:created', onCreated);
    socket.on('task:updated', onUpdated);
    socket.on('task:deleted', onDeleted);
    return () => {
      socket.off('task:created', onCreated);
      socket.off('task:updated', onUpdated);
      socket.off('task:deleted', onDeleted);
    };
  }, [socket, fetchStats]);

  useEffect(() => {
    if (user) { fetchTasks(); fetchStats(); }
  }, [user, fetchTasks, fetchStats]);

  return (
    <TaskContext.Provider value={{
      tasks, pagination, stats, loading, filters,
      setFilters, fetchTasks, fetchStats,
      createTask, updateTask, updateStatus, deleteTask, reorderTasks,
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be inside TaskProvider');
  return ctx;
};
