import api from './api';

const authService = {
  // Register user
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update password
  updatePassword: async (passwordData: any) => {
    const response = await api.put('/auth/update-password', passwordData);
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
};

export default authService;
