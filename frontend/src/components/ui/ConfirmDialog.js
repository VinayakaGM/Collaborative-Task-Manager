import React from 'react';

export default function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel = 'Delete', danger = true }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 400, padding: 28 }}>
        <div style={{ fontSize: 32, marginBottom: 14, textAlign: 'center' }}>⚠️</div>
        <h3 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18,
          color: 'var(--text-primary)', marginBottom: 10, textAlign: 'center',
        }}>
          {title}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center', lineHeight: 1.6, marginBottom: 24 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={onCancel} style={{ flex: 1, justifyContent: 'center' }}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 6, padding: '9px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: danger ? '#ef4444' : 'var(--accent)', color: 'white',
              fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14,
              transition: 'all 0.15s',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
