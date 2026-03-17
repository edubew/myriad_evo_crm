import api from "./api";

export const authService = {
  async register(data) {
    const response = await api.post('/register', { user: data })
    return response.data
  },

  async login(data) {
    const response = await api.post('/login', { user: data })
    const token = response.headers['authorization']?.split('')[1]
    return { ...response.data, token}
  },

  async logout() {
    await api.delete('/logout')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}