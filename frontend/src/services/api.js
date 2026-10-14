//const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const API_BASE_URL =`${import.meta.env.VITE_API_URL || 'https://jaipriya-academy.onrender.com'}/api`;


export function getAccessToken() {
  return localStorage.getItem('jaipriya_access_token');
}

export function getRefreshToken() {
  return localStorage.getItem('jaipriya_refresh_token');
}

export function setTokens(access, refresh) {
  if (access) localStorage.setItem('jaipriya_access_token', access);
  if (refresh) localStorage.setItem('jaipriya_refresh_token', refresh);
}

export function clearTokens() {
  localStorage.removeItem('jaipriya_access_token');
  localStorage.removeItem('jaipriya_refresh_token');
}

export async function apiClient(endpoint, options = {}) {
  const url = `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
  const token = getAccessToken();

  const headers = {
    ...(!(options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };

  if (options.body instanceof FormData && headers['Content-Type']) {
    delete headers['Content-Type'];
  }

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }


  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.detail || data.message || 'API request failed.');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (!error.status) {
      // Network or connection issue
      error.message = 'Unable to connect to academy server. Please verify backend is running.';
    }
    throw error;
  }
}

