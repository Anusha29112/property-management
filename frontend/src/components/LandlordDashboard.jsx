import { useState, useEffect, useCallback } from 'react';
import {
  Building,
  Key,
  FileText,
  Wrench,
  PlusCircle,
  XCircle,
  Trash2,
  Edit,
  Check,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';

export default function LandlordDashboard({
  onOpenCreateProperty,
  onEditProperty,
  onOpenCreateLease,
  onShowToast,
  onSelectProperty
}) {
  const [stats, setStats] = useState({
    total_properties: 0,
    available_properties: 0,
    rented_properties: 0,
    pending_applications: 0,
    active_leases: 0,
    open_maintenance_requests: 0,
  });

  const [activeTab, setActiveTab] = useState('properties');
  const [properties, setProperties] = useState([]);
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
      const [dashStats, props, apps, lses, maint, pmts] = await Promise.all([
        api.getLandlordDashboard().catch(() => ({})),
        api.getProperties().catch(() => []),
        api.getLandlordApplications().catch(() => []),
        api.getLeases().catch(() => []),
        api.getMaintenanceRequests().catch(() => []),
        api.getPayments().catch(() => []),
      ]);

      setStats(dashStats || {});
      setProperties(Array.isArray(props) ? props : (props?.results || []));
      setApplications(Array.isArray(apps) ? apps : []);
      setLeases(Array.isArray(lses) ? lses : []);
      setMaintenance(Array.isArray(maint) ? maint : []);
      setPayments(Array.isArray(pmts) ? pmts : []);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to sync with Django backend');
      onShowToast(err.message || 'Could not load landlord data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [onShowToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDecision = async (appId, status) => {
    try {
      await api.decideApplication(appId, status);
      onShowToast(`Application ${status.toLowerCase()} successfully!`, 'success');
      loadData();
    } catch (err) {
      onShowToast(err.message || 'Decision action failed', 'error');
    }
  };

  const handleUpdateMaintenance = async (reqId, status, priority) => {
    try {
      const payload = {};
      if (status) payload.status = status;
      if (priority) payload.priority = priority;
      await api.updateMaintenance(reqId, payload);
      onShowToast('Maintenance ticket updated!', 'success');
      loadData();
    } catch (err) {
      onShowToast(err.message || 'Update failed', 'error');
    }
  };

  const handleLeaseAction = async (leaseId, status) => {
    if (!window.confirm(`Are you sure you want to mark this lease as ${status}?`)) return;
    try {
      await api.updateLeaseStatus(leaseId, status);
      onShowToast(`Lease marked as ${status}!`, 'success');
      loadData();
    } catch (err) {
      onShowToast(err.message || 'Failed to update lease status', 'error');
    }
  };

  const handleDeleteProperty = async (propId) => {
    if (!window.confirm('Are you sure you want to permanently delete this property?')) return;
    try {
      await api.deleteProperty(propId);
      onShowToast('Property deleted successfully from database', 'success');
      loadData();
    } catch (err) {
      onShowToast(err.message || 'Delete failed', 'error');
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-title">
          <h2>Landlord Executive Hub</h2>
          <p>Portfolio management, rental applications, leases, tickets & rent ledger</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={loadData} title="Refresh data from Django API">
            <RefreshCw size={16} className={isLoading ? 'spin-icon' : ''} />
            <span>Sync</span>
          </button>
          <button className="btn-primary" onClick={onOpenCreateProperty}>
            <PlusCircle size={18} />
            <span>Add Property</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '10px', color: '#f87171' }}>
          {errorMsg}
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Building size={24} />
          </div>
          <div className="metric-data">
            <h4>Total Properties</h4>
            <div className="metric-value">{stats.total_properties ?? properties.length}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <Key size={24} />
          </div>
          <div className="metric-data">
            <h4>Available Units</h4>
            <div className="metric-value">{stats.available_properties ?? 0}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <FileText size={24} />
          </div>
          <div className="metric-data">
            <h4>Pending Applications</h4>
            <div className="metric-value">{stats.pending_applications ?? 0}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
            <Wrench size={24} />
          </div>
          <div className="metric-data">
            <h4>Open Maintenance</h4>
            <div className="metric-value">{stats.open_maintenance_requests ?? 0}</div>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="sub-tabs">
        <button
          className={`sub-tab-btn ${activeTab === 'properties' ? 'active' : ''}`}
          onClick={() => setActiveTab('properties')}
        >
          Properties <span className="badge-count">{properties.length}</span>
        </button>
        <button
          className={`sub-tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          Applications <span className="badge-count">{applications.length}</span>
        </button>
        <button
          className={`sub-tab-btn ${activeTab === 'leases' ? 'active' : ''}`}
          onClick={() => setActiveTab('leases')}
        >
          Leases <span className="badge-count">{leases.length}</span>
        </button>
        <button
          className={`sub-tab-btn ${activeTab === 'maintenance' ? 'active' : ''}`}
          onClick={() => setActiveTab('maintenance')}
        >
          Maintenance <span className="badge-count">{maintenance.length}</span>
        </button>
        <button
          className={`sub-tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          Payments <span className="badge-count">{payments.length}</span>
        </button>
      </div>

      {/* Tab: Properties */}
      {activeTab === 'properties' && (
        <div className="content-panel">
          <div className="panel-header">
            <h3 className="panel-title">My Properties</h3>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Showing {properties.length} units
            </span>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Rent</th>
                  <th>Specs</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                      No properties found. Click "+ Add Property" to list your first property.
                    </td>
                  </tr>
                ) : (
                  properties.map((prop) => (
                    <tr key={prop.id}>
                      <td>
                        <strong style={{ color: '#fff' }}>{prop.title}</strong>
                      </td>
                      <td>{prop.address}, {prop.city}</td>
                      <td>
                        <strong style={{ color: '#10b981' }}>
                          ${Number(prop.rent).toLocaleString()}
                        </strong>
                      </td>
                      <td>{prop.bedrooms} Bed · {prop.bathrooms} Bath</td>
                      <td><span style={{ color: '#818cf8', fontWeight: 600 }}>{prop.property_type}</span></td>
                      <td>
                        <span className={`badge-status ${prop.status?.toLowerCase()}`}>
                          {prop.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            className="btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                            onClick={() => onSelectProperty(prop)}
                            title="View property details"
                          >
                            View
                          </button>
                          <button
                            className="btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                            onClick={() => onEditProperty(prop)}
                            title="Edit listing"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            className="btn-icon-only"
                            style={{ width: '32px', height: '32px' }}
                            onClick={() => handleDeleteProperty(prop.id)}
                            title="Delete listing"
                          >
                            <Trash2 size={13} color="#f43f5e" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Applications */}
      {activeTab === 'applications' && (
        <div className="content-panel">
          <div className="panel-header">
            <h3 className="panel-title">Rental Applications</h3>
          </div>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>App #</th>
                  <th>Property ID</th>
                  <th>Tenant User ID</th>
                  <th>Message</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                      No rental applications received yet.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id}>
                      <td><strong>#{app.id}</strong></td>
                      <td>Unit #{app.property}</td>
                      <td>User #{app.tenant}</td>
                      <td style={{ maxWidth: '300px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                        {app.message || 'No message provided.'}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`badge-status ${app.status?.toLowerCase()}`}>
                          {app.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {app.status === 'PENDING' && (
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button
                              className="btn-primary"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', background: '#10b981' }}
                              onClick={() => handleDecision(app.id, 'APPROVED')}
                            >
                              <Check size={14} />
                              Approve
                            </button>
                            <button
                              className="btn-secondary"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', color: '#f43f5e' }}
                              onClick={() => handleDecision(app.id, 'REJECTED')}
                            >
                              <XCircle size={14} />
                              Reject
                            </button>
                          </div>
                        )}

                        {app.status === 'APPROVED' && (
                          <button
                            className="btn-primary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                            onClick={() => onOpenCreateLease(app)}
                          >
                            <Key size={13} />
                            Create Lease
                          </button>
                        )}

                        {app.status === 'REJECTED' && (
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Declined</span>
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

      {/* Tab: Leases */}
      {activeTab === 'leases' && (
        <div className="content-panel">
          <div className="panel-header">
            <h3 className="panel-title">Active & Concluded Leases</h3>
          </div>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Lease #</th>
                  <th>Property</th>
                  <th>Tenant</th>
                  <th>Term Duration</th>
                  <th>Monthly Rent</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leases.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                      No leases created yet. Approve an application to generate a lease.
                    </td>
                  </tr>
                ) : (
                  leases.map((lease) => (
                    <tr key={lease.id}>
                      <td><strong>#{lease.id}</strong></td>
                      <td>Property #{lease.property}</td>
                      <td>Tenant #{lease.tenant}</td>
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
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button
                              className="btn-secondary"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                              onClick={() => handleLeaseAction(lease.id, 'ENDED')}
                            >
                              End Lease
                            </button>
                            <button
                              className="btn-secondary"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: '#f43f5e' }}
                              onClick={() => handleLeaseAction(lease.id, 'TERMINATED')}
                            >
                              Terminate
                            </button>
                          </div>
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

      {/* Tab: Maintenance */}
      {activeTab === 'maintenance' && (
        <div className="content-panel">
          <div className="panel-header">
            <h3 className="panel-title">Maintenance Requests</h3>
          </div>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Property</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th style={{ textAlign: 'right' }}>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {maintenance.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                      No maintenance tickets submitted.
                    </td>
                  </tr>
                ) : (
                  maintenance.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{m.title}</div>
                        <div style={{ fontSize: '0.82rem', color: '#94a3b8', maxWidth: '300px' }}>{m.description}</div>
                      </td>
                      <td>Unit #{m.property}</td>
                      <td>
                        <select
                          className="filter-select"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.78rem' }}
                          value={m.priority}
                          onChange={(e) => handleUpdateMaintenance(m.id, null, e.target.value)}
                        >
                          <option value="LOW">LOW</option>
                          <option value="MEDIUM">MEDIUM</option>
                          <option value="HIGH">HIGH</option>
                          <option value="URGENT">URGENT</option>
                        </select>
                      </td>
                      <td>
                        <span className={`badge-status ${m.status?.toLowerCase()}`}>
                          {m.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                        {new Date(m.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <select
                          className="filter-select"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', minWidth: '130px' }}
                          value={m.status}
                          onChange={(e) => handleUpdateMaintenance(m.id, e.target.value, null)}
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Payments */}
      {activeTab === 'payments' && (
        <div className="content-panel">
          <div className="panel-header">
            <h3 className="panel-title">Rent Ledger</h3>
          </div>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Lease ID</th>
                  <th>Tenant ID</th>
                  <th>Amount</th>
                  <th>Payment Date</th>
                  <th>Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                      No payments recorded yet.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id}>
                      <td><code>{p.reference || `REF-${p.id}`}</code></td>
                      <td>Lease #{p.lease}</td>
                      <td>Tenant #{p.tenant}</td>
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
