import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
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
      {/* Theme toggle */}
      <button onClick={toggle} style={{
        position: 'fixed', top: 20, right: 20,
        padding: '8px 14px', borderRadius: 8, border: '1.5px solid var(--border)',
        background: 'var(--bg-card)', color: 'var(--text-secondary)',
        cursor: 'pointer', fontSize: 14, fontFamily: 'Syne, sans-serif', fontWeight: 600,
      }}>
        {dark ? '☀️ Light' : '🌙 Dark'}
      </button>

      <div className="animate-fade-in" style={{ width: '100%', maxWidth: 420 }}>
        {/* Header */}
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
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Sign in to your TaskFlow account</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Syne, sans-serif' }}>Email</label>
              <input
                className="input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Syne, sans-serif' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', fontSize: 13,
                }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 4, justifyContent: 'center', padding: '12px 20px', fontSize: 15 }}>
              {loading ? <span className="animate-spin" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} /> : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 22, color: 'var(--text-secondary)', fontSize: 14 }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Sign up
            </Link>
          </div>
        </div>

        {/* Demo hint */}
        <div style={{
          marginTop: 20, padding: '14px 18px', borderRadius: 10,
          background: 'var(--accent-soft)', border: '1px solid var(--accent)',
          fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center',
        }}>
          💡 <strong>Demo:</strong> Sign up as a <strong>Manager</strong> to create tasks, or as a <strong>User</strong> to manage them.
        </div>
      </div>
    </div>
  );
}
