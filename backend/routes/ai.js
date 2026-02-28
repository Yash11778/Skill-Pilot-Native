const express = require('express');
const axios = require('axios');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();
// NOTE: protect is applied per-route, not globally, so chat works even with expired tokens

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const AI_MODELS = ['google/gemini-2.0-flash-exp:free', 'meta-llama/llama-3.2-3b-instruct:free', 'openai/gpt-3.5-turbo'];

// Helper: call OpenRouter API
async function callAI(messages, maxTokens = 500) {
    for (const model of AI_MODELS) {
        try {
            const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
                model,
                messages,
                max_tokens: maxTokens,
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://skillpilot.app'
                },
                timeout: 30000
            });

            const content = response.data?.choices?.[0]?.message?.content;
            if (content) return content.trim();
        } catch (e) {
            console.log(`Model ${model} failed, trying next...`);
        }
    }
    return null;
}

// POST /api/ai/career-advice
router.post('/career-advice', protect, async (req, res, next) => {
    try {
        const { question, context } = req.body;
        if (!question) return res.status(400).json({ success: false, message: 'Question is required' });

        const user = await User.findById(req.user.id);
        const userContext = {
            careerStage: user.careerStage,
            skills: user.skills.map(s => s.name),
            interests: user.interests.map(i => typeof i === 'string' ? i : i.name),
            targetRoles: user.targetRoles,
            experience: user.experience.length
        };

        const systemPrompt = `You are an AI career counselor. User context: Career Stage: ${userContext.careerStage}, Skills: ${userContext.skills.join(', ')}, Interests: ${userContext.interests.join(', ')}, Target Roles: ${userContext.targetRoles?.join(', ') || 'Not specified'}, Experience: ${userContext.experience} roles. Additional context: ${context || 'None'}.`;

        const aiResponse = await callAI([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: question }
        ]);

        res.status(200).json({
            success: true,
            data: {
                response: aiResponse || 'I apologize, but I am unable to generate a response right now. Please try again later.',
                timestamp: new Date()
            }
        });
    } catch (error) { next(error); }
});

// POST /api/ai/chat  — works with or without auth token
router.post('/chat', async (req, res, next) => {
    try {
        const { message, conversationHistory } = req.body;
        if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

        // Try to get user context if token provided (optional)
        let systemPrompt = `You are SkillPilot AI, a friendly and knowledgeable career counselor. Help users with career guidance, skill development, course recommendations, and job search strategies. Be encouraging, practical, and specific in your advice. Keep responses concise and actionable.`;
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (token) {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const User = require('../models/User');
                const user = await User.findById(decoded.id);
                if (user) {
                    systemPrompt = `You are SkillPilot AI, a friendly and knowledgeable career counselor. The user is a ${user.careerStage || 'student'} with skills in ${user.skills.map(s => s.name).join(', ') || 'various areas'}. Help them with career guidance, skill development, course recommendations, and job search strategies. Be encouraging, practical, and specific in your advice. Keep responses concise and actionable.`;
                }
            }
        } catch (_) { /* use generic prompt if auth fails */ }

        const messages = [{ role: 'system', content: systemPrompt }];
        if (Array.isArray(conversationHistory)) {
            conversationHistory.slice(-10).forEach(msg => {
                messages.push({ role: msg.role || (msg.isUser ? 'user' : 'assistant'), content: msg.content || msg.text });
            });
        }
        messages.push({ role: 'user', content: message });

        const aiResponse = await callAI(messages, 500);

        res.status(200).json({
            success: true,
            data: {
                response: aiResponse || "I'm having trouble connecting right now. Please try again in a moment. In the meantime, feel free to explore our Assessments and Courses sections!",
                timestamp: new Date()
            }
        });
    } catch (error) { next(error); }
});

// GET /api/ai/skill-gap/:jobTitle
router.get('/skill-gap/:jobTitle', protect, async (req, res, next) => {
    try {
        const { jobTitle } = req.params;
        const user = await User.findById(req.user.id);
        const userSkills = user.skills.map(s => s.name);

        const prompt = `Analyze the skill gap for someone wanting to become a ${decodeURIComponent(jobTitle)}. Their current skills are: ${userSkills.join(', ') || 'None specified'}. Provide: 1) Required skills for the role 2) Skills they already have 3) Skills they need to learn 4) Recommended learning path. Format as a structured, practical response.`;

        const aiResponse = await callAI([
            { role: 'system', content: 'You are a career skills analyst. Provide practical, actionable skill gap analysis.' },
            { role: 'user', content: prompt }
        ], 800);

        res.status(200).json({
            success: true,
            data: {
                analysis: aiResponse || {
                    jobTitle: decodeURIComponent(jobTitle),
                    currentSkills: userSkills,
                    requiredSkills: ['Problem Solving', 'Communication', 'Technical Skills'],
                    skillGap: ['Advanced topics require further study'],
                    recommendations: ['Take online courses', 'Build projects', 'Get mentorship']
                }
            }
        });
    } catch (error) { next(error); }
});

// GET /api/ai/roadmap/:careerGoal
router.get('/roadmap/:careerGoal', protect, async (req, res, next) => {
    try {
        const { careerGoal } = req.params;
        const user = await User.findById(req.user.id);

        const prompt = `Create a career roadmap for someone who wants to become a ${decodeURIComponent(careerGoal)}. They are currently a ${user.careerStage} with skills in: ${user.skills.map(s => s.name).join(', ') || 'None specified'}. Provide: 1) Phase-by-phase plan with timelines 2) Key skills to acquire 3) Recommended resources 4) Milestones to track progress. Keep it actionable and realistic.`;

        const aiResponse = await callAI([
            { role: 'system', content: 'You are a career planning expert. Create detailed, actionable career roadmaps.' },
            { role: 'user', content: prompt }
        ], 1000);

        res.status(200).json({
            success: true,
            data: {
                roadmap: aiResponse || {
                    goal: decodeURIComponent(careerGoal),
                    timeline: '6-12 months',
                    phases: [
                        { phase: 'Foundation', duration: '3 months', focus: 'Core skills and fundamentals' },
                        { phase: 'Intermediate', duration: '3 months', focus: 'Hands-on projects and certifications' },
                        { phase: 'Advanced', duration: '3 months', focus: 'Specialization and job applications' }
                    ]
                }
            }
        });
    } catch (error) { next(error); }
});

// GET /api/ai/market-insights
router.get('/market-insights', protect, async (req, res, next) => {
    try {
        const { industry, location } = req.query;

        const prompt = `Provide current job market insights for the ${industry || 'technology'} industry${location ? ` in ${location}` : ''}. Include: 1) Top trending skills 2) Salary ranges 3) Job demand trends 4) Emerging roles. Keep it concise and data-driven.`;

        const aiResponse = await callAI([
            { role: 'system', content: 'You are a job market analyst. Provide concise, data-driven market insights.' },
            { role: 'user', content: prompt }
        ], 800);

        res.status(200).json({
            success: true,
            data: {
                insights: aiResponse || {
                    industry: industry || 'Technology',
                    trendingSkills: ['AI/ML', 'Cloud Computing', 'Full Stack Development', 'Data Science'],
                    demandLevel: 'High',
                    averageSalary: '₹8-25 LPA',
                    growthRate: '+15% YoY'
                }
            }
        });
    } catch (error) { next(error); }
});

module.exports = router;
