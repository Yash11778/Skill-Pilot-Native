import api from './api';
import cache from '../utils/cache';

const courseService = {
    // Get course recommendations (cached 10 min)
    getRecommendations: async () => {
        const cached = await cache.get('course:recommendations');
        if (cached) return cached;
        const response = await api.get('/course/recommendations');
        await cache.set('course:recommendations', response.data, 10 * 60 * 1000);
        return response.data;
    },

    // Search courses with filters (cached 5 min per filter combo)
    searchCourses: async (filters: any = {}) => {
        const key = `course:search:${JSON.stringify(filters)}`;
        const cached = await cache.get(key);
        if (cached) return cached;
        const response = await api.get('/course/search', { params: filters });
        await cache.set(key, response.data, 5 * 60 * 1000);
        return response.data;
    },

    // Get course details
    getCourseDetails: async (courseId: string) => {
        const response = await api.get(`/course/${courseId}`);
        return response.data;
    },

    // Mark course as completed
    markCourseCompleted: async (courseId: string, data: any) => {
        const response = await api.post(`/course/${courseId}/complete`, data);
        return response.data;
    },

    // Get learning path for a career goal
    getLearningPath: async (careerGoal: string) => {
        const response = await api.get(`/course/learning-path/${encodeURIComponent(careerGoal)}`);
        return response.data;
    },

    // Get learning progress
    getLearningProgress: async () => {
        const response = await api.get('/course/progress');
        return response.data;
    },
};

export default courseService;
