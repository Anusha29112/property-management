const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const getToken = () => localStorage.getItem('estatesphere_access_token');
export const getRefreshToken = () => localStorage.getItem('estatesphere_refresh_token');

export const setTokens = (access, refresh) => {
  if (access) localStorage.setItem('estatesphere_access_token', access);
  if (refresh) localStorage.setItem('estatesphere_refresh_token', refresh);
};

export const clearTokens = () => {
  localStorage.removeItem('estatesphere_access_token');
  localStorage.removeItem('estatesphere_refresh_token');
  localStorage.removeItem('estatesphere_user');
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('estatesphere_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem('estatesphere_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('estatesphere_user');
  }
};

// Formats Django REST Framework error responses into a readable string
export function parseApiError(errData) {
  if (!errData) return 'An unexpected error occurred.';
  if (typeof errData === 'string') return errData;
  if (errData.detail) return errData.detail;
  if (errData.error) return errData.error;
  if (errData.mesage) return errData.mesage;
  if (Array.isArray(errData.non_field_errors) && errData.non_field_errors.length > 0) {
    return errData.non_field_errors[0];
  }

  // Field validation errors e.g. { username: ["A user with that username already exists."] }
  const messages = [];
  for (const [key, value] of Object.entries(errData)) {
    const fieldMsg = Array.isArray(value) ? value.join(' ') : String(value);
    messages.push(`${key}: ${fieldMsg}`);
  }
  return messages.length > 0 ? messages.join(' | ') : 'Validation error';
}

// Centralized request wrapper attaching JWT token
async function request(endpoint, options = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const headers = {
    'Accept': 'application/json',
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return { success: true };
  }

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const errorMsg = parseApiError(data);
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;

    if (response.status === 401) {
      // Auto-clear invalid/expired token
      clearTokens();
    }
    throw err;
  }

  return data;
}

export const api = {
  // 1. Authentication
  async register(formData) {
    return await request('/register/', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  },

  async login(credentials) {
    const data = await request('/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (data.access) {
      setTokens(data.access, data.refresh);
    }
    return data;
  },

  async checkAdmin() {
    return await request('/admin-test/');
  },

  async getAdminDashboard() {
    return await request('/admin/dashboard/');
  },

  // 2. Properties
  async getProperties(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.property_type && params.property_type !== 'ALL') query.append('property_type', params.property_type);
    if (params.city) query.append('city', params.city);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.sort) query.append('sort', params.sort);
    if (params.page) query.append('page', params.page);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await request(`/properties/${qs}`);

    // If paginated response ({ count, next, previous, results })
    if (res && res.results && Array.isArray(res.results)) {
      const arr = [...res.results];
      arr.results = res.results;
      arr.count = res.count ?? res.results.length;
      arr.next = res.next;
      arr.previous = res.previous;
      return arr;
    }

    const arr = Array.isArray(res) ? [...res] : [];
    arr.results = arr;
    arr.count = arr.length;
    arr.next = null;
    arr.previous = null;
    return arr;
  },

  async getProperty(id) {
    return await request(`/properties/${id}/`);
  },

  async createProperty(data) {
    return await request('/properties/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProperty(id, data) {
    // PropertyDetailView implements def put(self, request, pk)
    return await request(`/properties/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteProperty(id) {
    return await request(`/properties/${id}/`, {
      method: 'DELETE',
    });
  },

  // Property Images
  async getPropertyImages(propertyId) {
    return await request(`/properties/${propertyId}/images/`);
  },

  async addPropertyImage(propertyId, data) {
    return await request(`/properties/${propertyId}/images/`, {
      method: 'POST',
      body: data,
    });
  },

  // 3. Rental Applications
  async getTenantApplications() {
    try {
      return await request('/rental-application/');
    } catch (err) {
      if (err.status === 404) {
        return await request('/rental-applications/');
      }
      throw err;
    }
  },

  async submitApplication(data) {
    // { property: property_id, message: "..." }
    try {
      return await request('/rental-application/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err) {
      if (err.status === 404) {
        return await request('/rental-applications/', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      }
      throw err;
    }
  },

  async getLandlordApplications() {
    return await request('/landlord/applications/');
  },

  async decideApplication(id, status) {
    // LandlordApplicationDecisionView uses def patch(self, request, pk)
    // status must be 'APPROVED' or 'REJECTED'
    return await request(`/landlord/applications/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // 4. Leases
  async getLeases() {
    return await request('/leases/');
  },

  async getLease(id) {
    return await request(`/leases/${id}/`);
  },

  async createLease(data) {
    // Landlord creates lease: { application: id, start_date: YYYY-MM-DD, end_date: YYYY-MM-DD, monthly_rent: ... }
    return await request('/leases/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateLeaseStatus(id, status) {
    // LeaseView.patch: { status: 'ENDED' | 'TERMINATED' }
    return await request(`/leases/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // 5. Maintenance Requests
  async getMaintenanceRequests() {
    return await request('/maintenance-requests/');
  },

  async createMaintenanceRequest(data) {
    // Tenant creates: { property: id, title: ..., description: ..., priority: ... }
    return await request('/maintenance-requests/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateMaintenance(id, data) {
    // Landlord updates status or priority, Tenant cancels with status: 'CANCELLED'
    return await request(`/maintenance-requests/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // 6. Payments
  async getPayments() {
    return await request('/payments/');
  },

  async createPayment(data) {
    // Tenant creates: { lease: id, amount: ..., payment_date: ..., payment_method: ..., reference: ... }
    return await request('/payments/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 7. Landlord Dashboard
  async getLandlordDashboard() {
    return await request('/landlord/dashboard/');
  },
};
