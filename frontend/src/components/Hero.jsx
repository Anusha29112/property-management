import { Search, MapPin, Sparkles } from 'lucide-react';

const PROPERTY_TYPES = [
  { id: 'ALL', label: 'All Types' },
  { id: 'APARTMENT', label: 'Apartments' },
  { id: 'CONDO', label: 'Condominiums' },
  { id: 'HOUSE', label: 'Houses' },
  { id: 'TOWNHOUSE', label: 'Townhouses' },
  { id: 'BASEMENT', label: 'Basements' },
  { id: 'ROOM', label: 'Rooms' },
];

export default function Hero({
  searchTerm,
  setSearchTerm,
  selectedType,
  setSelectedType,
  selectedCity,
  setSelectedCity,
  selectedStatus,
  setSelectedStatus,
  sortOption,
  setSortOption,
}) {
  return (
    <section className="hero-section">
      <div className="hero-glow" />

      <div className="hero-badge">
        <Sparkles size={14} />
        <span>Next-Generation Property Management Platform</span>
      </div>

      <h1 className="hero-title">
        Discover, Lease & Manage <span>Curated Homes</span> with Ease.
      </h1>

      <p className="hero-subtitle">
        Seamlessly connects verified landlords and modern tenants. Real-time lease agreements, automated payments, and fast maintenance coordination.
      </p>

      {/* Main Search and Filter Toolbar */}
      <div className="search-toolbar">
        {/* Keyword Search */}
        <div className="search-input-wrapper">
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search by title, neighborhood, amenities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* City Filter */}
        <div className="search-input-wrapper" style={{ flex: 1 }}>
          <MapPin size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="City (e.g. Toronto, Vancouver)"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <select
          className="filter-select"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="AVAILABLE">Available Now</option>
          <option value="RENTED">Rented</option>
          <option value="MAINTENANCE">Maintenance</option>
        </select>

        {/* Sort Filter */}
        <select
          className="filter-select"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="">Default Sorting</option>
          <option value="rent">Rent: Low to High</option>
          <option value="-rent">Rent: High to Low</option>
          <option value="bedrooms">Bedrooms: Low to High</option>
          <option value="-bedrooms">Bedrooms: High to Low</option>
        </select>
      </div>

      {/* Category Filter Chips */}
      <div className="category-chips-row" style={{ marginTop: '1.25rem' }}>
        {PROPERTY_TYPES.map((type) => (
          <button
            key={type.id}
            className={`category-chip ${selectedType === type.id ? 'active' : ''}`}
            onClick={() => setSelectedType(type.id)}
          >
            {type.label}
          </button>
        ))}
      </div>
    </section>
  );
}
