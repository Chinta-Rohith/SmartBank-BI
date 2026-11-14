const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('smartbank_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = options.isFormData
    ? { ...(localStorage.getItem('smartbank_token') ? { 'Authorization': `Bearer ${localStorage.getItem('smartbank_token')}` } : {}) }
    : { ...getAuthHeaders(), ...options.headers };

  const config = {
    ...options,
    headers
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorDetail = 'API request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch {
      errorDetail = `HTTP ${response.status} ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  getMe: () => request('/auth/me'),
  getDemoAccounts: () => request('/auth/demo-accounts'),

  // Dashboard
  getDashboardKPIs: () => request('/dashboard/kpis'),
  getDashboardCharts: () => request('/dashboard/charts'),

  // Customers
  getCustomers: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/customers?${q}`);
  },
  getCustomerById: (id) => request(`/customers/${id}`),
  createCustomer: (data) => request('/customers', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Loans
  getLoans: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/loans?${q}`);
  },
  getLoanAnalytics: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/loans/analytics?${q}`);
  },

  // Prediction & ML
  predictDefaultRisk: (payload) => request('/predictions/predict', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getModelMetrics: () => request('/predictions/metrics'),
  retrainModel: () => request('/predictions/retrain', { method: 'POST' }),

  // Eligibility
  checkEligibility: (payload) => request('/eligibility/check', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Customer Segmentation
  getSegmentation: () => request('/segmentation'),
  reclusterSegmentation: () => request('/segmentation/recluster', { method: 'POST' }),

  // Complaints
  getComplaints: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/complaints?${q}`);
  },
  getComplaintAnalytics: () => request('/complaints/analytics'),
  createComplaint: (data) => request('/complaints', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateComplaint: (id, data) => request(`/complaints/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),

  // Revenue
  getRevenueSummary: () => request('/revenue/summary'),

  // ETL
  getETLStats: () => request('/etl/stats'),
  uploadDataset: async (type, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request(`/etl/upload/${type}`, {
      method: 'POST',
      body: formData,
      isFormData: true
    });
  },
  getSampleDownloadUrl: (type) => `${API_BASE}/etl/sample-files/${type}`,

  // Reports
  getReportPreview: (type, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/reports/preview/${type}?${q}`);
  },
  getReportExportUrl: (type) => `${API_BASE}/reports/export/csv/${type}`,

  // Settings
  getSettings: () => request('/settings'),
  updatePolicy: (key, value) => request(`/settings/policies/update?key=${encodeURIComponent(key)}&value=${encodeURIComponent(value)}`, {
    method: 'POST'
  }),
  reseedDatabase: (count = 5000) => request(`/settings/reseed?count=${count}`, {
    method: 'POST'
  })
};
