import { useState, useEffect, useCallback, useTransition } from 'react';
import {
  Building2,
  PlusCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FilterX
} from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PropertyCard from './components/PropertyCard';
import PropertyDetailModal from './components/PropertyDetailModal';
import CreatePropertyModal from './components/CreatePropertyModal';
import LandlordDashboard from './components/LandlordDashboard';
import TenantPortal from './components/TenantPortal';
import AdminView from './components/AdminView';
import CreateLeaseModal from './components/CreateLeaseModal';
import MaintenanceModal from './components/MaintenanceModal';
import PaymentModal from './components/PaymentModal';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './services/api';
import './App.css';

function MainApp() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [, startTransition] = useTransition();

  // Navigation
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'landlord' | 'tenant' | 'admin'

  // Property Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortOption, setSortOption] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Property Data State
  const [properties, setProperties] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingProps, setIsLoadingProps] = useState(true);
  const [propError, setPropError] = useState('');

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [createPropertyModalOpen, setCreatePropertyModalOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [createLeaseApp, setCreateLeaseApp] = useState(null);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [maintenanceSuccessCb, setMaintenanceSuccessCb] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentSuccessCb, setPaymentSuccessCb] = useState(null);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch properties from backend
  const loadProperties = useCallback(async () => {
    setIsLoadingProps(true);
    setPropError('');
    try {
      const params = {
        search: searchTerm.trim() || undefined,
        property_type: selectedType !== 'ALL' ? selectedType : undefined,
        city: selectedCity.trim() || undefined,
        status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
        sort: sortOption || undefined,
        page: currentPage > 1 ? currentPage : undefined,
      };

      const res = await api.getProperties(params);
      const list = Array.isArray(res) ? res : (res?.results || []);
      setProperties(list);
      setTotalCount(res?.count ?? list.length);
    } catch (err) {
      console.error('Failed to load properties:', err);
      setPropError(err.message || 'Unable to connect to Django Property API');
      setProperties([]);
      setTotalCount(0);
    } finally {
      setIsLoadingProps(false);
    }
  }, [searchTerm, selectedType, selectedCity, selectedStatus, sortOption, currentPage]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  // Reset page when filters change
  const handleFilterChange = (setter) => (val) => {
    setter(val);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    startTransition(() => {
      setSearchTerm('');
      setSelectedType('ALL');
      setSelectedCity('');
      setSelectedStatus('ALL');
      setSortOption('');
      setCurrentPage(1);
    });
  };

  const handleEditProperty = (prop) => {
    setPropertyToEdit(prop);
    setCreatePropertyModalOpen(true);
  };

  const handleDeleteProperty = async (propId) => {
    try {
      await api.deleteProperty(propId);
      showToast('Property deleted successfully from database', 'success');
      loadProperties();
    } catch (err) {
      showToast(err.message || 'Failed to delete property', 'error');
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / 10));
  const hasActiveFilters = searchTerm || selectedType !== 'ALL' || selectedCity || selectedStatus !== 'ALL' || sortOption;

  return (
    <div className="app">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenCreateProperty={() => {
          setPropertyToEdit(null);
          setCreatePropertyModalOpen(true);
        }}
      />

      {/* Main View Router */}
      <main className="main-content">
        {/* VIEW 1: EXPLORE PROPERTIES */}
        {activeTab === 'explore' && (
          <div>
            <Hero
              searchTerm={searchTerm}
              setSearchTerm={handleFilterChange(setSearchTerm)}
              selectedType={selectedType}
              setSelectedType={handleFilterChange(setSelectedType)}
              selectedCity={selectedCity}
              setSelectedCity={handleFilterChange(setSelectedCity)}
              selectedStatus={selectedStatus}
              setSelectedStatus={handleFilterChange(setSelectedStatus)}
              sortOption={sortOption}
              setSortOption={handleFilterChange(setSortOption)}
            />

            {/* Results Toolbar */}
            <div className="catalog-toolbar">
              <div>
                <h2 className="catalog-title">
                  {selectedType !== 'ALL' ? `${selectedType} Listings` : 'Featured Properties'}
                </h2>
                <span className="catalog-count">
                  Showing {properties.length} of {totalCount} verified homes
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {hasActiveFilters && (
                  <button className="btn-secondary" onClick={clearAllFilters} style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}>
                    <FilterX size={14} />
                    <span>Clear Filters</span>
                  </button>
                )}

                <button className="btn-secondary" onClick={loadProperties} title="Refresh listings from Django" style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}>
                  <RotateCcw size={14} className={isLoadingProps ? 'spin-icon' : ''} />
                  <span>Refresh</span>
                </button>

                {isAuthenticated && (user?.role === 'LANDLORD' || isAdmin) && (
                  <button
                    className="btn-primary"
                    style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
                    onClick={() => {
                      setPropertyToEdit(null);
                      setCreatePropertyModalOpen(true);
                    }}
                  >
                    <PlusCircle size={14} />
                    <span>List New Property</span>
                  </button>
                )}
              </div>
            </div>

            {/* Error Message */}
            {propError && (
              <div className="error-banner">
                <span>{propError}</span>
                <button className="btn-secondary" onClick={loadProperties} style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}>
                  Retry
                </button>
              </div>
            )}

            {/* Loading Skeleton */}
            {isLoadingProps ? (
              <div className="properties-grid">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="property-card-skeleton">
                    <div className="skeleton-image" />
                    <div className="skeleton-body">
                      <div className="skeleton-line title" />
                      <div className="skeleton-line address" />
                      <div className="skeleton-row">
                        <div className="skeleton-pill" />
                        <div className="skeleton-pill" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : properties.length === 0 ? (
              /* Empty State */
              <div className="blank-state">
                <div className="blank-icon">
                  <Building2 size={36} />
                </div>
                <h3 className="blank-title">No properties found</h3>
                <p className="blank-desc">
                  {hasActiveFilters
                    ? 'No homes matched your specific search filters. Try widening your criteria or reset all filters.'
                    : 'No property records currently exist in your PostgreSQL database. Add your first listing to get started.'}
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {hasActiveFilters && (
                    <button className="btn-secondary" onClick={clearAllFilters}>
                      <FilterX size={15} />
                      <span>Reset Filters</span>
                    </button>
                  )}
                  {isAuthenticated && (user?.role === 'LANDLORD' || isAdmin) && (
                    <button
                      className="btn-primary"
                      onClick={() => {
                        setPropertyToEdit(null);
                        setCreatePropertyModalOpen(true);
                      }}
                    >
                      <PlusCircle size={15} />
                      <span>Add First Property</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Property Cards Grid */
              <div className="properties-grid">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onSelect={(p) => setSelectedProperty(p)}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-bar">
                <button
                  className="pagination-btn"
                  disabled={currentPage <= 1 || isLoadingProps}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                <div className="pagination-pages">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      className={`pagination-num-btn ${currentPage === pg ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pg)}
                    >
                      {pg}
                    </button>
                  ))}
                </div>

                <button
                  className="pagination-btn"
                  disabled={currentPage >= totalPages || isLoadingProps}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: LANDLORD HUB */}
        {activeTab === 'landlord' && (
          isAuthenticated ? (
            <LandlordDashboard
              onOpenCreateProperty={() => {
                setPropertyToEdit(null);
                setCreatePropertyModalOpen(true);
              }}
              onEditProperty={handleEditProperty}
              onOpenCreateLease={(app) => setCreateLeaseApp(app)}
              onShowToast={showToast}
              onSelectProperty={(p) => setSelectedProperty(p)}
            />
          ) : (
            <div className="auth-required-box">
              <ShieldCheck size={40} color="#818cf8" />
              <h3>Landlord Hub Access Restricted</h3>
              <p>Please sign in with a verified Landlord or Admin account to manage your property portfolio, leases, and tenant applications.</p>
              <button className="btn-primary" onClick={() => setAuthModalOpen(true)}>
                <span>Sign In to Landlord Portal</span>
              </button>
            </div>
          )
        )}

        {/* VIEW 3: TENANT PORTAL */}
        {activeTab === 'tenant' && (
          isAuthenticated ? (
            <TenantPortal
              onOpenMaintenanceModal={(cb) => {
                setMaintenanceSuccessCb(() => cb);
                setMaintenanceModalOpen(true);
              }}
              onOpenPaymentModal={(cb) => {
                setPaymentSuccessCb(() => cb);
                setPaymentModalOpen(true);
              }}
              onShowToast={showToast}
              setActiveTab={setActiveTab}
            />
          ) : (
            <div className="auth-required-box">
              <ShieldCheck size={40} color="#818cf8" />
              <h3>Tenant Portal Access Restricted</h3>
              <p>Sign in to access your rental applications, view active lease agreements, file maintenance tickets, and submit rent payments.</p>
              <button className="btn-primary" onClick={() => setAuthModalOpen(true)}>
                <span>Sign In to Tenant Portal</span>
              </button>
            </div>
          )
        )}

        {/* VIEW 4: ADMIN VIEW & API MONITOR */}
        {activeTab === 'admin' && <AdminView />}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <Building2 size={20} color="#818cf8" />
            <span>EstateSphere &middot; Django REST Property Management</span>
          </div>
          <div className="footer-links">
            <span className="footer-status-pill">
              <span className="dot" />
              <span>DRF PostgreSQL Core Live</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          onShowToast={showToast}
        />
      )}

      {createPropertyModalOpen && (
        <CreatePropertyModal
          propertyToEdit={propertyToEdit}
          onClose={() => {
            setCreatePropertyModalOpen(false);
            setPropertyToEdit(null);
          }}
          onSuccess={() => {
            loadProperties();
            showToast(propertyToEdit ? 'Property updated successfully!' : 'Property listed successfully!', 'success');
          }}
          onShowToast={showToast}
        />
      )}

      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onShowToast={showToast}
          onOpenAuth={() => setAuthModalOpen(true)}
          onEditProperty={handleEditProperty}
          onDeleteProperty={handleDeleteProperty}
        />
      )}

      {createLeaseApp && (
        <CreateLeaseModal
          application={createLeaseApp}
          onClose={() => setCreateLeaseApp(null)}
          onSuccess={() => {
            showToast('Lease contract issued successfully!', 'success');
          }}
          onShowToast={showToast}
        />
      )}

      {maintenanceModalOpen && (
        <MaintenanceModal
          onClose={() => setMaintenanceModalOpen(false)}
          onSuccess={() => {
            if (maintenanceSuccessCb) maintenanceSuccessCb();
            showToast('Maintenance request dispatched!', 'success');
          }}
          onShowToast={showToast}
        />
      )}

      {paymentModalOpen && (
        <PaymentModal
          onClose={() => setPaymentModalOpen(false)}
          onSuccess={() => {
            if (paymentSuccessCb) paymentSuccessCb();
            showToast('Payment recorded in ledger!', 'success');
          }}
          onShowToast={showToast}
        />
      )}

      {/* Toast Notification Layer */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
