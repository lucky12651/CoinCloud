import { create } from 'zustand'
import { authApi } from '../services/api'

const savedUser = (() => {
  try {
    return JSON.parse(localStorage.getItem('cc_user') || 'null')
  } catch {
    return null
  }
})()

export const useAuthStore = create((set, get) => ({
  token: localStorage.getItem('cc_token') || null,
  user: savedUser,
  loading: false,

  setSession: (token, user) => {
    localStorage.setItem('cc_token', token)
    localStorage.setItem('cc_user', JSON.stringify(user))
    set({ token, user })
  },

  logout: () => {
    localStorage.removeItem('cc_token')
    localStorage.removeItem('cc_user')
    set({ token: null, user: null })
  },

  refreshMe: async () => {
    if (!get().token) return null
    try {
      const { data } = await authApi.me()
      localStorage.setItem('cc_user', JSON.stringify(data))
      set({ user: data })
      return data
    } catch {
      get().logout()
      return null
    }
  },

  isAuthenticated: () => Boolean(get().token),
  isAdmin: () => Boolean(get().user?.is_admin),
}))
