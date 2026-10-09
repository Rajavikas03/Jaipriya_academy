import { apiClient } from './api';

const TOKEN_KEY = 'jaipriya_access_token';
const REFRESH_KEY = 'jaipriya_refresh_token';

export const authService = {
  /**
   * Passwordless Student Login with mobile number
   */
  async studentLogin(mobileNumber) {
    const data = await apiClient('/auth/student-login/', {
      method: 'POST',
      body: JSON.stringify({ mobile_number: mobileNumber }),
    });

    if (data.access) {
      localStorage.setItem(TOKEN_KEY, data.access);
    }
    if (data.refresh) {
      localStorage.setItem(REFRESH_KEY, data.refresh);
    }

    return data;
  },

  /**
   * Admin Login with mobile number & password
   */
  async adminLogin(mobileNumber, password) {
    const data = await apiClient('/auth/admin-login/', {
      method: 'POST',
      body: JSON.stringify({ mobile_number: mobileNumber, password }),
    });

    if (data.access) {
      localStorage.setItem(TOKEN_KEY, data.access);
    }
    if (data.refresh) {
      localStorage.setItem(REFRESH_KEY, data.refresh);
    }

    return data;
  },

  /**
   * Refresh JWT access token
   */
  async refreshToken() {
    const refresh = localStorage.getItem(REFRESH_KEY);
    if (!refresh) throw new Error('No refresh token available');

    const data = await apiClient('/auth/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    });

    if (data.access) {
      localStorage.setItem(TOKEN_KEY, data.access);
    }
    return data.access;
  },

  /**
   * Get current authenticated user details
   */
  async getCurrentUser() {
    return await apiClient('/auth/me/', {
      method: 'GET',
    });
  },

  /**
   * Clear auth session
   */
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },

  getAccessToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated() {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};
