import React, { useState, useEffect } from 'react';
import { Bell, ShieldCheck, Clock, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import api from '../api/client';

export default function Header({ title, subtitle, onRefresh }) {
  const [time, setTime] = useState(new Date().toUTCString().slice(17, 25) + ' UTC');
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [backendHealthy, setBackendHealthy] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toUTCString().slice(17, 25) + ' UTC');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const checkStatus = async () => {
    try {
      const healthRes = await api.get('/health');
      if (healthRes.data?.status === 'operational') {
        setBackendHealthy(true);
      }
      const res = await api.get('/alerts?status=OPEN');
      setUnreadAlerts(res.data.alerts?.length || 0);
    } catch (err) {
      setBackendHealthy(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const statusInterval = setInterval(checkStatus, 30000);
    return () => clearInterval(statusInterval);
  }, []);

  return (
    <header style={{
      height: '68px',
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'rgba(11, 17, 32, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* System UTC Time Clock */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: '#0d131f',
          border: '1px solid var(--border-color)',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '0.78rem',
          color: 'var(--accent-cyan)',
          fontFamily: 'var(--font-mono)'
        }}>
          <Clock size={14} />
          <span>{time}</span>
        </div>

        {/* Refresh Action */}
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="btn btn-secondary btn-sm"
            title="Refresh View"
          >
            <RefreshCw size={14} />
            <span>Sync</span>
          </button>
        )}

        {/* Backend Connectivity Status Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: backendHealthy ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          border: backendHealthy ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
          padding: '6px 10px',
          borderRadius: '8px',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: backendHealthy ? '#10b981' : '#ef4444'
        }} title={backendHealthy ? 'Connected to Flask Backend' : 'Backend Disconnected'}>
          {backendHealthy ? <Wifi size={13} /> : <WifiOff size={13} />}
          <span>{backendHealthy ? 'API Online' : 'API Offline'}</span>
        </div>

        {/* Active Threats Status Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: unreadAlerts > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          border: unreadAlerts > 0 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: unreadAlerts > 0 ? '#ef4444' : '#10b981'
        }}>
          {unreadAlerts > 0 ? (
            <>
              <Bell size={14} />
              <span>{unreadAlerts} Open Alert{unreadAlerts > 1 ? 's' : ''}</span>
            </>
          ) : (
            <>
              <ShieldCheck size={14} />
              <span>Defenses Nominal</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
