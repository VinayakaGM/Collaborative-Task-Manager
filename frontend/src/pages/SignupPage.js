import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const { signup } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password, form.role);
      toast.success('Account created! Welcome to TaskFlow 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: 20,
    }}>
      <button onClick={toggle} style={{
        position: 'fixed', top: 20, right: 20,
        padding: '8px 14px', borderRadius: 8, border: '1.5px solid var(--border)',
        background: 'var(--bg-card)', color: 'var(--text-secondary)',
        cursor: 'pointer', fontSize: 14, fontFamily: 'Syne, sans-serif', fontWeight: 600,
      }}>
        {dark ? '☀️ Light' : '🌙 Dark'}
      </button>

      <div className="animate-fade-in" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M9 11l3 3L22 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: 'var(--text-primary)', marginBottom: 8 }}>
            Create account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Join TaskFlow today</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Syne, sans-serif' }}>Full Name</label>
              <input className="input" type="text" name="name" value={form.name} onChange={handleChange} placeholder="Jane Smith" required autoFocus minLength={2} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Syne, sans-serif' }}>Email</label>
              <input className="input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Syne, sans-serif' }}>Password</label>
              <input className="input" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" required minLength={6} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Syne, sans-serif' }}>Role</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { value: 'user', label: '👤 User', desc: 'View & update tasks' },
                  { value: 'manager', label: '⚡ Manager', desc: 'Create & assign tasks' },
                ].map(({ value, label, desc }) => (
                  <label key={value} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    padding: '12px 8px', borderRadius: 10, cursor: 'pointer',
                    border: `2px solid ${form.role === value ? 'var(--accent)' : 'var(--border)'}`,
                    background: form.role === value ? 'var(--accent-soft)' : 'transparent',
                    transition: 'all 0.15s',
                  }}>
                    <input type="radio" name="role" value={value} checked={form.role === value} onChange={handleChange} style={{ display: 'none' }} />
                    <span style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>{label}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>{desc}</span>
                  </label>
                ))}
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 4, justifyContent: 'center', padding: '12px 20px', fontSize: 15 }}>
              {loading ? <span className="animate-spin" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} /> : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 22, color: 'var(--text-secondary)', fontSize: 14 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
