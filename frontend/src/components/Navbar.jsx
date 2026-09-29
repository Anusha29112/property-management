import { Building2, PlusCircle, LogOut, LogIn, ArrowLeftRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenCreateProperty,
}) {
  const {
    user,
    isAuthenticated,
    isAdmin,
    logout,
    switchRole,
    backendOnline,
  } = useAuth();

  return (
    <header className="navbar">
      {/* Brand */}
      <div className="nav-brand" onClick={() => setActiveTab('explore')}>
        <div className="brand-icon-box">
          <Building2 size={24} />
        </div>
        <div className="brand-text">
          <h1>EstateSphere</h1>
          <span className="brand-tag">Django Property Cloud</span>
        </div>
      </div>

      {/* Center Navigation Tabs */}
      <nav className="nav-links">
        <button
          className={`nav-tab-btn ${activeTab === 'explore' ? 'active' : ''}`}
          onClick={() => setActiveTab('explore')}
        >
          Properties
        </button>

        {isAuthenticated && (user?.role === 'LANDLORD' || isAdmin) && (
          <button
            className={`nav-tab-btn ${activeTab === 'landlord' ? 'active' : ''}`}
            onClick={() => setActiveTab('landlord')}
          >
            Landlord Hub
          </button>
        )}

        {isAuthenticated && (user?.role === 'TENANT' || isAdmin) && (
          <button
            className={`nav-tab-btn ${activeTab === 'tenant' ? 'active' : ''}`}
            onClick={() => setActiveTab('tenant')}
          >
            Tenant Portal
          </button>
        )}

        <button
          className={`nav-tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveTab('admin')}
        >
          System & API
        </button>
      </nav>

      {/* Right Actions */}
      <div className="nav-actions">
        {/* Backend Status Dot */}
        <div
          className={`backend-status-pill ${backendOnline ? 'online' : 'demo'}`}
          title={backendOnline ? 'Django REST Framework connected (port 8000)' : 'Django server offline (Run: python manage.py runserver)'}
        >
          <span className={`status-dot ${backendOnline ? 'online' : 'demo'}`} />
          <span>{backendOnline ? 'Django Live' : 'Django Offline'}</span>
        </div>

        {/* Landlord Quick Add Property Button */}
        {isAuthenticated && (user?.role === 'LANDLORD' || isAdmin) && (
          <button className="btn-primary" onClick={onOpenCreateProperty}>
            <PlusCircle size={16} />
            <span>List Property</span>
          </button>
        )}

        {/* User Profile or Login */}
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="user-profile-badge">
              <div className="avatar-circle">
                {user.first_name ? user.first_name[0] : (user.username ? user.username[0]?.toUpperCase() : 'U')}
              </div>
              <div className="user-name-role">
                <span className="name">{user.username}</span>
                <span className="role">{user.role}</span>
              </div>
            </div>

            {/* Role Switcher button */}
            <button
              className="btn-icon-only"
              title={`Switch role view (Currently ${user.role})`}
              onClick={() => {
                const nextRole = user.role === 'LANDLORD' ? 'TENANT' : 'LANDLORD';
                switchRole(nextRole);
                setActiveTab(nextRole === 'LANDLORD' ? 'landlord' : 'tenant');
              }}
            >
              <ArrowLeftRight size={15} />
            </button>

            {/* Logout */}
            <button
              className="btn-icon-only"
              title="Sign Out"
              onClick={logout}
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button className="btn-primary" onClick={onOpenAuth}>
            <LogIn size={16} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
