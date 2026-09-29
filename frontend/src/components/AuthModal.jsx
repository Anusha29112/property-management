import { useState } from 'react';
import { X, Lock, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ onClose, onShowToast }) {
  const { login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'TENANT',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    const res = await login(formData.username.trim(), formData.password);
    setIsLoading(false);
    if (res.success) {
      onShowToast(`Welcome back, ${formData.username}!`, 'success');
      onClose();
    } else {
      setErrorMsg(res.error || 'Invalid username or password.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const payload = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      role: formData.role,
      phone: formData.phone.trim(),
    };

    const res = await register(payload);
    setIsLoading(false);
    if (res.success) {
      onShowToast('Account successfully created! You can now log in.', 'success');
      setIsRegisterMode(false);
    } else {
      setErrorMsg(res.error || 'Registration failed. Please check form values.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {isRegisterMode ? <UserPlus size={20} color="#818cf8" /> : <Lock size={20} color="#818cf8" />}
            <h3>{isRegisterMode ? 'Create Account' : 'Sign In'}</h3>
          </div>
          <button className="btn-icon-only" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {errorMsg && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '8px',
              padding: '0.75rem',
              color: '#fb7185',
              fontSize: '0.85rem',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center'
            }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {!isRegisterMode ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  name="username"
                  className="form-input"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'underline' }}
                  onClick={() => { setIsRegisterMode(true); setErrorMsg(''); }}
                >
                  Create Account
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    className="form-input"
                    placeholder="Jane"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    className="form-input"
                    placeholder="Doe"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="jane.doe@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    name="username"
                    className="form-input"
                    placeholder="janedoe"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>User Role *</label>
                  <select
                    name="role"
                    className="form-select"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="TENANT">Tenant (Search & Rent)</option>
                    <option value="LANDLORD">Landlord (List & Manage)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    name="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    placeholder="+1 555-0199"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Register'}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
                Already registered?{' '}
                <button
                  type="button"
                  style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'underline' }}
                  onClick={() => { setIsRegisterMode(false); setErrorMsg(''); }}
                >
                  Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
