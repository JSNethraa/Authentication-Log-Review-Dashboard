import React, { useState } from 'react';
import { FileText, Download, FileSpreadsheet, ShieldAlert, CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import api from '../api/client';

export default function Reports() {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      setSuccessMsg('');
      const res = await api.get('/reports/download-pdf', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SOC_Security_Audit_Report_${new Date().toISOString().slice(0,10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSuccessMsg('Executive SOC PDF report downloaded successfully.');
    } catch (err) {
      // error
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadCsv = async () => {
    try {
      setDownloadingCsv(true);
      setSuccessMsg('');
      const res = await api.get('/reports/download-csv', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auth_forensic_logs_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSuccessMsg('Forensic raw log CSV exported successfully.');
    } catch (err) {
      // error
    } finally {
      setDownloadingCsv(false);
    }
  };

  return (
    <div className="main-content">
      <Header 
        title="Security Audit & Compliance Reports" 
        subtitle="Generate formatted executive incident reports and export raw forensic datasets"
      />

      <div className="page-body" style={{ maxWidth: '900px' }}>
        {successMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#10b981',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem'
          }}>
            <CheckCircle size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Executive PDF Report Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <FileText size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                Executive Incident PDF Report
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
                Comprehensive SOC document including executive KPI summaries, detected threat tables (brute force, off-hours access), 
                and analyst resolution history formatted using ReportLab.
              </p>
              <div style={{
                background: '#0d131f',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                fontSize: '0.72rem',
                color: 'var(--text-dim)',
                marginBottom: '20px'
              }}>
                Format: <b>PDF</b> | Target: <b>Management / Audit Review</b>
              </div>
            </div>

            <button
              onClick={handleDownloadPdf}
              className="btn btn-primary"
              disabled={downloadingPdf}
              style={{ width: '100%' }}
            >
              <Download size={15} />
              <span>{downloadingPdf ? 'Generating PDF...' : 'Download SOC Audit PDF'}</span>
            </button>
          </div>

          {/* Forensic CSV Export Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <FileSpreadsheet size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                Raw Forensic CSV Export
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
                Export full authentication event telemetry with normalized timestamps, IP origins, protocols, and failure reasons 
                for external SIEM ingestion or offline spreadsheet auditing.
              </p>
              <div style={{
                background: '#0d131f',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                fontSize: '0.72rem',
                color: 'var(--text-dim)',
                marginBottom: '20px'
              }}>
                Format: <b>CSV</b> | Target: <b>Data Analytics & SIEM</b>
              </div>
            </div>

            <button
              onClick={handleDownloadCsv}
              className="btn btn-secondary"
              disabled={downloadingCsv}
              style={{ width: '100%' }}
            >
              <Download size={15} />
              <span>{downloadingCsv ? 'Exporting CSV...' : 'Export Raw Forensic CSV'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
