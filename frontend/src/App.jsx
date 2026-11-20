import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Overview from './pages/Overview';
import LogUpload from './pages/LogUpload';
import LogExplorer from './pages/LogExplorer';
import Alerts from './pages/Alerts';
import Investigation from './pages/Investigation';
import Reports from './pages/Reports';

const ProtectedLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0e17',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#38bdf8'
      }}>
        Initializing SOC Console...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/upload" element={<LogUpload />} />
        <Route path="/logs" element={<LogExplorer />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/investigations" element={<Investigation />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
