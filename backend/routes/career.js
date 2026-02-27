const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/career/recommendations
router.get('/recommendations', async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const skills = user.skills.map(s => s.name);

        // Generate recommendations based on user profile
        const recommendations = generateCareerRecommendations(skills, user.interests, user.careerStage);

        res.status(200).json({ success: true, data: { recommendations } });
    } catch (error) { next(error); }
});

// GET /api/career/jobs
router.get('/jobs', async (req, res, next) => {
    try {
        const { search, location, type } = req.query;
        const user = await User.findById(req.user.id);
        const skills = user.skills.map(s => s.name);

        const jobs = generateJobListings(skills, search, location, type);
        res.status(200).json({ success: true, data: { jobs, total: jobs.length } });
    } catch (error) { next(error); }
});

// GET /api/career/paths
router.get('/paths', async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const paths = generateCareerPaths(user.skills.map(s => s.name), user.interests, user.careerStage);
        res.status(200).json({ success: true, data: { paths } });
    } catch (error) { next(error); }
});

// GET /api/career/matches
router.get('/matches', async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const skills = user.skills.map(s => s.name);
        const matches = generateJobMatches(skills, user.experience);
        res.status(200).json({ success: true, data: { matches } });
    } catch (error) { next(error); }
});

// POST /api/career/simulate/:jobTitle
router.post('/simulate/:jobTitle', async (req, res, next) => {
    try {
        const { jobTitle } = req.params;
        const user = await User.findById(req.user.id);
        const simulation = {
            jobTitle: decodeURIComponent(jobTitle),
            currentSkills: user.skills.map(s => s.name),
            requiredSkills: getRequiredSkills(jobTitle),
            matchPercentage: Math.floor(Math.random() * 40) + 60,
            timeline: '6-12 months',
            steps: [
                { step: 1, action: 'Complete foundational courses', duration: '2-3 months' },
                { step: 2, action: 'Build portfolio projects', duration: '2-3 months' },
                { step: 3, action: 'Get certified', duration: '1-2 months' },
                { step: 4, action: 'Apply and interview', duration: '1-2 months' },
            ],
            salaryRange: { min: 50000, max: 120000, currency: 'INR' }
        };
        res.status(200).json({ success: true, data: { simulation } });
    } catch (error) { next(error); }
});

// POST /api/career/jobs/:jobId/save
router.post('/jobs/:jobId/save', async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const existing = user.savedJobs.find(j => j.jobId === req.params.jobId);
        if (existing) return res.status(400).json({ success: false, message: 'Job already saved' });

        user.savedJobs.push({ jobId: req.params.jobId, title: req.body.title || 'Saved Job', company: req.body.company || 'Unknown' });
        await user.save();
        res.status(200).json({ success: true, message: 'Job saved successfully', data: { savedJobs: user.savedJobs } });
    } catch (error) { next(error); }
});

// — Helper functions —

function generateCareerRecommendations(skills, interests, careerStage) {
    const interestNames = interests.map(i => typeof i === 'string' ? i : i.name);
    const allKeywords = [...skills, ...interestNames].map(s => (s || '').toLowerCase());

    const careers = [
        { jobTitle: 'Full Stack Developer', matchScore: 92, reasons: ['Strong JavaScript skills', 'Web development interest'], skillGaps: ['System Design', 'DevOps'], salaryRange: { min: 600000, max: 2500000, currency: 'INR' }, growth: '+13%' },
        { jobTitle: 'Data Scientist', matchScore: 85, reasons: ['Python proficiency', 'Analytical mindset'], skillGaps: ['Machine Learning', 'Statistics'], salaryRange: { min: 800000, max: 3000000, currency: 'INR' }, growth: '+31%' },
        { jobTitle: 'Mobile App Developer', matchScore: 88, reasons: ['React Native experience', 'Mobile development interest'], skillGaps: ['Native iOS/Android', 'App Store optimization'], salaryRange: { min: 500000, max: 2000000, currency: 'INR' }, growth: '+21%' },
        { jobTitle: 'Cloud Solutions Architect', matchScore: 78, reasons: ['Backend experience', 'Cloud computing interest'], skillGaps: ['AWS/Azure certification', 'Infrastructure design'], salaryRange: { min: 1200000, max: 4000000, currency: 'INR' }, growth: '+15%' },
        { jobTitle: 'AI/ML Engineer', matchScore: 82, reasons: ['Python skills', 'AI interest'], skillGaps: ['Deep Learning', 'MLOps'], salaryRange: { min: 1000000, max: 3500000, currency: 'INR' }, growth: '+35%' },
    ];

    // Sort by relevance to user's skills
    return careers.map(c => ({
        ...c,
        matchScore: Math.min(100, c.matchScore + (allKeywords.some(k => c.jobTitle.toLowerCase().includes(k)) ? 5 : 0))
    })).sort((a, b) => b.matchScore - a.matchScore);
}

function generateJobListings(skills, search, location, type) {
    const jobs = [
        { id: 'j1', title: 'Junior Full Stack Developer', company: 'TechStart India', location: 'Bangalore', type: 'Full-time', salary: '₹6-10 LPA', postedDate: '2 days ago', skills: ['JavaScript', 'React', 'Node.js'] },
        { id: 'j2', title: 'React Native Developer', company: 'AppWorks', location: 'Mumbai', type: 'Full-time', salary: '₹8-14 LPA', postedDate: '1 day ago', skills: ['React Native', 'TypeScript', 'Redux'] },
        { id: 'j3', title: 'Data Analyst Intern', company: 'DataVision', location: 'Remote', type: 'Internship', salary: '₹15-25K/month', postedDate: '3 days ago', skills: ['Python', 'SQL', 'Excel'] },
        { id: 'j4', title: 'Backend Engineer', company: 'CloudNine', location: 'Hyderabad', type: 'Full-time', salary: '₹10-18 LPA', postedDate: '1 week ago', skills: ['Node.js', 'MongoDB', 'AWS'] },
        { id: 'j5', title: 'ML Engineer', company: 'AI Solutions', location: 'Pune', type: 'Full-time', salary: '₹12-22 LPA', postedDate: '5 days ago', skills: ['Python', 'TensorFlow', 'Machine Learning'] },
        { id: 'j6', title: 'Frontend Developer', company: 'WebCraft', location: 'Delhi', type: 'Full-time', salary: '₹5-9 LPA', postedDate: '4 days ago', skills: ['HTML', 'CSS', 'JavaScript', 'React'] },
    ];

    let filtered = jobs;
    if (search) filtered = filtered.filter(j => j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase()));
    if (location) filtered = filtered.filter(j => j.location.toLowerCase().includes(location.toLowerCase()));
    if (type) filtered = filtered.filter(j => j.type.toLowerCase() === type.toLowerCase());

    return filtered;
}

function generateCareerPaths(skills, interests, careerStage) {
    return [
        { id: 'cp1', title: 'Software Engineering', description: 'Build software products and systems', stages: ['Junior Dev', 'Mid Dev', 'Senior Dev', 'Tech Lead', 'CTO'], estimatedTime: '5-10 years', growth: 'High' },
        { id: 'cp2', title: 'Data Science', description: 'Extract insights from data', stages: ['Data Analyst', 'Data Scientist', 'Senior DS', 'Lead DS', 'Chief Data Officer'], estimatedTime: '4-8 years', growth: 'Very High' },
        { id: 'cp3', title: 'Product Management', description: 'Drive product strategy and execution', stages: ['APM', 'PM', 'Senior PM', 'Director of Product', 'VP Product'], estimatedTime: '6-12 years', growth: 'High' },
    ];
}

function generateJobMatches(skills, experience) {
    const matchPercentage = (base) => Math.min(100, base + skills.length * 3 + experience.length * 5);
    return [
        { id: 'm1', title: 'Software Developer', company: 'TechCorp', matchPercentage: matchPercentage(70), matchedSkills: skills.slice(0, 3).map(s => s), missingSkills: ['System Design'], salary: '₹8-15 LPA' },
        { id: 'm2', title: 'React Developer', company: 'WebStudio', matchPercentage: matchPercentage(75), matchedSkills: skills.slice(0, 2).map(s => s), missingSkills: ['Testing', 'CI/CD'], salary: '₹7-12 LPA' },
        { id: 'm3', title: 'Backend Engineer', company: 'ServerPro', matchPercentage: matchPercentage(65), matchedSkills: skills.slice(0, 2).map(s => s), missingSkills: ['Kubernetes', 'Microservices'], salary: '₹10-18 LPA' },
    ];
}

function getRequiredSkills(jobTitle) {
    const skillMap = {
        'full stack developer': ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Git', 'REST APIs'],
        'data scientist': ['Python', 'Machine Learning', 'SQL', 'Statistics', 'TensorFlow'],
        'mobile developer': ['React Native', 'TypeScript', 'Redux', 'REST APIs', 'Git'],
        default: ['Problem Solving', 'Communication', 'Teamwork', 'Technical Skills']
    };
    const key = Object.keys(skillMap).find(k => decodeURIComponent(jobTitle).toLowerCase().includes(k));
    return skillMap[key] || skillMap.default;
}

module.exports = router;
