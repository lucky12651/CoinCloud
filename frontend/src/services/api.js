import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
  // Wallet creation (bitcoinlib) can take a while
  timeout: 180_000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cc_token')
      localStorage.removeItem('cc_user')
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        // soft redirect only for protected flows
      }
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  me: () => api.get('/api/auth/me'),
  changePassword: (data) => api.post('/api/auth/change-password', data),
  recoveryPhrase: () => api.get('/api/auth/recovery-phrase'),
}

export const walletApi = {
  addresses: () => api.get('/api/wallet/addresses'),
  balance: (coin) => api.get('/api/wallet/balance', { params: { coin } }),
  balances: () => api.get('/api/wallet/balances'),
  send: (data) => api.post('/api/wallet/send', data),
  transactions: (coin) => api.get('/api/wallet/transactions', { params: { coin } }),
  sendHistory: () => api.get('/api/wallet/send-history'),
}

export const adminApi = {
  stats: () => api.get('/api/admin/stats'),
  users: (q) => api.get('/api/admin/users', { params: q ? { q } : {} }),
  updateUser: (id, data) => api.patch(`/api/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
  transactions: (limit = 50) => api.get('/api/admin/transactions', { params: { limit } }),
}

export const marketApi = {
  prices: () => api.get('/api/market/prices'),
}

export default api
