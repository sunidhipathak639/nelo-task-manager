import api from './api'
import { setSession, clearSession } from '../utils/sessionStorage'

export const authService = {
  // Login user
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, user } = response.data
      
      // Store token in sessionStorage
      setSession(token)
      
      return { success: true, user, token }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed. Please try again.'
      }
    }
  },

  // Register user
  async register(email, password, name) {
    try {
      const response = await api.post('/auth/register', { email, password, name })
      const { token, user } = response.data
      
      // Store token in sessionStorage
      setSession(token)
      
      return { success: true, user, token }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed. Please try again.'
      }
    }
  },

  // Logout user
  logout() {
    clearSession()
    window.location.href = '/login'
  },

  // Verify token
  async verify() {
    try {
      const response = await api.get('/auth/verify')
      return { success: true, user: response.data.user }
    } catch (error) {
      return { success: false, error: error.response?.data?.error }
    }
  }
}

