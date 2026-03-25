import React, { useState, useEffect } from 'react';
import { useTasks } from '../../context/TaskContext';
import { useUsers } from '../../hooks/useUsers';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const STATUSES = ['todo', 'in-progress', 'review', 'completed'];

const EMPTY = {
  title: '', description: '', priority: 'medium', status: 'todo',
  assignedTo: '', dueDate: '', tags: '',
};

export default function TaskFormModal({ task, onClose }) {
  const { createTask, updateTask } = useTasks();
  const { users } = useUsers();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(task);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        assignedTo: task.assignedTo?._id || task.assignedTo || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        tags: (task.tags || []).join(', '),
      });
    }
  }, [task]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.assignedTo) { toast.error('Please assign the task to a user'); return; }
    setLoading(true);
    try {
      const payload = {
        ...form,
        dueDate: form.dueDate || null,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      if (isEdit) {
        await updateTask(task._id, payload);
        toast.success('Task updated!');
      } else {
        await createTask(payload);
        toast.success('Task created!');
      }
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card animate-fade-in" style={{
        width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto',
        padding: 32,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--text-primary)' }}>
            {isEdit ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: 20, lineHeight: 1, padding: 4,
          }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Title *">
            <input className="input" name="title" value={form.title} onChange={handleChange}
              placeholder="Task title..." required minLength={3} maxLength={100} />
          </Field>

          <Field label="Description">
            <textarea className="input" name="description" value={form.description} onChange={handleChange}
              placeholder="Optional description..." rows={3} maxLength={1000}
              style={{ resize: 'vertical', minHeight: 80 }} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Priority">
              <select className="input" name="priority" value={form.priority} onChange={handleChange}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className="input" name="status" value={form.status} onChange={handleChange}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Assign To *">
            <select className="input" name="assignedTo" value={form.assignedTo} onChange={handleChange} required>
              <option value="">— Select a user —</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Due Date">
              <input className="input" type="date" name="dueDate" value={form.dueDate} onChange={handleChange}
                min={new Date().toISOString().split('T')[0]} />
            </Field>
            <Field label="Tags (comma separated)">
              <input className="input" name="tags" value={form.tags} onChange={handleChange}
                placeholder="design, urgent, v2" />
            </Field>
          </div>

          <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>
              {loading
                ? <span className="animate-spin" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} />
                : isEdit ? '💾 Save Changes' : '✨ Create Task'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Syne, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </label>
      {children}
    </div>
  );
}
