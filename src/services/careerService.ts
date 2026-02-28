import api from './api';
import cache from '../utils/cache';

const careerService = {
    // Get AI-powered career recommendations (cached 15 min)
    getRecommendations: async () => {
        const cached = await cache.get('career:recommendations');
        if (cached) return cached;
        const response = await api.get('/career/recommendations');
        await cache.set('career:recommendations', response.data, 15 * 60 * 1000);
        return response.data;
    },

    // Get job listings with filters (cached 10 min)
    getJobs: async (filters: any = {}) => {
        const key = `career:jobs:${JSON.stringify(filters)}`;
        const cached = await cache.get(key);
        if (cached) return cached;
        const response = await api.get('/career/jobs', { params: filters });
        await cache.set(key, response.data, 10 * 60 * 1000);
        return response.data;
    },

    // Get career paths (cached 30 min)
    getCareerPaths: async (filters: any = {}) => {
        const key = `career:paths:${JSON.stringify(filters)}`;
        const cached = await cache.get(key);
        if (cached) return cached;
        const response = await api.get('/career/paths', { params: filters });
        await cache.set(key, response.data, 30 * 60 * 1000);
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
