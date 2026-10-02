import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  CreditCard,
  Database,
  ExternalLink,
  FileCheck2,
  KeyRound,
  RefreshCw,
  Users,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, getToken } from '../services/api';

const ENDPOINTS = [
  { method: 'GET / POST', path: '/api/properties/', desc: 'List / filter / create properties' },
  { method: 'GET / PUT / DELETE', path: '/api/properties/<id>/', desc: 'Property details & ownership' },
  { method: 'POST', path: '/api/register/', desc: 'User registration with role & phone' },
  { method: 'POST', path: '/api/login/', desc: 'JWT authentication token generator' },
  { method: 'GET / POST', path: '/api/rental-application/', desc: 'Tenant rental application pipeline' },
  { method: 'GET / PUT', path: '/api/landlord/applications/', desc: 'Landlord application approval workflow' },
  { method: 'GET / POST', path: '/api/leases/', desc: 'Contract leases & tenant binding' },
  { method: 'GET / POST / PUT', path: '/api/maintenance-requests/', desc: 'Maintenance dispatch & resolution' },
  { method: 'GET / POST', path: '/api/payments/', desc: 'Rent payments & ledger audit' },
  { method: 'GET', path: '/api/landlord/dashboard/', desc: 'Custom landlord analytics aggregated metrics' },
  { method: 'GET', path: '/api/admin/dashboard/', desc: 'Admin overview of users, properties, leases & payments' },
  { method: 'GET', path: '/api/admin-test/', desc: 'Admin role verification endpoint' },
];

export default function AdminView() {
  const { backendOnline, checkingBackend, refreshBackendStatus, user } = useAuth();
  const token = getToken();
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const loadDashboard = () => {
    setIsLoading(true);
    setRefreshKey((current) => current + 1);
  };

  useEffect(() => {
    let isCurrent = true;

    api.getAdminDashboard()
      .then((data) => {
        if (isCurrent) {
          setDashboard(data);
          setErrorMsg('');
        }
      })
      .catch((err) => {
        if (isCurrent) {
          setErrorMsg(err.message || 'Failed to load admin dashboard');
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [refreshKey]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-header-title">
          <h2>Admin Dashboard</h2>
          <p>Platform-wide overview of users, properties, applications, leases and payments</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <a
            href="http://127.0.0.1:8000/admin/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            <span>Open Django Admin</span>
            <ExternalLink size={14} />
          </a>

          <button className="btn-secondary" onClick={refreshBackendStatus}>
            <RefreshCw size={14} className={checkingBackend ? 'spin-icon' : ''} />
            <span>Check API Ping</span>
          </button>
          <button className="btn-primary" onClick={loadDashboard} disabled={isLoading}>
            <RefreshCw size={14} className={isLoading ? 'spin-icon' : ''} />
            <span>Refresh Dashboard</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div role="alert" style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          padding: '1rem',
          borderRadius: '10px',
          color: '#f87171',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}>
          <span>{errorMsg}</span>
          <button className="btn-secondary" onClick={loadDashboard}>Retry</button>
        </div>
      )}

      <div className="metrics-grid" aria-live="polite">
        {[
          { label: 'Total Users', value: dashboard?.users?.total, icon: Users, color: '#818cf8', tint: 'rgba(99, 102, 241, 0.15)' },
          { label: 'Total Properties', value: dashboard?.properties?.total, icon: Building2, color: '#38bdf8', tint: 'rgba(56, 189, 248, 0.15)' },
          { label: 'Pending Applications', value: dashboard?.applications?.pending, icon: FileCheck2, color: '#fbbf24', tint: 'rgba(245, 158, 11, 0.15)' },
          { label: 'Active Leases', value: dashboard?.leases?.active, icon: KeyRound, color: '#34d399', tint: 'rgba(16, 185, 129, 0.15)' },
          { label: 'Open Maintenance', value: dashboard?.maintenance_requests?.open, icon: Wrench, color: '#fb7185', tint: 'rgba(244, 63, 94, 0.15)' },
          { label: 'Completed Payments', value: dashboard?.payments?.completed, icon: CreditCard, color: '#c084fc', tint: 'rgba(192, 132, 252, 0.15)' },
        ].map(({ label, value, icon: Icon, color, tint }) => (
          <div className="metric-card" key={label}>
            <div className="metric-icon-box" style={{ background: tint, color }}>
              <Icon size={24} />
            </div>
            <div className="metric-data">
              <h4>{label}</h4>
              <div className="metric-value">
                {isLoading && !dashboard ? '—' : (value ?? 0)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {dashboard && (
        <div className="content-panel">
          <div className="panel-header">
            <h3 className="panel-title">Platform Snapshot</h3>
          </div>
          <div style={{ padding: '1.25rem 1.5rem', display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div><strong>{dashboard.users?.admins ?? 0}</strong> admins · <strong>{dashboard.users?.landlords ?? 0}</strong> landlords · <strong>{dashboard.users?.tenants ?? 0}</strong> tenants</div>
            <div><strong>{dashboard.properties?.available ?? 0}</strong> available · <strong>{dashboard.properties?.rented ?? 0}</strong> rented properties</div>
            <div><strong>{dashboard.applications?.approved ?? 0}</strong> approved · <strong>{dashboard.applications?.rejected ?? 0}</strong> rejected applications</div>
            <div><strong>{dashboard.maintenance_requests?.in_progress ?? 0}</strong> maintenance requests in progress</div>
            <div><strong>{dashboard.payments?.pending ?? 0}</strong> pending payments · <strong>{dashboard.payments?.completed_amount ?? '0'}</strong> completed payment total</div>
          </div>
        </div>
      )}

      {/* Backend Status Card */}
      <div style={{
        background: backendOnline ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
        border: `1px solid ${backendOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
        borderRadius: '12px',
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: backendOnline ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: backendOnline ? '#34d399' : '#fbbf24'
          }}>
            {backendOnline ? <CheckCircle2 size={26} /> : <AlertCircle size={26} />}
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>
              {backendOnline ? 'Django REST Backend is LIVE' : 'Interactive Demo Mode Active'}
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
              {backendOnline
                ? 'Frontend proxy at http://localhost:3000/api forwarding directly to http://127.0.0.1:8000.'
                : 'Start Django server with: python manage.py runserver. All UI components currently function seamlessly with local persistence!'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className={`badge-status ${backendOnline ? 'active' : 'pending'}`}>
            {backendOnline ? 'STATUS: ONLINE (200 OK)' : 'STATUS: OFFLINE (SIMULATED)'}
          </span>
        </div>
      </div>

      {/* JWT Security Inspector */}
      <div className="content-panel">
        <div className="panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <KeyRound size={18} color="#818cf8" />
            <h3 className="panel-title">Active Security Context</h3>
          </div>
          <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            Role: <strong style={{ color: '#a5b4fc' }}>{user?.role || 'Guest'}</strong>
          </span>
        </div>
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            JWT Bearer Header attached to all outbound requests:
          </div>
          <pre style={{
            background: 'rgba(0,0,0,0.4)',
            padding: '1rem',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: '#a5b4fc',
            overflowX: 'auto',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            {token ? `Authorization: Bearer ${token.substring(0, 50)}...` : 'Authorization: (Demo Session Active)'}
          </pre>
        </div>
      </div>

      {/* Registered Django Endpoints */}
      <div className="content-panel">
        <div className="panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={18} color="#818cf8" />
            <h3 className="panel-title">Backend API Contract Map</h3>
          </div>
        </div>
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>HTTP Method</th>
                <th>Endpoint Route</th>
                <th>Functionality</th>
              </tr>
            </thead>
            <tbody>
              {ENDPOINTS.map((ep, i) => (
                <tr key={i}>
                  <td>
                    <code style={{
                      color: ep.method.includes('POST') ? '#34d399' : '#38bdf8',
                      fontWeight: 700,
                      background: 'rgba(255,255,255,0.04)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px'
                    }}>
                      {ep.method}
                    </code>
                  </td>
                  <td><code style={{ color: '#e2e8f0' }}>{ep.path}</code></td>
                  <td style={{ color: '#94a3b8', fontSize: '0.88rem' }}>{ep.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
