import { useState, useEffect } from 'react';
import { X, Wrench, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function MaintenanceModal({ onClose, onSuccess, onShowToast }) {
  const [activeLeases, setActiveLeases] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [formData, setFormData] = useState({
    property: '',
    title: '',
    description: '',
    priority: 'MEDIUM',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadRentals() {
      try {
        const [leases, props] = await Promise.all([
          api.getLeases().catch(() => []),
          api.getProperties().catch(() => []),
        ]);

        const validLeases = Array.isArray(leases) ? leases.filter(l => l.status === 'ACTIVE') : [];
        setActiveLeases(validLeases);

        const propsList = Array.isArray(props) ? props : (props?.results || []);
        setAllProperties(propsList);

        if (validLeases.length > 0) {
          setFormData(prev => ({ ...prev, property: validLeases[0].property }));
        } else if (propsList.length > 0) {
          setFormData(prev => ({ ...prev, property: propsList[0].id }));
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadRentals();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.property) {
      onShowToast('Please select a rented property', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createMaintenanceRequest({
        property: parseInt(formData.property, 10),
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
      });

      onShowToast('Maintenance ticket submitted successfully to your landlord!', 'success');
      onSuccess?.();
      onClose();
    } catch (err) {
      onShowToast(err.message || 'Could not submit request. Note: You must have an ACTIVE lease for this property.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Wrench size={20} color="#818cf8" />
            <h3>Request Maintenance</h3>
          </div>
          <button className="btn-icon-only" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {activeLeases.length === 0 && (
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.82rem', color: '#fbbf24', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <AlertCircle size={16} />
                <span>Backend requirement: You must have an active lease on a property to file a ticket.</span>
              </div>
            )}

            <div className="form-group">
              <label>Select Property *</label>
              <select
                name="property"
                className="form-select"
                value={formData.property}
                onChange={handleChange}
                required
              >
                {activeLeases.length > 0 ? (
                  activeLeases.map(l => (
                    <option key={l.id} value={l.property}>
                      Property #{l.property} (Lease #{l.id} - ${l.monthly_rent}/mo)
                    </option>
                  ))
                ) : (
                  allProperties.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.address}, {p.city})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="form-group">
              <label>Issue Headline / Summary *</label>
              <input
                type="text"
                name="title"
                className="form-input"
                placeholder="e.g. Bathroom sink pipe dripping"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Urgency Priority *</label>
              <select
                name="priority"
                className="form-select"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="LOW">LOW — Routine maintenance</option>
                <option value="MEDIUM">MEDIUM — Standard repair needed within 48h</option>
                <option value="HIGH">HIGH — Urgent concern (hot water, HVAC)</option>
                <option value="URGENT">URGENT — Critical emergency / leak</option>
              </select>
            </div>

            <div className="form-group">
              <label>Detailed Problem Description *</label>
              <textarea
                name="description"
                className="form-textarea"
                rows={4}
                placeholder="Describe what happened, where the issue is located, and any emergency actions taken..."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Dispatch Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
