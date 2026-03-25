import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { STATUS_CONFIG, PRIORITY_CONFIG, formatDate, isOverdue, timeAgo } from '../utils/helpers';
import TaskCard from '../components/tasks/TaskCard';

const StatCard = ({ label, value, icon, color, sub }) => (
  <div className="card animate-fade-in" style={{ padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
    <div style={{
      width: 44, height: 44, borderRadius: 12, background: `${color}20`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      fontSize: 20,
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: color, marginTop: 2, fontWeight: 600 }}>{sub}</div>}
    </div>
  </div>
);

export default function DashboardPage() {
  const { user, isManager } = useAuth();
  const { tasks, stats, loading } = useTasks();

  const myTasks = useMemo(() => tasks.filter(t =>
    t.assignedTo?._id === user?._id || t.assignedTo === user?._id
  ), [tasks, user]);

  const createdByMe = useMemo(() => tasks.filter(t =>
    t.createdBy?._id === user?._id || t.createdBy === user?._id
  ), [tasks, user]);

  const recentTasks = useMemo(() => [...tasks].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5), [tasks]);

  const statusCounts = useMemo(() => {
    const source = isManager ? tasks : myTasks;
    return Object.keys(STATUS_CONFIG).map(s => ({
      status: s,
      count: source.filter(t => t.status === s).length,
      ...STATUS_CONFIG[s],
    }));
  }, [tasks, myTasks, isManager]);

  return (
    <div style={{ padding: '32px 32px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 30, color: 'var(--text-primary)', marginBottom: 6 }}>
          Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label={isManager ? 'Total Tasks' : 'My Tasks'} value={stats?.total ?? (isManager ? tasks.length : myTasks.length)} icon="📋" color="#6366f1" />
        <StatCard label="Completed" value={stats?.byStatus?.find(s => s._id === 'completed')?.count ?? 0} icon="✅" color="#10b981" />
        <StatCard label="In Progress" value={stats?.byStatus?.find(s => s._id === 'in-progress')?.count ?? 0} icon="🔄" color="#f59e0b" />
        <StatCard label="Overdue" value={stats?.overdue ?? 0} icon="⏰" color="#ef4444" sub={stats?.overdue ? 'Needs attention' : 'All on track!'} />
      </div>

      {/* Status breakdown */}
      <div className="card" style={{ padding: 24, marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, color: 'var(--text-primary)', marginBottom: 18 }}>Status Overview</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {statusCounts.map(({ status, count, label, color, bg }) => (
            <div key={status} style={{ padding: '14px 16px', borderRadius: 10, background: bg, border: `1px solid ${color}30` }}>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Syne, sans-serif', color }}>{count}</div>
              <div style={{ fontSize: 12, color, fontWeight: 600, marginTop: 2, fontFamily: 'Syne, sans-serif' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: isManager ? '1fr 1fr' : '1fr', gap: 24 }}>
        {/* My assigned tasks */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, color: 'var(--text-primary)', marginBottom: 18 }}>
            My Assigned Tasks
          </h2>
          {loading ? <Skeleton /> : myTasks.length === 0 ? (
            <Empty text="No tasks assigned to you" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} className="stagger-children">
              {myTasks.slice(0, 5).map(task => (
                <MiniTaskRow key={task._id} task={task} />
              ))}
              {myTasks.length > 5 && (
                <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', paddingTop: 8 }}>
                  +{myTasks.length - 5} more tasks
                </div>
              )}
            </div>
          )}
        </div>

        {/* Manager: Tasks created by me */}
        {isManager && (
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, color: 'var(--text-primary)', marginBottom: 18 }}>
              Tasks I Created
            </h2>
            {loading ? <Skeleton /> : createdByMe.length === 0 ? (
              <Empty text="You haven't created any tasks yet" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} className="stagger-children">
                {createdByMe.slice(0, 5).map(task => (
                  <MiniTaskRow key={task._id} task={task} showAssignee />
                ))}
                {createdByMe.length > 5 && (
                  <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', paddingTop: 8 }}>
                    +{createdByMe.length - 5} more tasks
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MiniTaskRow({ task, showAssignee }) {
  const cfg = STATUS_CONFIG[task.status] || {};
  const pcfg = PRIORITY_CONFIG[task.priority] || {};
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div className="animate-fade-in" style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
      borderRadius: 8, background: 'var(--bg-secondary)',
      border: `1px solid ${overdue ? '#ef444430' : 'var(--border)'}`,
    }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {task.title}
        </div>
        {showAssignee && task.assignedTo && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{task.assignedTo.name}</div>
        )}
      </div>
      <span style={{ padding: '2px 7px', borderRadius: 12, background: pcfg.bg, color: pcfg.color, fontSize: 10, fontWeight: 700, fontFamily: 'Syne, sans-serif', textTransform: 'uppercase', flexShrink: 0 }}>
        {task.priority}
      </span>
      {overdue && <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 700 }}>OVERDUE</span>}
    </div>
  );
}

function Empty({ text }) {
  return (
    <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
      <div style={{ fontSize: 14 }}>{text}</div>
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ height: 44, borderRadius: 8, background: 'var(--border)' }} className="animate-pulse-slow" />
      ))}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
