import { MapPin, BedDouble, Bath, ArrowUpRight } from 'lucide-react';

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80";

export default function PropertyCard({ property, onSelect }) {
  const imageUrl = (property.images && property.images.length > 0)
    ? (typeof property.images[0] === 'string' ? property.images[0] : property.images[0].image_url)
    : FALLBACK_IMAGE;

  const formattedRent = Number(property.rent || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  });

  return (
    <div className="property-card" onClick={() => onSelect(property)}>
      <div className="card-image-box">
        <img
          src={imageUrl}
          alt={property.title}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = FALLBACK_IMAGE;
          }}
        />
        <div className={`card-status-badge ${property.status}`}>
          {property.status}
        </div>
        <div className="card-type-badge">
          {property.property_type}
        </div>
      </div>

      <div className="card-content">
        <div className="card-price-row">
          <span className="card-price">{formattedRent}</span>
          <span className="card-period">/ month</span>
        </div>

        <h3 className="card-title" title={property.title}>
          {property.title}
        </h3>

        <div className="card-location">
          <MapPin size={14} color="#6366f1" />
          <span>{property.address}, {property.city}</span>
        </div>

        <div className="card-specs-row">
          <div className="spec-item">
            <BedDouble size={16} color="#94a3b8" />
            <span><strong>{property.bedrooms}</strong> Beds</span>
          </div>

          <div className="spec-item">
            <Bath size={16} color="#94a3b8" />
            <span><strong>{property.bathrooms}</strong> Baths</span>
          </div>

          <div className="spec-item" style={{ color: '#818cf8', fontWeight: 600 }}>
            <span>View Details</span>
            <ArrowUpRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
}
