import api from './api';

const courseService = {
    // Get course recommendations
    getRecommendations: async () => {
        const response = await api.get('/course/recommendations');
        return response.data;
    },

    // Search courses with filters
    searchCourses: async (filters: any = {}) => {
        const response = await api.get('/course/search', { params: filters });
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
