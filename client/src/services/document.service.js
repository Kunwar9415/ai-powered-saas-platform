import api from './api';

export const documentService = {
  async uploadDocument(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async analyzeDocument({ documentId, rawText, fileName, mode = 'summarize', provider = 'ollama' }) {
    const response = await api.post('/documents/analyze', {
      documentId,
      rawText,
      fileName,
      mode,
      provider,
    });
    return response.data;
  },

  async getUserDocuments() {
    const response = await api.get('/documents');
    return response.data;
  },

  async getDocumentById(id) {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  async deleteDocument(id) {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },
};

export default documentService;
