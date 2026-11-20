import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle, 
  Play, 
  Search, 
  MessageSquare,
  Clock,
  Filter,
  Check
} from 'lucide-react';
import Header from '../components/Header';
import SeverityBadge from '../components/SeverityBadge';
import Modal from '../components/Modal';
import api from '../api/client';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  
  // Investigate modal state
  const [activeAlert, setActiveAlert] = useState(null);
  const [actionTaken, setActionTaken] = useState('Password Reset Enforced');
  const [investigationNotes, setInvestigationNotes] = useState('');
  const [targetStatus, setTargetStatus] = useState('RESOLVED');
  const [savingAction, setSavingAction] = useState(false);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (severityFilter) params.severity = severityFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/alerts', { params });
      setAlerts(res.data.alerts);
    } catch (err) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [severityFilter, statusFilter]);

  const handleRunDetection = async () => {
    try {
      setDetecting(true);
      await api.post('/alerts/run-detection');
      await fetchAlerts();
    } catch (err) {
      // error
    } finally {
      setDetecting(false);
    }
  };

  const handleOpenInvestigate = (alert) => {
    setActiveAlert(alert);
    setInvestigationNotes(`Investigated authentication anomaly for ${alert.target_user || 'entity'}. Verified source IP ${alert.source_ip || 'N/A'}.`);
    setActionTaken('Incident Remediated');
    setTargetStatus('RESOLVED');
  };

  const handleSaveInvestigation = async (e) => {
    e.preventDefault();
    if (!activeAlert) return;

    try {
      setSavingAction(true);
      await api.patch(`/alerts/${activeAlert.id}/status`, {
        status: targetStatus,
        action_taken: actionTaken,
        notes: investigationNotes
      });
      setActiveAlert(null);
      await fetchAlerts();
    } catch (err) {
      // error
    } finally {
      setSavingAction(false);
    }
  };

  return (
    <div className="main-content">
      <Header 
        title="Security Alert Triage Hub" 
        subtitle="Review, triage, and respond to rule-based detection anomalies"
        onRefresh={fetchAlerts}
      />

      <div className="page-body">
        {/* Actions & Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select
              className="select"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select
              className="select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Triage Statuses</option>
              <option value="OPEN">Open Only</option>
              <option value="IN_REVIEW">Under Review</option>
              <option value="RESOLVED">Resolved</option>
              <option value="FALSE_POSITIVE">False Positive</option>
            </select>
          </div>

          <button
            onClick={handleRunDetection}
            className="btn btn-primary"
            disabled={detecting}
          >
            <Play size={14} />
            <span>{detecting ? 'Analyzing Rule Matrix...' : 'Re-Run Detection Engine'}</span>
          </button>
        </div>

        {/* Alerts List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {loading ? (
            <div className="card" style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '40px' }}>
              Scanning alert database...
            </div>
          ) : alerts.length > 0 ? (
            alerts.map((alert) => (
              <div 
                key={alert.id} 
                className="card"
                style={{
                  borderLeft: `4px solid ${
                    alert.severity === 'CRITICAL' ? '#ef4444' :
                    alert.severity === 'HIGH' ? '#f97316' :
                    alert.severity === 'MEDIUM' ? '#eab308' : '#3b82f6'
                  }`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <SeverityBadge severity={alert.severity} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                        ALERT-{alert.id.toString().padStart(4, '0')}
                      </span>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: alert.status === 'OPEN' ? 'rgba(239, 68, 68, 0.15)' :
                                    alert.status === 'RESOLVED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                        color: alert.status === 'OPEN' ? '#ef4444' :
                               alert.status === 'RESOLVED' ? '#10b981' : '#eab308',
                        textTransform: 'uppercase'
                      }}>
                        {alert.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                      {alert.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleOpenInvestigate(alert)}
                    className="btn btn-secondary btn-sm"
                    style={{ flexShrink: 0 }}
                  >
                    <MessageSquare size={14} />
                    <span>Investigate</span>
                  </button>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '14px' }}>
                  {alert.description}
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  fontSize: '0.75rem',
                  color: 'var(--text-dim)',
                  borderTop: '1px solid #1a2234',
                  paddingTop: '10px'
                }}>
                  <div>Target User: <b style={{ color: '#fff' }}>{alert.target_user || 'Multiple / Unknown'}</b></div>
                  <div>Origin IP: <code className="mono" style={{ color: 'var(--accent-cyan)' }}>{alert.source_ip || 'N/A'}</code></div>
                  <div style={{ marginLeft: 'auto' }}>Detected: <b>{alert.detected_at}</b></div>
                </div>
              </div>
            ))
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '50px', color: 'var(--text-dim)' }}>
              No security alerts match the selected criteria.
            </div>
          )}
        </div>

        {/* Investigation & Triage Modal */}
        <Modal
          isOpen={!!activeAlert}
          onClose={() => setActiveAlert(null)}
          title={`SOC Investigation: Alert #${activeAlert?.id}`}
        >
          {activeAlert && (
            <form onSubmit={handleSaveInvestigation} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  INCIDENT TITLE
                </label>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
                  {activeAlert.title}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  ACTION TAKEN BY ANALYST
                </label>
                <select
                  className="select"
                  style={{ width: '100%' }}
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                >
                  <option value="Password Reset Enforced">Password Reset Enforced & Active Sessions Terminated</option>
                  <option value="Source IP Blocked on Firewall">Source IP Blocked on Edge Firewall</option>
                  <option value="Account Locked Pending User Verification">Account Locked Pending User Verification</option>
                  <option value="MFA Re-enrolled">MFA Token Reset & Re-enrolled</option>
                  <option value="Flagged as Authorized Penetration Test">Flagged as Authorized Penetration Test</option>
                  <option value="Marked False Positive (Benign Activity)">Marked False Positive (Benign Activity)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  UPDATE INCIDENT STATUS
                </label>
                <select
                  className="select"
                  style={{ width: '100%' }}
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                >
                  <option value="IN_REVIEW">Under Active Review</option>
                  <option value="RESOLVED">Resolved & Closed</option>
                  <option value="FALSE_POSITIVE">False Positive</option>
                  <option value="OPEN">Re-Open Alert</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  INVESTIGATION FINDINGS & SOC NOTES
                </label>
                <textarea
                  className="input"
                  style={{ width: '100%', minHeight: '90px', resize: 'vertical' }}
                  value={investigationNotes}
                  onChange={(e) => setInvestigationNotes(e.target.value)}
                  placeholder="Detail IOCs, attack indicators, or remediation steps taken..."
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActiveAlert(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingAction}
                >
                  {savingAction ? 'Saving Record...' : 'Save & Close Incident'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </div>
  );
}
