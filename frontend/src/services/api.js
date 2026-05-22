const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...options.headers },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || 'Request failed');
    err.status = res.status;
    err.errors = data.errors;
    throw err;
  }

  return data;
}

export const api = {
  auth: {
    register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    me: () => request('/auth/me'),
    changePassword: (body) =>
      request('/auth/password', { method: 'PUT', body: JSON.stringify(body) }),
  },
  admin: {
    dashboard: () => request('/admin/dashboard'),
    users: (params) => request(`/admin/users?${new URLSearchParams(params)}`),
    user: (id) => request(`/admin/users/${id}`),
    createUser: (body) =>
      request('/admin/users', { method: 'POST', body: JSON.stringify(body) }),
    updateUser: (id, body) =>
      request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
    stores: (params) => request(`/admin/stores?${new URLSearchParams(params)}`),
    createStore: (body) =>
      request('/admin/stores', { method: 'POST', body: JSON.stringify(body) }),
    updateStore: (id, body) =>
      request(`/admin/stores/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteStore: (id) => request(`/admin/stores/${id}`, { method: 'DELETE' }),
  },
  stores: {
    list: (params) => request(`/stores?${new URLSearchParams(params)}`),
  },
  ratings: {
    create: (body) => request('/ratings', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) =>
      request(`/ratings/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  },
  owner: {
    dashboard: () => request('/owner/dashboard'),
  },
};
