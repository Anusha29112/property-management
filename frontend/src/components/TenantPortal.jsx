import { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Key,
  Wrench,
  CreditCard,
  PlusCircle,
  RefreshCw,
  Search
} from 'lucide-react';
import { api } from '../services/api';

export default function TenantPortal({
  onOpenMaintenanceModal,
  onOpenPaymentModal,
  onShowToast,
  setActiveTab
}) {
  const [tenantSubTab, setTenantSubTab] = useState('applications');
  const [applications, setApplications] = useState([]);
  const [leases, setLeases] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const [apps, lses, maint, pmts] = await Promise.all([
        api.getTenantApplications().catch(() => []),
        api.getLeases().catch(() => []),
        api.getMaintenanceRequests().catch(() => []),
        api.getPayments().catch(() => []),
      ]);
      setApplications(Array.isArray(apps) ? apps : []);
      setLeases(Array.isArray(lses) ? lses : []);
      setMaintenance(Array.isArray(maint) ? maint : []);
      setPayments(Array.isArray(pmts) ? pmts : []);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Could not load tenant data');
      onShowToast('Could not load tenant data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [onShowToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCancelMaintenance = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this maintenance ticket?')) return;
    try {
      await api.updateMaintenance(id, { status: 'CANCELLED' });
      onShowToast('Maintenance request cancelled', 'success');
      loadData();
    } catch (err) {
      onShowToast(err.message || 'Could not cancel request', 'error');
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-title">
          <h2>Tenant Resident Portal</h2>
          <p>Track your rental applications, active lease contracts, maintenance tickets, and rent ledger</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={loadData} title="Sync data with Django API">
            <RefreshCw size={16} className={isLoading ? 'spin-icon' : ''} />
            <span>Sync</span>
          </button>
          <button className="btn-secondary" onClick={() => onOpenMaintenanceModal(loadData)}>
            <Wrench size={16} />
            <span>Request Maintenance</span>
          </button>
          <button className="btn-primary" onClick={() => onOpenPaymentModal(loadData)}>
            <CreditCard size={16} />
            <span>Pay Rent</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '10px', color: '#f87171' }}>
          {errorMsg}
        </div>
      )}

      {/* Sub Tabs */}
      <div className="sub-tabs">
        <button
          className={`sub-tab-btn ${tenantSubTab === 'applications' ? 'active' : ''}`}
          onClick={() => setTenantSubTab('applications')}
        >
          <FileText size={16} />
          My Applications <span className="badge-count">{applications.length}</span>
        </button>

        <button
          className={`sub-tab-btn ${tenantSubTab === 'leases' ? 'active' : ''}`}
          onClick={() => setTenantSubTab('leases')}
        >
          <Key size={16} />
          My Leases <span className="badge-count">{leases.length}</span>
        </button>

        <button
          className={`sub-tab-btn ${tenantSubTab === 'maintenance' ? 'active' : ''}`}
          onClick={() => setTenantSubTab('maintenance')}
        >
          <Wrench size={16} />
          Maintenance Requests <span className="badge-count">{maintenance.length}</span>
        </button>

        <button
          className={`sub-tab-btn ${tenantSubTab === 'payments' ? 'active' : ''}`}
          onClick={() => setTenantSubTab('payments')}
        >
          <CreditCard size={16} />
          Payment History <span className="badge-count">{payments.length}</span>
        </button>
      </div>

      {/* Applications List */}
      {tenantSubTab === 'applications' && (
        <div className="content-panel">
          <div className="panel-header">
            <h3 className="panel-title">Submitted Rental Applications</h3>
            <button
              className="btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
              onClick={() => setActiveTab('properties')}
            >
              <Search size={14} />
              <span>Browse More Properties</span>
            </button>
          </div>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Application #</th>
                  <th>Property ID</th>
                  <th>Cover Statement</th>
                  <th>Date Submitted</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                      No applications submitted yet. Browse properties and click "Apply" to begin.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id}>
                      <td><strong>#{app.id}</strong></td>
                      <td>Property #{app.property}</td>
                      <td style={{ maxWidth: '350px', color: '#cbd5e1', fontSize: '0.88rem' }}>
                        {app.message || 'Standard rental inquiry.'}
                      </td>
                      <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`badge-status ${app.status?.toLowerCase()}`}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leases List */}
      {tenantSubTab === 'leases' && (
        <div className="content-panel">
          <div className="panel-header">
            <h3 className="panel-title">Active Resident Leases</h3>
          </div>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Lease ID</th>
                  <th>Property ID</th>
                  <th>Landlord User ID</th>
                  <th>Lease Term Duration</th>
                  <th>Monthly Rent</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leases.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                      No active lease agreements found for your account.
                    </td>
                  </tr>
                ) : (
                  leases.map((lease) => (
                    <tr key={lease.id}>
                      <td><strong>#{lease.id}</strong></td>
                      <td>Property #{lease.property}</td>
                      <td>Landlord #{lease.landlord}</td>
                      <td>{lease.start_date} to {lease.end_date}</td>
                      <td>
                        <strong style={{ color: '#10b981' }}>
                          ${Number(lease.monthly_rent).toLocaleString()} / mo
                        </strong>
                      </td>
                      <td>
                        <span className={`badge-status ${lease.status?.toLowerCase()}`}>
                          {lease.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {lease.status === 'ACTIVE' && (
                          <button
                            className="btn-primary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                            onClick={() => onOpenPaymentModal(loadData)}
                          >
                            Pay Rent
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Maintenance Requests */}
      {tenantSubTab === 'maintenance' && (
        <div className="content-panel">
          <div className="panel-header">
            <h3 className="panel-title">Maintenance Tickets</h3>
            <button
              className="btn-primary"
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
              onClick={() => onOpenMaintenanceModal(loadData)}
            >
              <PlusCircle size={14} />
              New Ticket
            </button>
          </div>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Issue Details</th>
                  <th>Property</th>
                  <th>Priority</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {maintenance.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                      No open maintenance requests. Click "New Ticket" to report any repair needed.
                    </td>
                  </tr>
                ) : (
                  maintenance.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{m.title}</div>
                        <div style={{ fontSize: '0.82rem', color: '#94a3b8', maxWidth: '300px' }}>{m.description}</div>
                      </td>
                      <td>Property #{m.property}</td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: m.priority === 'URGENT' ? 'rgba(244,63,94,0.15)' : 'rgba(245,158,11,0.15)',
                          color: m.priority === 'URGENT' ? '#fb7185' : '#fbbf24'
                        }}>
                          {m.priority}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                        {new Date(m.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`badge-status ${m.status?.toLowerCase()}`}>
                          {m.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {m.status === 'OPEN' && (
                          <button
                            className="btn-secondary"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: '#f43f5e' }}
                            onClick={() => handleCancelMaintenance(m.id)}
                            title="Cancel open ticket"
                          >
                            Cancel Ticket
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment History */}
      {tenantSubTab === 'payments' && (
        <div className="content-panel">
          <div className="panel-header">
            <h3 className="panel-title">Rental Payment Ledger</h3>
            <button
              className="btn-primary"
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
              onClick={() => onOpenPaymentModal(loadData)}
            >
              <CreditCard size={14} />
              Submit Payment
            </button>
          </div>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Receipt Reference</th>
                  <th>Lease ID</th>
                  <th>Amount</th>
                  <th>Payment Date</th>
                  <th>Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                      No payment transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id}>
                      <td><code>{p.reference || `REF-${p.id}`}</code></td>
                      <td>Lease #{p.lease}</td>
                      <td>
                        <strong style={{ color: '#10b981' }}>
                          ${Number(p.amount).toLocaleString()}
                        </strong>
                      </td>
                      <td>{p.payment_date}</td>
                      <td>{p.payment_method}</td>
                      <td>
                        <span className={`badge-status ${p.status?.toLowerCase()}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
