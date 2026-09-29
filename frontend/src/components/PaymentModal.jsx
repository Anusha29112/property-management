import { useState, useEffect } from 'react';
import { X, CreditCard, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function PaymentModal({ onClose, onSuccess, onShowToast }) {
  const [leases, setLeases] = useState([]);
  const [formData, setFormData] = useState(() => ({
    lease: '',
    amount: '',
    payment_date: getTodayString(),
    payment_method: 'BANK_TRANSFER',
    reference: `REF-${Date.now().toString().slice(-6)}`,
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchLeases() {
      try {
        const lses = await api.getLeases();
        const activeOnly = Array.isArray(lses) ? lses.filter(l => l.status === 'ACTIVE') : [];
        setLeases(activeOnly);
        if (activeOnly.length > 0) {
          setFormData(prev => ({
            ...prev,
            lease: activeOnly[0].id,
            amount: activeOnly[0].monthly_rent || '',
          }));
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchLeases();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'lease') {
      const selected = leases.find(l => l.id === Number(value));
      setFormData(prev => ({
        ...prev,
        lease: value,
        amount: selected ? selected.monthly_rent : prev.amount,
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.lease) {
      onShowToast('Please select an active lease to pay rent for', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createPayment({
        lease: parseInt(formData.lease, 10),
        amount: parseFloat(formData.amount),
        payment_date: formData.payment_date,
        payment_method: formData.payment_method,
        reference: formData.reference.trim(),
      });

      onShowToast('Payment submitted successfully to the ledger!', 'success');
      onSuccess?.();
      onClose();
    } catch (err) {
      onShowToast(err.message || 'Payment submission failed. Note: You must be the tenant on an active lease.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CreditCard size={20} color="#818cf8" />
            <h3>Process Rent Payment</h3>
          </div>
          <button className="btn-icon-only" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {leases.length === 0 && (
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.82rem', color: '#fbbf24', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <AlertCircle size={16} />
                <span>Backend requirement: Payments can only be submitted for ACTIVE leases.</span>
              </div>
            )}

            <div className="form-group">
              <label>Select Active Lease Agreement *</label>
              <select
                name="lease"
                className="form-select"
                value={formData.lease}
                onChange={handleChange}
                required
              >
                {leases.length > 0 ? (
                  leases.map(l => (
                    <option key={l.id} value={l.id}>
                      Lease #{l.id} (Property #{l.property}) — ${l.monthly_rent}/mo
                    </option>
                  ))
                ) : (
                  <option value="">No active leases found for your account</option>
                )}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Payment Amount ($ USD) *</label>
                <input
                  type="number"
                  name="amount"
                  className="form-input"
                  step="0.01"
                  min="1"
                  placeholder="2000.00"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Payment Date *</label>
                <input
                  type="date"
                  name="payment_date"
                  className="form-input"
                  value={formData.payment_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Payment Method *</label>
                <select
                  name="payment_method"
                  className="form-select"
                  value={formData.payment_method}
                  onChange={handleChange}
                >
                  <option value="BANK_TRANSFER">Bank Transfer / Wire</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="DEBIT_CARD">Debit Card</option>
                  <option value="CASH">Cash / Cheque</option>
                </select>
              </div>

              <div className="form-group">
                <label>Reference / Transaction Code *</label>
                <input
                  type="text"
                  name="reference"
                  className="form-input"
                  placeholder="e.g. ETR-982143"
                  value={formData.reference}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.85rem',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '8px',
              fontSize: '0.82rem',
              color: '#34d399'
            }}>
              <ShieldCheck size={18} />
              <span>Payments are posted directly to the Django Payment ledger and associated with your lease.</span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : `Submit Payment ($${formData.amount || '0'})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
