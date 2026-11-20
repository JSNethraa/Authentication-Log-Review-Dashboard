import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Database, Play } from 'lucide-react';
import Header from '../components/Header';
import api from '../api/client';

export default function LogUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a valid CSV authentication log file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setError('');
    try {
      const res = await api.post('/logs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload and parse log file.');
    } finally {
      setUploading(false);
    }
  };

  const handleLoadSample = async () => {
    setUploading(true);
    setError('');
    try {
      const res = await api.post('/logs/sample-load');
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load pre-seeded attack logs.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="main-content">
      <Header 
        title="Log Ingestion & Parsing Engine" 
        subtitle="Upload enterprise authentication CSV logs or ingest benchmark security datasets"
      />

      <div className="page-body" style={{ maxWidth: '900px' }}>
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#ef4444',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            padding: '16px 20px',
            color: '#10b981',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px' }}>
              <CheckCircle2 size={20} />
              <span>{result.message}</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Batch Reference ID: <b>#{result.batch?.id}</b> | New Alerts Generated: <b style={{ color: '#ef4444' }}>{result.alerts_triggered}</b>
            </div>
          </div>
        )}

        {/* Upload Card */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-title">
            <UploadCloud size={20} color="var(--primary)" />
            Ingest New Authentication CSV Log
          </div>

          <form onSubmit={handleUpload}>
            <div style={{
              border: '2px dashed var(--border-color)',
              borderRadius: '12px',
              padding: '40px 20px',
              textAlign: 'center',
              background: '#0d131f',
              marginBottom: '20px',
              cursor: 'pointer'
            }}>
              <input
                type="file"
                accept=".csv"
                id="file-upload"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  marginBottom: '12px'
                }}>
                  <FileText size={24} />
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                  {file ? file.name : 'Click to select or drag and drop CSV log file'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Expected headers: timestamp, username, ip_address, status, auth_service, location
                </div>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              {file && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setFile(null)}
                >
                  Clear
                </button>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!file || uploading}
              >
                {uploading ? 'Parsing & Scanning...' : 'Ingest & Trigger Detection'}
              </button>
            </div>
          </form>
        </div>

        {/* Quick Demo Pre-Seeded Attack Logs Card */}
        <div className="card" style={{ border: '1px solid rgba(6, 182, 212, 0.3)', background: 'linear-gradient(180deg, #111827 0%, #0d192c 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px' }}>
            <div>
              <div className="card-title" style={{ color: 'var(--accent-cyan)' }}>
                <Database size={20} />
                Load Included Cybersecurity Attack Scenario Logs
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Instant testing without needing your own files. Loads 30 realistic enterprise authentication records containing 
                deliberate brute-force sequences against <code>elena.rostova</code>, credential spraying across multiple service accounts 
                from IP <code>198.51.100.24</code>, and midnight off-hours logins.
              </p>
            </div>
            <button
              onClick={handleLoadSample}
              className="btn btn-primary"
              disabled={uploading}
              style={{ flexShrink: 0, background: 'linear-gradient(135deg, #0284c7, #06b6d4)' }}
            >
              <Play size={15} />
              <span>Load Benchmark Logs</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
