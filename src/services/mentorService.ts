import api from './api';
import cache from '../utils/cache';

const mentorService = {
    // Get available mentors (cached 10 min)
    getMentors: async (filters: any = {}) => {
        const key = `mentor:list:${JSON.stringify(filters)}`;
        const cached = await cache.get(key);
        if (cached) return cached;
        const response = await api.get('/mentor', { params: filters });
        await cache.set(key, response.data, 10 * 60 * 1000);
        return response.data;
    },

    // Send mentor connection request
    sendMentorRequest: async (mentorId: string, message?: string) => {
        const response = await api.post(`/mentor/${mentorId}/connect`, { message });
        return response.data;
    },

    // Respond to mentor request (accept/reject)
    respondToRequest: async (requestId: string, action: 'accept' | 'reject') => {
        const response = await api.put(`/mentor/requests/${requestId}`, { action });
        return response.data;
    },

    // Get pending mentor requests
    getMentorRequests: async () => {
        const response = await api.get('/mentor/requests');
        return response.data;
    },

    // Get active connections (mentors + mentees)
    getConnections: async () => {
        const response = await api.get('/mentor/connections');
        return response.data;
    },

    // Register as mentor
    becomeMentor: async (data: any) => {
        const response = await api.post('/mentor/register', data);
        return response.data;
    },

    // Get mentor profile
    getMentorProfile: async (mentorId: string) => {
        const response = await api.get(`/mentor/profile/${mentorId}`);
        return response.data;
    },

    // End mentorship connection
    endMentorship: async (connectionId: string) => {
        const response = await api.delete(`/mentor/connections/${connectionId}`);
        return response.data;
    },
};

export default mentorService;
