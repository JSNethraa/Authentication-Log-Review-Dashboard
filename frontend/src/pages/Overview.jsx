import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  Network, 
  TrendingUp, 
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import SeverityBadge from '../components/SeverityBadge';
import api from '../api/client';

export default function Overview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analysis/overview');
      setData(res.data);
      setError('');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Unable to reach security analytics backend.';
      setError(`Backend error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6'];

  const pieData = data?.severity_distribution ? [
    { name: 'Critical', value: data.severity_distribution['CRITICAL'] || 0, color: '#ef4444' },
    { name: 'High', value: data.severity_distribution['HIGH'] || 0, color: '#f97316' },
    { name: 'Medium', value: data.severity_distribution['MEDIUM'] || 0, color: '#eab308' },
    { name: 'Low', value: data.severity_distribution['LOW'] || 0, color: '#3b82f6' }
  ].filter(d => d.value > 0) : [];

  return (
    <div className="main-content">
      <Header 
        title="Security Operations Overview" 
        subtitle="Real-time authentication telemetry & automated threat intelligence"
        onRefresh={fetchOverview}
      />

      <div className="page-body">
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#ef4444',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {/* Top KPI Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          <StatCard
            title="Total Auth Events"
            value={data?.kpi?.total_logs ?? '--'}
            icon={Network}
            color="cyan"
            subtitle="Ingested authentication records"
          />
          <StatCard
            title="Failed Login Rate"
            value={data?.kpi ? `${data.kpi.failure_rate}%` : '--'}
            icon={AlertTriangle}
            color={data?.kpi?.failure_rate > 20 ? "red" : "orange"}
            subtitle={`${data?.kpi?.failed_logs ?? 0} total failure events`}
          />
          <StatCard
            title="Active Threat Alerts"
            value={data?.kpi?.active_alerts ?? '--'}
            icon={ShieldAlert}
            color="red"
            subtitle={`${data?.kpi?.critical_alerts ?? 0} Critical / ${data?.kpi?.high_alerts ?? 0} High`}
          />
          <StatCard
            title="Resolved Incidents"
            value={data?.kpi?.resolved_alerts ?? '--'}
            icon={CheckCircle}
            color="green"
            subtitle="Closed investigation tickets"
          />
        </div>

        {/* Visual Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
          {/* Main Timeline Chart */}
          <div className="card">
            <div className="card-title">
              <TrendingUp size={18} color="var(--primary)" />
              Authentication Volume & Failure Spikes
            </div>
            <div style={{ height: '280px', width: '100%' }}>
              {data?.timeline?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorFailure" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                      itemStyle={{ fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="success" stroke="#10b981" fillOpacity={1} fill="url(#colorSuccess)" name="Successful Logins" />
                    <Area type="monotone" dataKey="failure" stroke="#ef4444" fillOpacity={1} fill="url(#colorFailure)" name="Failed Attempts" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)' }}>
                  No authentication timeline telemetry ingested yet.
                </div>
              )}
            </div>
          </div>

          {/* Threat Distribution Pie */}
          <div className="card">
            <div className="card-title">
              <ShieldAlert size={18} color="var(--severity-critical)" />
              Alert Severity Triage
            </div>
            <div style={{ height: '280px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                    <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                  No threats flagged currently.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Targeted Entities Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Top Targeted Users */}
          <div className="card">
            <div className="card-title">
              <Users size={18} color="var(--accent-cyan)" />
              Top Targeted Accounts
            </div>
            <div className="table-container">
              <table className="soc-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Total Attempts</th>
                    <th>Failures</th>
                    <th>Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.top_targeted_users?.length > 0 ? (
                    data.top_targeted_users.map((u, i) => (
                      <tr key={i}>
                        <td className="mono" style={{ color: '#fff', fontWeight: 600 }}>{u.username}</td>
                        <td>{u.total}</td>
                        <td style={{ color: u.failed > 3 ? '#ef4444' : 'inherit', fontWeight: 600 }}>{u.failed}</td>
                        <td>
                          {u.failed >= 4 ? (
                            <SeverityBadge severity="HIGH" />
                          ) : (
                            <SeverityBadge severity="LOW" />
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-dim)' }}>
                        No user telemetry available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Malicious / Attacking IPs */}
          <div className="card">
            <div className="card-title">
              <Network size={18} color="var(--severity-high)" />
              Top Active External IP Origins
            </div>
            <div className="table-container">
              <table className="soc-table">
                <thead>
                  <tr>
                    <th>IP Address</th>
                    <th>Origin Location</th>
                    <th>Attempts</th>
                    <th>Failed</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.top_active_ips?.length > 0 ? (
                    data.top_active_ips.map((ip, i) => (
                      <tr key={i}>
                        <td className="mono" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{ip.ip}</td>
                        <td style={{ fontSize: '0.8rem' }}>{ip.location}</td>
                        <td>{ip.total}</td>
                        <td style={{ color: ip.failed > 0 ? '#f97316' : '#10b981', fontWeight: 600 }}>{ip.failed}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-dim)' }}>
                        No network telemetry available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
