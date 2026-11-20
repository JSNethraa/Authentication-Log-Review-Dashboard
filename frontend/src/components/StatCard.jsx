import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'blue', trend, subtitle }) {
  const colorMap = {
    blue: {
      border: 'rgba(59, 130, 246, 0.3)',
      iconBg: 'rgba(59, 130, 246, 0.15)',
      iconColor: '#3b82f6',
      glow: '0 0 20px rgba(59, 130, 246, 0.1)'
    },
    red: {
      border: 'rgba(239, 68, 68, 0.3)',
      iconBg: 'rgba(239, 68, 68, 0.15)',
      iconColor: '#ef4444',
      glow: '0 0 20px rgba(239, 68, 68, 0.1)'
    },
    orange: {
      border: 'rgba(249, 115, 22, 0.3)',
      iconBg: 'rgba(249, 115, 22, 0.15)',
      iconColor: '#f97316',
      glow: '0 0 20px rgba(249, 115, 22, 0.1)'
    },
    green: {
      border: 'rgba(16, 185, 129, 0.3)',
      iconBg: 'rgba(16, 185, 129, 0.15)',
      iconColor: '#10b981',
      glow: '0 0 20px rgba(16, 185, 129, 0.1)'
    },
    cyan: {
      border: 'rgba(6, 182, 212, 0.3)',
      iconBg: 'rgba(6, 182, 212, 0.15)',
      iconColor: '#06b6d4',
      glow: '0 0 20px rgba(6, 182, 212, 0.1)'
    }
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className="card" style={{
      border: `1px solid ${scheme.border}`,
      boxShadow: scheme.glow,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          backgroundColor: scheme.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: scheme.iconColor
        }}>
          {Icon && <Icon size={18} />}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>
          {value}
        </span>
        {trend && (
          <span style={{ fontSize: '0.75rem', color: trend.startsWith('+') ? '#ef4444' : '#10b981', fontWeight: 600 }}>
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}
