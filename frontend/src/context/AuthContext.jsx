import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { getAccessToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (err) {
        // Try refreshing token once
        try {
          await authService.refreshToken();
          const refreshedUserData = await authService.getCurrentUser();
          setUser(refreshedUserData);
        } catch (refreshErr) {
          // Tokens invalid, clean logout
          authService.logout();
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const studentLogin = async (mobileNumber) => {
    setLoading(true);
    try {
      const response = await authService.studentLogin(mobileNumber);
      if (response.user) {
        setUser(response.user);
      } else {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
      return response;
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (mobileNumber, password) => {
    setLoading(true);
    try {
      const response = await authService.adminLogin(mobileNumber, password);
      if (response.user) {
        setUser(response.user);
      } else {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
      return response;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isStudent = user?.role === 'STUDENT';
  const isAdmin = user?.role === 'ACADEMY_ADMIN';

  const value = {
    user,
    role: user?.role,
    isStudent,
    isAdmin,
    loading,
    isAuthenticated: !!user,
    studentLogin,
    adminLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
