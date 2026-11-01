import api from './api';

export const historyService = {
  async getUserHistory({ toolType, search, page = 1, limit = 20 } = {}) {
    const params = { page, limit };
    if (toolType && toolType !== 'all') params.toolType = toolType;
    if (search && search.trim() !== '') params.search = search.trim();

    const response = await api.get('/history', { params });
    return response.data;
  },

  async getHistoryById(id) {
    const response = await api.get(`/history/${id}`);
    return response.data;
  },

  async deleteHistoryItem(id) {
    const response = await api.delete(`/history/${id}`);
    return response.data;
  },

  async clearAllHistory() {
    const response = await api.delete('/history/clear-all');
    return response.data;
  },

  async getDashboardStats() {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};

export default historyService;
