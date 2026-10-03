import { useState, useEffect, useCallback } from 'react';
import { X, MapPin, BedDouble, Bath, Shield, Send, Image as ImageIcon, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80";

export default function PropertyDetailModal({
  property,
  onClose,
  onShowToast,
  onOpenAuth,
  onEditProperty,
  onDeleteProperty,
}) {
  const { user, isAuthenticated } = useAuth();
  const [images, setImages] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add Image state for landlord
  const [showAddImage, setShowAddImage] = useState(false);
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');
  const [isAddingImage, setIsAddingImage] = useState(false);

  useEffect(() => () => {
    if (newImagePreview) URL.revokeObjectURL(newImagePreview);
  }, [newImagePreview]);

  // Fetch real images from backend
  const loadImages = useCallback(async () => {
    if (!property?.id) return;
    try {
      const imgData = await api.getPropertyImages(property.id);
      if (Array.isArray(imgData) && imgData.length > 0) {
        setImages(imgData.map(img => typeof img === 'string' ? img : (img.image_url || img.image)).filter(Boolean));
      } else if (property.images && property.images.length > 0) {
        setImages(property.images.map(img => typeof img === 'string' ? img : (img.image_url || img.image)).filter(Boolean));
      } else {
        setImages([FALLBACK_IMAGE]);
      }
    } catch {
      setImages([FALLBACK_IMAGE]);
    }
  }, [property]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  if (!property) return null;

  const formattedRent = Number(property.rent || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  });

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onShowToast('Please sign in to submit a rental application.', 'error');
      onOpenAuth?.();
      return;
    }

    if (user?.role !== 'TENANT') {
      onShowToast('Only tenants can submit rental applications.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.submitApplication({
        property: property.id,
        message: applyMessage,
      });

      onShowToast('Rental application successfully submitted to the landlord!', 'success');
      setShowApplyForm(false);
      setApplyMessage('');
    } catch (err) {
      onShowToast(err.message || 'Could not submit application', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!newImageFile) {
      onShowToast('Please select an image to upload.', 'error');
      return;
    }

    setIsAddingImage(true);
    try {
      const imageData = new FormData();
      imageData.append('image', newImageFile);
      imageData.append('caption', newImageCaption.trim() || property.title);
      await api.addPropertyImage(property.id, imageData);
      onShowToast('Property image added successfully!', 'success');
      setNewImageFile(null);
      setNewImagePreview('');
      setNewImageCaption('');
      setShowAddImage(false);
      loadImages();
    } catch (err) {
      onShowToast(err.message || 'Failed to add image. (Only property owner can add images)', 'error');
    } finally {
      setIsAddingImage(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <span className={`card-status-badge ${property.status}`} style={{ position: 'static' }}>
              {property.status}
            </span>
            <span style={{ marginLeft: '0.6rem', color: '#818cf8', fontWeight: 600, fontSize: '0.85rem' }}>
              {property.property_type}
            </span>
          </div>
          <button className="btn-icon-only" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '1.5rem 1.75rem' }}>
          {/* Main Photo Gallery */}
          <div style={{ borderRadius: '12px', overflow: 'hidden', height: '340px', background: '#0b0f19', position: 'relative' }}>
            <img
              src={images[activeImageIndex] || FALLBACK_IMAGE}
              alt={property.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = FALLBACK_IMAGE;
              }}
            />

            {/* Landlord Add Image Button overlay */}
            {(user?.role === 'LANDLORD' || user?.role === 'ADMIN') && (
              <button
                className="btn-secondary"
                style={{ position: 'absolute', bottom: '1rem', right: '1rem', fontSize: '0.8rem', padding: '0.4rem 0.8rem', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
                onClick={() => setShowAddImage(prev => !prev)}
              >
                <ImageIcon size={14} />
                <span>+ Add Image</span>
              </button>
            )}
          </div>

          {/* Add Image Form Drawer */}
          {showAddImage && (
            <form onSubmit={handleAddImage} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: '#fff' }}>Attach Image to Property</div>
              <div className="form-row" style={{ marginBottom: '0.75rem' }}>
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Image File *</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-input"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file && !file.type.startsWith('image/')) {
                        e.target.value = '';
                        onShowToast('Please select a valid image file.', 'error');
                        return;
                      }
                      setNewImageFile(file);
                      setNewImagePreview(file ? URL.createObjectURL(file) : '');
                    }}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Caption</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Master Bedroom"
                    value={newImageCaption}
                    onChange={(e) => setNewImageCaption(e.target.value)}
                  />
                </div>
              </div>
              {newImagePreview && (
                <img
                  src={newImagePreview}
                  alt="Selected property preview"
                  style={{ display: 'block', maxWidth: '100%', maxHeight: '180px', marginBottom: '0.75rem', borderRadius: '8px', objectFit: 'cover' }}
                />
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }} onClick={() => setShowAddImage(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }} disabled={isAddingImage}>
                  {isAddingImage ? 'Uploading...' : 'Upload Image'}
                </button>
              </div>
            </form>
          )}

          {/* Thumbnails row if multiple */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  onClick={() => setActiveImageIndex(idx)}
                  style={{
                    width: '72px',
                    height: '52px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    border: activeImageIndex === idx ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
                    opacity: activeImageIndex === idx ? 1 : 0.6
                  }}
                />
              ))}
            </div>
          )}

          {/* Title and Pricing */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{property.title}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                <MapPin size={15} color="#6366f1" />
                <span>{property.address}, {property.city}, {property.province} {property.postal_code}</span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff' }}>
                {formattedRent}
                <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}> / month</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>● Verified Listing</span>
            </div>
          </div>

          {/* Specs Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem',
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BedDouble size={20} color="#818cf8" />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Bedrooms</div>
                <strong style={{ fontSize: '1rem' }}>{property.bedrooms} Beds</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bath size={20} color="#818cf8" />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Bathrooms</div>
                <strong style={{ fontSize: '1rem' }}>{property.bathrooms} Baths</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} color="#10b981" />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Status</div>
                <strong style={{ fontSize: '1rem' }}>{property.status}</strong>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>
              About this property
            </h4>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6' }}>
              {property.description}
            </p>
          </div>

          {/* Tenant Application Form */}
          {showApplyForm && (
            <div style={{
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: '12px',
              padding: '1.25rem',
              marginTop: '0.5rem'
            }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Send size={18} color="#818cf8" />
                Submit Rental Application
              </h4>

              <form onSubmit={handleApplySubmit}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label>Application Message / Note to Landlord</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Introduce yourself, your expected move-in timeline, and employment details..."
                    value={applyMessage}
                    onChange={(e) => setApplyMessage(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowApplyForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting to Django...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            {(user?.role === 'LANDLORD' || user?.role === 'ADMIN') && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {onEditProperty && (
                  <button
                    className="btn-secondary"
                    style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}
                    onClick={() => {
                      onClose();
                      onEditProperty(property);
                    }}
                  >
                    <Edit size={14} />
                    <span>Edit Listing</span>
                  </button>
                )}
                {onDeleteProperty && (
                  <button
                    className="btn-secondary"
                    style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem', color: '#f43f5e' }}
                    onClick={() => {
                      if (window.confirm('Delete this property permanently?')) {
                        onDeleteProperty(property.id);
                        onClose();
                      }
                    }}
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>

            {property.status === 'AVAILABLE' && !showApplyForm && (
              <button
                className="btn-primary"
                onClick={() => {
                  if (!isAuthenticated) {
                    onShowToast('Please sign in to apply.', 'error');
                    onOpenAuth?.();
                  } else if (user?.role !== 'TENANT') {
                    onShowToast('Only tenants can submit rental applications.', 'error');
                  } else {
                    setShowApplyForm(true);
                  }
                }}
              >
                <Send size={16} />
                <span>Apply for this Property</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
