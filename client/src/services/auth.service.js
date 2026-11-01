import api from './api';

export const authService = {
  async register(name, email, password) {
    const response = await api.post('/auth/register', { name, email, password });
    if (response.data?.data?.token) {
      localStorage.setItem('omni_ai_token', response.data.data.token);
      localStorage.setItem('omni_ai_user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data?.data?.token) {
      localStorage.setItem('omni_ai_token', response.data.data.token);
      localStorage.setItem('omni_ai_user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async updateProfile(name, newPassword) {
    const response = await api.put('/auth/profile', { name, newPassword });
    if (response.data?.data?.user) {
      localStorage.setItem('omni_ai_user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('omni_ai_token');
    localStorage.removeItem('omni_ai_user');
  },

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('omni_ai_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('omni_ai_token');
  },
};

export default authService;
