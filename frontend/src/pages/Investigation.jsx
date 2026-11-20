import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, User, Tag, Calendar, FileText } from 'lucide-react';
import Header from '../components/Header';
import SeverityBadge from '../components/SeverityBadge';
import api from '../api/client';

export default function Investigation() {
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvestigations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/investigations');
      setInvestigations(res.data.investigations || []);
    } catch (err) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestigations();
  }, []);

  return (
    <div className="main-content">
      <Header 
        title="Analyst Investigation Audit Trail" 
        subtitle="Forensic logs of all security reviews, actions taken, and mitigation notes"
        onRefresh={fetchInvestigations}
      />

      <div className="page-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading ? (
            <div className="card" style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '40px' }}>
              Loading investigation audit trail...
            </div>
          ) : investigations.length > 0 ? (
            investigations.map((inv) => (
              <div key={inv.id} className="card" style={{ position: 'relative' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '12px',
                  marginBottom: '12px',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: 'var(--primary)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)'
                    }}>
                      INV-{inv.id.toString().padStart(4, '0')}
                    </div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                      {inv.alert_title}
                    </span>
                    <SeverityBadge severity={inv.alert_severity} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    <Calendar size={14} />
                    <span>{inv.created_at}</span>
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    ACTION EXECUTED
                  </div>
                  <div style={{
                    display: 'inline-block',
                    background: '#162032',
                    border: '1px solid var(--border-highlight)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    color: 'var(--accent-cyan)',
                    fontWeight: 600
                  }}>
                    {inv.action_taken}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    SOC ANALYST REMARKS
                  </div>
                  <div style={{
                    background: '#0d131f',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    color: 'var(--text-main)',
                    lineHeight: '1.5'
                  }}>
                    {inv.notes}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <User size={13} color="var(--primary)" />
                  <span>Investigated by Analyst: <b style={{ color: '#fff' }}>{inv.analyst_name}</b></span>
                </div>
              </div>
            ))
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '50px', color: 'var(--text-dim)' }}>
              No investigation actions logged yet. Investigate alerts from the Security Alerts Hub to build your audit log.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
