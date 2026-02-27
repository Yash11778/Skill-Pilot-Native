const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/course/recommendations
router.get('/recommendations', async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const skills = user.skills.map(s => s.name);
        const interests = user.interests.map(i => typeof i === 'string' ? i : i.name);

        const recommendations = generateCourseRecommendations(skills, interests, user.careerStage);
        res.status(200).json({ success: true, data: { recommendations } });
    } catch (error) { next(error); }
});

// GET /api/course/search
router.get('/search', async (req, res, next) => {
    try {
        const { query, provider, difficulty, minRating } = req.query;
        let courses = getAllCourses();

        if (query) courses = courses.filter(c => c.title.toLowerCase().includes(query.toLowerCase()) || c.skills.some(s => s.toLowerCase().includes(query.toLowerCase())));
        if (provider) courses = courses.filter(c => c.provider.toLowerCase() === provider.toLowerCase());
        if (difficulty) courses = courses.filter(c => c.difficulty === difficulty);
        if (minRating) courses = courses.filter(c => c.rating >= parseFloat(minRating));

        res.status(200).json({ success: true, data: { courses, total: courses.length } });
    } catch (error) { next(error); }
});

// GET /api/course/progress
router.get('/progress', async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const progress = {
            completedCourses: user.completedCourses.length,
            totalSkillsLearned: user.completedCourses.reduce((acc, c) => acc + (c.skills?.length || 0), 0),
            recentCompletions: user.completedCourses.slice(-5),
            streak: Math.floor(Math.random() * 7) + 1,
        };
        res.status(200).json({ success: true, data: { progress } });
    } catch (error) { next(error); }
});

// GET /api/course/learning-path/:careerGoal
router.get('/learning-path/:careerGoal', async (req, res, next) => {
    try {
        const { careerGoal } = req.params;
        const user = await User.findById(req.user.id);
        const learningPath = generateLearningPath(decodeURIComponent(careerGoal), user.skills.map(s => s.name));
        res.status(200).json({ success: true, data: { learningPath } });
    } catch (error) { next(error); }
});

// GET /api/course/:courseId
router.get('/:courseId', async (req, res, next) => {
    try {
        const allCourses = getAllCourses();
        const course = allCourses.find(c => c.id === req.params.courseId);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
        res.status(200).json({ success: true, data: { course } });
    } catch (error) { next(error); }
});

// POST /api/course/:courseId/complete
router.post('/:courseId/complete', async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const existing = user.completedCourses.find(c => c.courseId === req.params.courseId);
        if (existing) return res.status(400).json({ success: false, message: 'Course already completed' });

        user.completedCourses.push({
            courseId: req.params.courseId,
            title: req.body.title || 'Completed Course',
            provider: req.body.provider || 'Unknown',
            completedAt: new Date(),
            skills: req.body.skills || []
        });
        await user.save();

        res.status(200).json({ success: true, message: 'Course marked as completed', data: { completedCourses: user.completedCourses } });
    } catch (error) { next(error); }
});

// — Helper functions —

function getAllCourses() {
    return [
        { id: 'c1', title: 'Complete Web Development Bootcamp', provider: 'Udemy', difficulty: 'Beginner', duration: '63 hours', rating: 4.7, price: 499, skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'], url: '#', category: 'Web Development' },
        { id: 'c2', title: 'Machine Learning A-Z', provider: 'Coursera', difficulty: 'Intermediate', duration: '44 hours', rating: 4.8, price: 0, skills: ['Python', 'Machine Learning', 'Data Science'], url: '#', category: 'Data Science' },
        { id: 'c3', title: 'React Native - The Practical Guide', provider: 'Udemy', difficulty: 'Intermediate', duration: '28 hours', rating: 4.6, price: 399, skills: ['React Native', 'JavaScript', 'Mobile Development'], url: '#', category: 'Mobile Development' },
        { id: 'c4', title: 'Python for Data Science and AI', provider: 'Coursera', difficulty: 'Beginner', duration: '25 hours', rating: 4.5, price: 0, skills: ['Python', 'Data Analysis', 'AI'], url: '#', category: 'Data Science' },
        { id: 'c5', title: 'AWS Certified Solutions Architect', provider: 'AWS', difficulty: 'Advanced', duration: '40 hours', rating: 4.9, price: 0, skills: ['AWS', 'Cloud Architecture', 'DevOps'], url: '#', category: 'Cloud Computing' },
        { id: 'c6', title: 'Data Structures and Algorithms', provider: 'NPTEL', difficulty: 'Intermediate', duration: '12 weeks', rating: 4.7, price: 0, skills: ['DSA', 'Problem Solving', 'Java'], url: '#', category: 'Computer Science' },
        { id: 'c7', title: 'Full Stack Open', provider: 'University of Helsinki', difficulty: 'Intermediate', duration: '8 weeks', rating: 4.8, price: 0, skills: ['React', 'Node.js', 'MongoDB', 'GraphQL'], url: '#', category: 'Web Development' },
        { id: 'c8', title: 'Deep Learning Specialization', provider: 'Coursera', difficulty: 'Advanced', duration: '4 months', rating: 4.9, price: 0, skills: ['Deep Learning', 'TensorFlow', 'Neural Networks'], url: '#', category: 'AI/ML' },
    ];
}

function generateCourseRecommendations(skills, interests, careerStage) {
    const allCourses = getAllCourses();
    const keywords = [...skills, ...interests].map(s => (s || '').toLowerCase());

    return allCourses.map(course => {
        let relevance = 0;
        course.skills.forEach(s => { if (keywords.some(k => s.toLowerCase().includes(k) || k.includes(s.toLowerCase()))) relevance += 20; });
        if (careerStage === 'student' && course.difficulty === 'Beginner') relevance += 10;
        return { ...course, relevanceScore: Math.min(100, relevance + 30) };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 6);
}

function generateLearningPath(careerGoal, currentSkills) {
    const paths = {
        'full stack developer': {
            goal: 'Full Stack Developer',
            totalDuration: '6-10 months',
            phases: [
                { phase: 'Frontend Foundations', duration: '2 months', courses: ['HTML/CSS', 'JavaScript Essentials', 'React.js'] },
                { phase: 'Backend Development', duration: '2 months', courses: ['Node.js', 'Express.js', 'Database Design'] },
                { phase: 'Full Stack Integration', duration: '2 months', courses: ['REST APIs', 'Authentication', 'Deployment'] },
            ]
        },
        'data scientist': {
            goal: 'Data Scientist',
            totalDuration: '8-12 months',
            phases: [
                { phase: 'Foundations', duration: '3 months', courses: ['Python', 'Statistics', 'SQL'] },
                { phase: 'Core Data Science', duration: '3 months', courses: ['Pandas/NumPy', 'Machine Learning', 'Data Visualization'] },
                { phase: 'Advanced Topics', duration: '3 months', courses: ['Deep Learning', 'NLP', 'MLOps'] },
            ]
        },
        default: {
            goal: careerGoal,
            totalDuration: '6-12 months',
            phases: [
                { phase: 'Foundation', duration: '3 months', courses: ['Core Skills', 'Industry Basics'] },
                { phase: 'Specialization', duration: '3 months', courses: ['Advanced Topics', 'Projects'] },
                { phase: 'Career Prep', duration: '2 months', courses: ['Portfolio', 'Interview Prep'] },
            ]
        }
    };

    const key = Object.keys(paths).find(k => careerGoal.toLowerCase().includes(k));
    return paths[key] || paths.default;
}

module.exports = router;
