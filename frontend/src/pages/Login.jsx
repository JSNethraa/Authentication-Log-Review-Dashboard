import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, User, Terminal, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('analyst');
  const [password, setPassword] = useState('Analyst123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failure. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-dark)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Cyber Grid effect */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.08) 0%, transparent 60%)',
        pointerEvents: 'none'
      }}></div>

      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '36px',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 25px rgba(59, 130, 246, 0.1)',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #1d4ed8, #06b6d4)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 25px rgba(6, 182, 212, 0.35)',
            marginBottom: '16px'
          }}>
            <ShieldAlert size={30} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '0.02em' }}>
            SOC SENTINEL ACCESS
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Authentication Log Review & Anomaly Detection Dashboard
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '0.8rem',
            color: '#ef4444',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              ANALYST USERNAME
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                className="input"
                style={{ width: '100%', paddingLeft: '38px' }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter analyst username"
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              SECURITY KEY / PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="password"
                className="input"
                style={{ width: '100%', paddingLeft: '38px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter security key"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '6px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating Analyst...' : 'Sign In to SOC Console'}
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div style={{
          marginTop: '28px',
          padding: '12px 14px',
          borderRadius: '8px',
          background: '#0d131f',
          border: '1px solid var(--border-color)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '4px' }}>
            <KeyRound size={13} />
            <span>Pre-Configured Demo Credentials:</span>
          </div>
          <div>User: <code className="mono" style={{ color: '#fff' }}>analyst</code> | Pass: <code className="mono" style={{ color: '#fff' }}>Analyst123!</code></div>
        </div>
      </div>
    </div>
  );
}
