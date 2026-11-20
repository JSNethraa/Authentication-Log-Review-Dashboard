import React, { useState, useEffect } from 'react';
import { 
  FileSearch, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  XCircle,
  Eye,
  RefreshCw
} from 'lucide-react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import api from '../api/client';

export default function LogExplorer() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [service, setService] = useState('');
  
  // Selected log for detailed inspect modal
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        per_page: 20,
        search,
        status,
        service
      };
      const res = await api.get('/logs', { params });
      setLogs(res.data.logs);
      setTotal(res.data.total);
      setTotalPages(res.data.total_pages);
    } catch (err) {
      // error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, status, service]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  return (
    <div className="main-content">
      <Header 
        title="Forensic Log Explorer" 
        subtitle="Search, filter, and inspect raw authentication event records"
        onRefresh={fetchLogs}
      />

      <div className="page-body">
        {/* Search & Filter Bar */}
        <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
              <input
                type="text"
                className="input"
                style={{ width: '100%', paddingLeft: '36px' }}
                placeholder="Search by IP, username, reason, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select 
              className="select" 
              value={status} 
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              <option value="SUCCESS">Success Only</option>
              <option value="FAILURE">Failure Only</option>
            </select>

            <select 
              className="select" 
              value={service} 
              onChange={(e) => { setService(e.target.value); setPage(1); }}
            >
              <option value="">All Services</option>
              <option value="Web-Portal">Web Portal</option>
              <option value="SSH">SSH</option>
              <option value="VPN">VPN</option>
              <option value="ActiveDirectory">Active Directory</option>
            </select>

            <button type="submit" className="btn btn-primary btn-sm">
              <Search size={14} /> Filter
            </button>

            {(search || status || service) && (
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => { setSearch(''); setStatus(''); setService(''); setPage(1); }}
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Logs Table */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="soc-table">
              <thead>
                <tr>
                  <th>Timestamp (UTC)</th>
                  <th>Username</th>
                  <th>Source IP</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Reason / Message</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)' }}>
                      Loading authentication logs...
                    </td>
                  </tr>
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {log.timestamp}
                      </td>
                      <td className="mono" style={{ fontWeight: 600, color: '#fff' }}>
                        {log.username}
                      </td>
                      <td className="mono" style={{ color: 'var(--accent-cyan)' }}>
                        {log.ip_address}
                      </td>
                      <td>
                        <span style={{
                          background: '#1e293b',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          color: 'var(--text-muted)'
                        }}>
                          {log.auth_service}
                        </span>
                      </td>
                      <td>
                        {log.status === 'SUCCESS' ? (
                          <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '0.78rem' }}>
                            <CheckCircle size={14} /> SUCCESS
                          </span>
                        ) : (
                          <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '0.78rem' }}>
                            <XCircle size={14} /> FAILURE
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.78rem', color: log.failure_reason ? '#fca5a5' : 'var(--text-dim)' }}>
                        {log.failure_reason || '--'}
                      </td>
                      <td style={{ fontSize: '0.78rem' }}>
                        {log.location}
                      </td>
                      <td>
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="btn btn-secondary btn-sm"
                          title="Inspect Payload"
                        >
                          <Eye size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                      No authentication records matching current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}>
            <div>
              Showing {logs.length} of {total} records (Page {page} of {totalPages})
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Log Details Modal */}
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Authentication Record #${selectedLog?.id}`}
        >
          {selectedLog && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.72rem' }}>EVENT TIMESTAMP</span>
                <span className="mono" style={{ color: '#fff' }}>{selectedLog.timestamp}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.72rem' }}>ACCOUNT USERNAME</span>
                  <span className="mono" style={{ color: '#fff', fontWeight: 600 }}>{selectedLog.username}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.72rem' }}>ORIGIN IP ADDRESS</span>
                  <span className="mono" style={{ color: 'var(--accent-cyan)' }}>{selectedLog.ip_address}</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.72rem' }}>SERVICE PROTOCOL</span>
                  <span>{selectedLog.auth_service}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.72rem' }}>OUTCOME</span>
                  <span style={{ color: selectedLog.status === 'SUCCESS' ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                    {selectedLog.status}
                  </span>
                </div>
              </div>
              {selectedLog.failure_reason && (
                <div>
                  <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.72rem' }}>FAILURE REASON</span>
                  <span style={{ color: '#ef4444' }}>{selectedLog.failure_reason}</span>
                </div>
              )}
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.72rem' }}>GEOGRAPHIC LOCATION</span>
                <span>{selectedLog.location}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.72rem' }}>CLIENT USER AGENT</span>
                <div style={{
                  background: '#0a0e17',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-color)',
                  wordBreak: 'break-all'
                }}>
                  {selectedLog.user_agent}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
