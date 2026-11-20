import React from 'react';
import { ShieldAlert, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export default function SeverityBadge({ severity }) {
  const sev = (severity || 'LOW').toUpperCase();
  
  if (sev === 'CRITICAL') {
    return (
      <span className="badge badge-critical">
        <ShieldAlert size={11} /> Critical
      </span>
    );
  }
  if (sev === 'HIGH') {
    return (
      <span className="badge badge-high">
        <AlertTriangle size={11} /> High
      </span>
    );
  }
  if (sev === 'MEDIUM') {
    return (
      <span className="badge badge-medium">
        <AlertTriangle size={11} /> Medium
      </span>
    );
  }
  if (sev === 'SAFE' || sev === 'RESOLVED') {
    return (
      <span className="badge badge-safe">
        <CheckCircle2 size={11} /> {sev}
      </span>
    );
  }
  return (
    <span className="badge badge-low">
      <Info size={11} /> {sev}
    </span>
  );
}
