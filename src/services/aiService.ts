import api from './api';

const aiService = {
    // Get AI career advice
    getCareerAdvice: async (question: string, context?: string) => {
        const response = await api.post('/ai/career-advice', { question, context });
        return response.data;
    },

    // Chat with AI career counselor
    chatWithAI: async (message: string, conversationHistory?: any[]) => {
        const response = await api.post('/ai/chat', { message, conversationHistory });
        return response.data;
    },

    // Get skill gap analysis for a job title
    getSkillGapAnalysis: async (jobTitle: string) => {
        const response = await api.get(`/ai/skill-gap/${encodeURIComponent(jobTitle)}`);
        return response.data;
    },

    // Get career roadmap for a career goal
    getCareerRoadmap: async (careerGoal: string) => {
        const response = await api.get(`/ai/roadmap/${encodeURIComponent(careerGoal)}`);
        return response.data;
    },

    // Get market insights
    getMarketInsights: async (params: any = {}) => {
        const response = await api.get('/ai/market-insights', { params });
        return response.data;
    },
};

export default aiService;
