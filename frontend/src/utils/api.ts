import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'X-Telegram-InitData': (window as any).Telegram?.WebApp?.initData || ''
  }
})

export const getUser = () => api.get('/user/register')
export const getDashboard = () => api.get('/dashboard')
export const createDeal = (data: any) => api.post('/deal/create', data)
export const acceptDeal = (dealId: number) => api.post(`/deal/${dealId}/accept`)
export const depositDeal = (dealId: number) => api.post(`/deal/${dealId}/deposit`)
export const releaseDeal = (dealId: number) => api.post(`/deal/${dealId}/release`)
export const disputeDeal = (dealId: number) => api.post(`/deal/${dealId}/dispute`)
