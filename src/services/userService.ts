import api from './api';

const userService = {
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  updateProfile: async (profileData: any) => {
    const response = await api.put('/user/profile', profileData);
    return response.data;
  },

  addEducation: async (educationData: any) => {
    const response = await api.post('/user/education', educationData);
    return response.data;
  },

  updateEducation: async (educationId: string, educationData: any) => {
    const response = await api.put(`/user/education/${educationId}`, educationData);
    return response.data;
  },

  deleteEducation: async (educationId: string) => {
    const response = await api.delete(`/user/education/${educationId}`);
    return response.data;
  },

  updateSkills: async (skills: string[]) => {
    const response = await api.put('/user/skills', { skills });
    return response.data;
  },

  updateInterests: async (interests: string[]) => {
    const response = await api.put('/user/interests', { interests });
    return response.data;
  },

  addExperience: async (experienceData: any) => {
    const response = await api.post('/user/experience', experienceData);
    return response.data;
  },

  getDashboard: async () => {
    const response = await api.get('/user/dashboard');
    return response.data;
  },

  completeOnboarding: async () => {
    const response = await api.post('/user/complete-onboarding');
    return response.data;
  },
};

export default userService;
