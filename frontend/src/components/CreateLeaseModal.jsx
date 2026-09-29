import { useState } from 'react';
import { X, Key } from 'lucide-react';
import { api } from '../services/api';

export default function CreateLeaseModal({ application, onClose, onSuccess, onShowToast }) {
  const [formData, setFormData] = useState(() => ({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    monthly_rent: '',
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!application?.id) return;

    setIsSubmitting(true);
    try {
      await api.createLease({
        application: application.id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        monthly_rent: parseFloat(formData.monthly_rent),
      });

      onShowToast('Lease successfully created from approved application!', 'success');
      onSuccess?.();
      onClose();
    } catch (err) {
      onShowToast(err.message || 'Failed to create lease', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Key size={20} color="#10b981" />
            <h3>Create Lease Agreement</h3>
          </div>
          <button className="btn-icon-only" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '0.9rem', borderRadius: '8px', fontSize: '0.85rem' }}>
              <div><strong>Application ID:</strong> #{application?.id}</div>
              <div><strong>Property:</strong> Unit #{application?.property}</div>
              <div><strong>Tenant:</strong> User #{application?.tenant}</div>
            </div>

            <div className="form-group">
              <label>Monthly Rent ($ USD) *</label>
              <input
                type="number"
                step="0.01"
                min="1"
                className="form-input"
                placeholder="2500.00"
                value={formData.monthly_rent}
                onChange={(e) => setFormData(prev => ({ ...prev, monthly_rent: e.target.value }))}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Lease Start Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label>Lease End Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Lease...' : 'Issue Lease Agreement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
