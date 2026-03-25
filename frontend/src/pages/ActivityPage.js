import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { timeAgo, getInitials } from '../utils/helpers';
import toast from 'react-hot-toast';

const ACTION_CONFIG = {
  created:          { icon: '✨', color: '#10b981', label: 'Created' },
  updated:          { icon: '✏️', color: '#6366f1', label: 'Updated' },
  deleted:          { icon: '🗑️', color: '#ef4444', label: 'Deleted' },
  status_changed:   { icon: '🔄', color: '#f59e0b', label: 'Status Changed' },
  assigned:         { icon: '👤', color: '#8b5cf6', label: 'Assigned' },
  priority_changed: { icon: '⚡', color: '#f97316', label: 'Priority Changed' },
  commented:        { icon: '💬', color: '#06b6d4', label: 'Commented' },
};

export default function ActivityPage() {
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/activities', { params: { page, limit: 20 } });
      setActivities(res.data.activities);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load activity');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  return (
    <div style={{ padding: '32px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: 'var(--text-primary)', marginBottom: 6 }}>
          Activity Log
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          {pagination.total} event{pagination.total !== 1 ? 's' : ''} recorded
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card animate-pulse-slow" style={{ height: 72 }} />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>📭</div>
          <div style={{ fontSize: 16, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No activity yet</div>
          <div style={{ fontSize: 14 }}>Actions on tasks will appear here.</div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }} className="stagger-children">
            {activities.map((activity, idx) => (
              <ActivityRow key={activity._id} activity={activity} isLast={idx === activities.length - 1} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, paddingTop: 32 }}>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => fetchActivities(p)} style={{
                  width: 36, height: 36, borderRadius: 8,
                  border: '1.5px solid var(--border)',
                  background: p === pagination.page ? 'var(--accent)' : 'var(--bg-card)',
                  color: p === pagination.page ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13,
                }}>{p}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ActivityRow({ activity, isLast }) {
  const cfg = ACTION_CONFIG[activity.action] || { icon: '•', color: '#64748b', label: activity.action };
  const user = activity.performedBy;
  const task = activity.task;

  const detailText = () => {
    const d = activity.details || {};
    if (activity.action === 'status_changed') return `${d.from} → ${d.to}`;
    if (activity.action === 'priority_changed') return `${d.from} → ${d.to}`;
    if (activity.action === 'assigned') return `to ${d.to || ''}`;
    return '';
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', gap: 14, position: 'relative', paddingBottom: isLast ? 0 : 4 }}>
      {/* Timeline line */}
      {!isLast && (
        <div style={{
          position: 'absolute', left: 18, top: 44, bottom: 0,
          width: 2, background: 'var(--border)',
        }} />
      )}

      {/* Icon */}
      <div style={{
        width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
        background: `${cfg.color}15`, border: `2px solid ${cfg.color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, zIndex: 1, marginTop: 4,
      }}>
        {cfg.icon}
      </div>

      {/* Content */}
      <div className="card" style={{ flex: 1, padding: '12px 16px', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ flex: 1 }}>
            {/* User */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              {user && (
                <>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 9, fontWeight: 700,
                  }}>
                    {getInitials(user.name)}
                  </div>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                    {user.name}
                  </span>
                </>
              )}
              <span style={{
                padding: '1px 7px', borderRadius: 10,
                background: `${cfg.color}15`, color: cfg.color,
                fontSize: 11, fontWeight: 700, fontFamily: 'Syne, sans-serif',
              }}>
                {cfg.label}
              </span>
            </div>

            {/* Task ref */}
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {task ? (
                <span>
                  Task: <strong style={{ color: 'var(--text-primary)' }}>
                    {task.title || activity.taskTitle || 'Deleted task'}
                  </strong>
                </span>
              ) : (
                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  {activity.taskTitle || 'Task no longer exists'}
                </span>
              )}
              {detailText() && (
                <span style={{ marginLeft: 8, padding: '1px 6px', borderRadius: 6, background: 'var(--bg-secondary)', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {detailText()}
                </span>
              )}
            </div>
          </div>

          {/* Time */}
          <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', marginTop: 2 }}>
            {timeAgo(activity.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
