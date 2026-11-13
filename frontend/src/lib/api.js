// Frontend API Client connecting to Node.js Backend Server
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

// Helper for storing / retrieving JWT token
export const getToken = () => localStorage.getItem('campus_auth_token');
export const setToken = (token) => localStorage.setItem('campus_auth_token', token);
export const removeToken = () => localStorage.removeItem('campus_auth_token');

export async function apiRequest(endpoint, method = 'GET', body = null) {
  const startTime = performance.now();
  const headers = {
    'Content-Type': 'application/json',
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  let data = null;
  let status = 200;
  let errorMsg = null;

  try {
    const res = await fetch(`${API_URL}${endpoint}`, config);
    status = res.status;
    data = await res.json();

    if (!res.ok) {
      errorMsg = data.error || 'Server request failed';
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    errorMsg = err.message;
    throw err;
  } finally {
    const durationMs = Math.round(performance.now() - startTime);

    // Broadcast query execution event to DBMS Dev Inspector
    if (typeof window !== 'undefined') {
      const sqlText = data?.sql || (errorMsg ? `-- ERROR (${status}): ${errorMsg}\n-- Failed Request: ${method} ${endpoint}` : `-- Query executed for ${method} ${endpoint}`);
      window.dispatchEvent(
        new CustomEvent('dbms:query-executed', {
          detail: {
            id: Date.now() + Math.random(),
            endpoint,
            method,
            status,
            durationMs,
            sql: sqlText,
            timestamp: new Date().toLocaleTimeString(),
            success: !errorMsg,
          },
        })
      );
    }
  }
}
