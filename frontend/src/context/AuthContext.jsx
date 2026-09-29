import { createContext, useState, useEffect, useCallback } from 'react';
import {
  api,
  getToken,
  clearTokens,
  getStoredUser,
  setStoredUser,
} from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(getStoredUser());
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(false);
  const [checkingBackend, setCheckingBackend] = useState(false);

  // Ping backend to check live status
  const refreshBackendStatus = useCallback(async () => {
    setCheckingBackend(true);
    try {
      const res = await fetch('/api/properties/');
      if (res.status < 500) {
        setBackendOnline(true);
      } else {
        setBackendOnline(false);
      }
    } catch {
      setBackendOnline(false);
    } finally {
      setCheckingBackend(false);
    }
  }, []);

  // Validate active session on startup
  const checkSession = useCallback(async () => {
    refreshBackendStatus();
    const existingToken = getToken();
    if (!existingToken) {
      setUser(null);
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    try {
      // Test if token is still valid by requesting admin check or properties
      const adminRes = await api.checkAdmin().catch(() => null);
      if (adminRes && adminRes.mesage) {
        setIsAdmin(true);
      }
      const stored = getStoredUser();
      if (stored) {
        setUser(stored);
      }
    } catch {
      // Token is invalid/expired
      clearTokens();
      setToken(null);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }, [refreshBackendStatus]);

  useEffect(() => {
    let isMounted = true;
    checkSession().then(() => {
      if (!isMounted) return;
    });
    return () => {
      isMounted = false;
    };
  }, [checkSession]);

  const login = async (username, password) => {
    try {
      const res = await api.login({ username, password });
      setToken(res.access);

      // Determine user role
      let detectedRole = 'TENANT';
      const storedRole = localStorage.getItem(`estatesphere_role_${username.toLowerCase()}`);
      if (storedRole) {
        detectedRole = storedRole;
      }

      // Check admin status
      try {
        const adminRes = await api.checkAdmin();
        if (adminRes && adminRes.mesage) {
          detectedRole = 'ADMIN';
          setIsAdmin(true);
        }
      } catch {
        // Not admin
      }

      const userInfo = {
        username,
        role: detectedRole,
        first_name: username.charAt(0).toUpperCase() + username.slice(1),
      };

      setUser(userInfo);
      setStoredUser(userInfo);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const register = async (formData) => {
    try {
      await api.register(formData);
      // Remember role for this username
      if (formData.username && formData.role) {
        localStorage.setItem(`estatesphere_role_${formData.username.toLowerCase()}`, formData.role);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = () => {
    clearTokens();
    setToken(null);
    setUser(null);
    setIsAdmin(false);
  };

  const switchRole = (newRole) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    setUser(updated);
    setStoredUser(updated);
    localStorage.setItem(`estatesphere_role_${user.username.toLowerCase()}`, newRole);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !!user,
        isAdmin,
        isLoading,
        backendOnline,
        checkingBackend,
        refreshBackendStatus,
        login,
        register,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
export { useAuth } from './useAuth';
