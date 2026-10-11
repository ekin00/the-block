const DEFAULT_BASE_URL = 'http://localhost:5000';

// Deployments override the API origin via Vite env; localhost is the dev fallback.
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL;

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Registered by the app shell (inside the router) so a 401 clears identity
// state and navigates to the join screen without a hard page reload.
let onUnauthorized = null;

export const setOnUnauthorized = (handler) => {
  onUnauthorized = typeof handler === 'function' ? handler : null;
};

const getUserHeaders = () => {
  const stored = localStorage.getItem('user');
  let userId = '';
  if (stored) {
    try {
      userId = JSON.parse(stored).id ?? '';
    } catch {
      localStorage.removeItem('user');
    }
  }
  return {
    'Content-Type': 'application/json',
    'X-User-Id': userId,
  };
};

const handleResponse = async (response) => {
  // Successful empty responses (DELETE favorites/comparison) have no body.
  if (response.status === 204) {
    return null;
  }

  // Read as text first: non-JSON error pages must not throw SyntaxError.
  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (response.status === 401) {
    if (onUnauthorized) {
      onUnauthorized();
    }
    const message =
      (data && (data.error || data.message)) || 'Unknown user. Please join again.';
    throw new ApiError(message, 401);
  }

  if (!response.ok) {
    const message =
      (data && (data.error || data.message)) ||
      `Request failed (status ${response.status})`;
    throw new ApiError(message, response.status);
  }

  return data;
};

const request = async (endpoint, { method = 'GET', data, signal } = {}) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: getUserHeaders(),
    body: data !== undefined ? JSON.stringify(data) : undefined,
    signal,
  });
  return handleResponse(response);
};

export const api = {
  get: (endpoint, { signal } = {}) => request(endpoint, { signal }),

  post: (endpoint, data, { signal } = {}) =>
    request(endpoint, { method: 'POST', data, signal }),

  put: (endpoint, data, { signal } = {}) =>
    request(endpoint, { method: 'PUT', data, signal }),

  patch: (endpoint, data, { signal } = {}) =>
    request(endpoint, { method: 'PATCH', data, signal }),

  delete: (endpoint, { signal } = {}) =>
    request(endpoint, { method: 'DELETE', signal }),

  users: {
    join: async (data) => {
      return api.post('/users/join', data);
    }
  }
};

export default api;