import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: BASE_URL ? `${BASE_URL}/api` : '/api',
})

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('lumen_token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('lumen_token')
    localStorage.removeItem('lumen_user')
    window.location.href = '/login'
  }
  return Promise.reject(err)
})

export default api
