import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  UploadCloud, 
  FileSearch, 
  AlertTriangle, 
  FileText, 
  Clock, 
  LogOut,
  Terminal,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Security Overview', path: '/', icon: LayoutDashboard },
    { name: 'Upload & Parse Logs', path: '/upload', icon: UploadCloud },
    { name: 'Log Explorer', path: '/logs', icon: FileSearch },
    { name: 'Security Alerts', path: '/alerts', icon: AlertTriangle },
    { name: 'Investigation History', path: '/investigations', icon: Clock },
    { name: 'Audit Reports', path: '/reports', icon: FileText },
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      flexShrink: 0
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)'
        }}>
          <ShieldAlert size={22} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.02em', color: '#fff' }}>
            SOC SENTINEL
          </h1>
          <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
            LOG REVIEW ENGINE
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ padding: '4px 12px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          SOC Monitoring
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#fff' : 'var(--text-muted)',
                backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease'
              })}
            >
              <Icon size={18} color="currentColor" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* System Status & Analyst Profile */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: '#070b14'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Terminal size={16} color="var(--accent-cyan)" />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>
                {user?.username || 'Analyst'}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>
                {user?.role?.replace('_', ' ') || 'SOC Tier-1'}
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            title="Log Out"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <LogOut size={16} />
          </button>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          background: '#0d131f',
          padding: '6px 10px',
          borderRadius: '6px',
          border: '1px solid #1a2234'
        }}>
          <Activity size={12} color="#10b981" />
          <span>Rule Engine: <b>ACTIVE</b> (v2.4)</span>
        </div>
      </div>
    </aside>
  );
}
