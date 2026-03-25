export const STATUS_CONFIG = {
  'todo': { label: 'To Do', color: '#64748b', bg: '#f1f5f9', darkBg: '#1e293b' },
  'in-progress': { label: 'In Progress', color: '#f59e0b', bg: '#fffbeb', darkBg: '#1c1400' },
  'review': { label: 'Review', color: '#6366f1', bg: '#eef2ff', darkBg: '#1e1b4b' },
  'completed': { label: 'Completed', color: '#10b981', bg: '#ecfdf5', darkBg: '#022c22' },
};

export const PRIORITY_CONFIG = {
  'low': { label: 'Low', color: '#10b981', bg: '#ecfdf5' },
  'medium': { label: 'Medium', color: '#f59e0b', bg: '#fffbeb' },
  'high': { label: 'High', color: '#ef4444', bg: '#fee2e2' },
  'urgent': { label: 'Urgent', color: '#7c3aed', bg: '#f5f3ff' },
};

export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};

export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
};

export const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'completed') return false;
  return new Date(dueDate) < new Date();
};

export const getErrorMessage = (err) =>
  err?.response?.data?.error ||
  err?.response?.data?.errors?.[0]?.msg ||
  err?.message ||
  'Something went wrong';
