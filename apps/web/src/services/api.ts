const API_BASE_URL = 'http://localhost:3001';

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('af_token');
  }
  return null;
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('af_token', token);
  }
}

export function removeAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('af_token');
  }
}

async function request(path: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  signup: (name: string, email: string, password: string) => request('/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  login: (email: string, password: string) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getProfile: () => request('/auth/profile'),

  // Users
  getUsers: () => request('/users'),
  updateUserRole: (id: string, role: string) => request(`/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  updateUserStatus: (id: string, status: 'Active' | 'Inactive') => request(`/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Assets
  getAssets: () => request('/assets'),
  getAsset: (id: string) => request(`/assets/${id}`),
  createAsset: (data: any) => request('/assets', { method: 'POST', body: JSON.stringify(data) }),
  updateAsset: (id: string, data: any) => request(`/assets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Allocations
  getAllocations: () => request('/allocations'),
  getAllocation: (id: string) => request(`/allocations/${id}`),
  createAllocation: (data: any) => request('/allocations', { method: 'POST', body: JSON.stringify(data) }),
  updateAllocation: (id: string, data: any) => request(`/allocations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  createTransferRequest: (data: any) => request('/allocations/transfer', { method: 'POST', body: JSON.stringify(data) }),
  resolveTransferRequest: (id: string, status: string, resolvedByUserId: string) => request(`/allocations/transfer/${id}`, { method: 'PATCH', body: JSON.stringify({ status, resolvedByUserId }) }),

  // Departments
  getDepartments: () => request('/departments'),
  getDepartment: (id: string) => request(`/departments/${id}`),
  createDepartment: (data: any) => request('/departments', { method: 'POST', body: JSON.stringify(data) }),
  updateDepartment: (id: string, data: any) => request(`/departments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Categories
  getCategories: () => request('/categories'),
  createCategory: (data: any) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),

  // Maintenance
  getMaintenanceRequests: () => request('/maintenance'),
  createMaintenanceRequest: (data: any) => request('/maintenance', { method: 'POST', body: JSON.stringify(data) }),
  updateMaintenanceStatus: (id: string, status: string, resolvedByUserId: string) => request(`/maintenance/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, resolvedByUserId }) }),

  // Audits
  getAudits: () => request('/audits'),
  createAudit: (data: any) => request('/audits', { method: 'POST', body: JSON.stringify(data) }),
  submitAuditRecord: (data: any) => request('/audits/records', { method: 'POST', body: JSON.stringify(data) }),
  closeAuditCycle: (id: string) => request(`/audits/${id}/close`, { method: 'PATCH' }),

  // Bookings
  getBookings: () => request('/bookings'),
  createBooking: (data: any) => request('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  cancelBooking: (id: string) => request(`/bookings/${id}/cancel`, { method: 'PATCH' }),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationsRead: () => request('/notifications/read-all', { method: 'PATCH' }),
};
