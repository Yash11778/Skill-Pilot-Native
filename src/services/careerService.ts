import api from './api';

const careerService = {
    // Get AI-powered career recommendations
    getRecommendations: async () => {
        const response = await api.get('/career/recommendations');
        return response.data;
    },

    // Get job listings with filters
    getJobs: async (filters: any = {}) => {
        const response = await api.get('/career/jobs', { params: filters });
        return response.data;
    },

    // Get career paths
    getCareerPaths: async (filters: any = {}) => {
        const response = await api.get('/career/paths', { params: filters });
        return response.data;
    },

    // Get personalized job matches
    getJobMatches: async () => {
        const response = await api.get('/career/matches');
        return response.data;
    },

    // Save/unsave a job
    toggleSaveJob: async (jobId: string) => {
        const response = await api.post(`/career/jobs/${jobId}/save`);
        return response.data;
    },

    // Get career simulation data
    getSimulation: async (jobTitle: string) => {
        const response = await api.get(`/career/simulate/${encodeURIComponent(jobTitle)}`);
        return response.data;
    },
};

export default careerService;
