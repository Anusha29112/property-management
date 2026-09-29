import { useState, useEffect } from 'react';
import { X, Building } from 'lucide-react';
import { api } from '../services/api';

export default function CreatePropertyModal({ propertyToEdit, onClose, onSuccess, onShowToast }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    province: 'ON',
    postal_code: '',
    rent: '',
    bedrooms: '1',
    bathrooms: '1.0',
    property_type: 'APARTMENT',
    status: 'AVAILABLE',
    image_url: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (propertyToEdit) {
      setFormData({
        title: propertyToEdit.title || '',
        description: propertyToEdit.description || '',
        address: propertyToEdit.address || '',
        city: propertyToEdit.city || '',
        province: propertyToEdit.province || 'ON',
        postal_code: propertyToEdit.postal_code || '',
        rent: propertyToEdit.rent || '',
        bedrooms: String(propertyToEdit.bedrooms || 1),
        bathrooms: String(propertyToEdit.bathrooms || '1.0'),
        property_type: propertyToEdit.property_type || 'APARTMENT',
        status: propertyToEdit.status || 'AVAILABLE',
        image_url: '',
      });
    }
  }, [propertyToEdit]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      province: formData.province.trim(),
      postal_code: formData.postal_code.trim(),
      rent: parseFloat(formData.rent),
      bedrooms: parseInt(formData.bedrooms, 10),
      bathrooms: parseFloat(formData.bathrooms),
      property_type: formData.property_type,
      status: formData.status,
    };

    try {
      if (propertyToEdit) {
        await api.updateProperty(propertyToEdit.id, payload);
        onShowToast('Property updated successfully!', 'success');
      } else {
        const created = await api.createProperty(payload);
        if (formData.image_url && formData.image_url.trim() && created?.id) {
          try {
            await api.addPropertyImage(created.id, {
              image_url: formData.image_url.trim(),
              caption: formData.title,
            });
          } catch (imgErr) {
            console.warn('Image could not be linked:', imgErr);
          }
        }
        onShowToast('Property listed successfully on Django backend!', 'success');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      onShowToast(err.message || 'Operation failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Building size={20} color="#818cf8" />
            <h3>{propertyToEdit ? 'Edit Property Listing' : 'List New Property'}</h3>
          </div>
          <button className="btn-icon-only" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Property Title *</label>
              <input
                type="text"
                name="title"
                className="form-input"
                placeholder="e.g. Skyline Luxury Waterfront Penthouse"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Property Type *</label>
                <select
                  name="property_type"
                  className="form-select"
                  value={formData.property_type}
                  onChange={handleChange}
                >
                  <option value="APARTMENT">Apartment</option>
                  <option value="CONDO">Condo</option>
                  <option value="HOUSE">House</option>
                  <option value="TOWNHOUSE">Townhouse</option>
                  <option value="BASEMENT">Basement</option>
                  <option value="ROOM">Room</option>
                </select>
              </div>

              <div className="form-group">
                <label>Monthly Rent ($) *</label>
                <input
                  type="number"
                  name="rent"
                  className="form-input"
                  placeholder="2500"
                  step="0.01"
                  min="0"
                  value={formData.rent}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Bedrooms *</label>
                <input
                  type="number"
                  name="bedrooms"
                  className="form-input"
                  min="0"
                  max="20"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Bathrooms *</label>
                <input
                  type="number"
                  name="bathrooms"
                  className="form-input"
                  min="0"
                  max="20"
                  step="0.5"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Street Address *</label>
              <input
                type="text"
                name="address"
                className="form-input"
                placeholder="e.g. 100 Queen Street West, Suite 1204"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  className="form-input"
                  placeholder="Toronto"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Province / State *</label>
                <input
                  type="text"
                  name="province"
                  className="form-input"
                  placeholder="ON"
                  value={formData.province}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Postal / Zip Code *</label>
                <input
                  type="text"
                  name="postal_code"
                  className="form-input"
                  placeholder="M5V 2T6"
                  value={formData.postal_code}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Status *</label>
                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="RENTED">Rented</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            {!propertyToEdit && (
              <div className="form-group">
                <label>Initial Image URL (Optional)</label>
                <input
                  type="url"
                  name="image_url"
                  className="form-input"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image_url}
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="form-group">
              <label>Full Description *</label>
              <textarea
                name="description"
                className="form-textarea"
                rows={3}
                placeholder="Describe features, nearby transit, included utilities, policies..."
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
              {isSubmitting ? 'Saving...' : (propertyToEdit ? 'Save Changes' : 'Publish Property')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
