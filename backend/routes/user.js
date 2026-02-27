const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/user/profile
router.get('/profile', async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, data: { user } });
    } catch (error) { next(error); }
});

// PUT /api/user/profile
router.put('/profile', async (req, res, next) => {
    try {
        const allowedFields = ['firstName', 'lastName', 'phone', 'age', 'gender', 'location', 'careerStage', 'currentRole', 'targetRoles', 'preferences'];
        const updateData = {};
        Object.keys(req.body).forEach(key => { if (allowedFields.includes(key)) updateData[key] = req.body[key]; });

        const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true, runValidators: true });
        user.calculateProfileCompleteness();
        await user.save();

        res.status(200).json({ success: true, message: 'Profile updated successfully', data: { user } });
    } catch (error) { next(error); }
});

// GET /api/user/dashboard
router.get('/dashboard', async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const dashboardData = {
            profileCompleteness: user.profileCompleteness,
            totalAssessments: user.assessments.length,
            careerRecommendations: user.careerRecommendations.slice(0, 5),
            courseRecommendations: user.courseRecommendations.slice(0, 5),
            recentActivity: { lastActive: user.lastActive, completedCourses: user.completedCourses.length, savedJobs: user.savedJobs.length },
            quickStats: { skillsCount: user.skills.length, interestsCount: user.interests.length, experienceCount: user.experience.length, mentorConnections: user.mentors.filter(m => m.status === 'active').length }
        };
        res.status(200).json({ success: true, data: dashboardData });
    } catch (error) { next(error); }
});

// POST /api/user/education
router.post('/education', async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        user.education.push(req.body);
        user.calculateProfileCompleteness();
        await user.save();
        res.status(200).json({ success: true, message: 'Education added successfully', data: { education: user.education } });
    } catch (error) { next(error); }
});

// PUT /api/user/education/:educationId
router.put('/education/:educationId', async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const education = user.education.id(req.params.educationId);
        if (!education) return res.status(404).json({ success: false, message: 'Education not found' });
        Object.keys(req.body).forEach(key => { education[key] = req.body[key]; });
        await user.save();
        res.status(200).json({ success: true, message: 'Education updated successfully', data: { education: user.education } });
    } catch (error) { next(error); }
});

// DELETE /api/user/education/:educationId
router.delete('/education/:educationId', async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        user.education.pull({ _id: req.params.educationId });
        user.calculateProfileCompleteness();
        await user.save();
        res.status(200).json({ success: true, message: 'Education deleted successfully', data: { education: user.education } });
    } catch (error) { next(error); }
});

// POST /api/user/skills
router.post('/skills', async (req, res, next) => {
    try {
        const { skills } = req.body;
        if (!Array.isArray(skills)) return res.status(400).json({ success: false, message: 'Skills must be an array' });
        const user = await User.findById(req.user.id);
        user.skills = skills;
        user.calculateProfileCompleteness();
        await user.save();
        res.status(200).json({ success: true, message: 'Skills updated successfully', data: { skills: user.skills } });
    } catch (error) { next(error); }
});

// POST /api/user/interests
router.post('/interests', async (req, res, next) => {
    try {
        const { interests } = req.body;
        if (!Array.isArray(interests)) return res.status(400).json({ success: false, message: 'Interests must be an array' });
        const user = await User.findById(req.user.id);
        user.interests = interests;
        user.calculateProfileCompleteness();
        await user.save();
        res.status(200).json({ success: true, message: 'Interests updated successfully', data: { interests: user.interests } });
    } catch (error) { next(error); }
});

// POST /api/user/experience
router.post('/experience', async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        user.experience.push(req.body);
        user.calculateProfileCompleteness();
        await user.save();
        res.status(200).json({ success: true, message: 'Experience added successfully', data: { experience: user.experience } });
    } catch (error) { next(error); }
});

// POST /api/user/complete-onboarding
router.post('/complete-onboarding', async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        user.onboardingCompleted = true;
        user.calculateProfileCompleteness();
        await user.save();
        res.status(200).json({ success: true, message: 'Onboarding completed successfully', data: { user } });
    } catch (error) { next(error); }
});

module.exports = router;
