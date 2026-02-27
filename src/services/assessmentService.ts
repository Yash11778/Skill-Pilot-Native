import api from './api';

const assessmentService = {
  getAssessments: async (filters = {}) => {
    const response = await api.get('/assessment', { params: filters });
    return response.data;
  },

  getAssessment: async (assessmentId: string) => {
    const response = await api.get(`/assessment/${assessmentId}`);
    return response.data;
  },

  submitAssessment: async (assessmentId: string, data: any) => {
    const response = await api.post(`/assessment/${assessmentId}/submit`, data);
    return response.data;
  },

  getUserResults: async (filters = {}) => {
    const response = await api.get('/assessment/results', { params: filters });
    return response.data;
  },

  getAssessmentResult: async (resultId: string) => {
    const response = await api.get(`/assessment/results/${resultId}`);
    return response.data;
  },
};

export default assessmentService;
