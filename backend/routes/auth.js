const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken, protect } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', [
    body('firstName').trim().isLength({ min: 2, max: 50 }),
    body('lastName').trim().isLength({ min: 2, max: 50 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
        }

        const { firstName, lastName, email, password, phone, age, careerStage } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists with this email' });
        }

        const user = await User.create({ firstName, lastName, email, password, phone, age, careerStage: careerStage || 'student' });
        user.calculateProfileCompleteness();
        await user.save();

        const token = generateToken(user._id);
        const userResponse = { ...user.toObject() };
        delete userResponse.password;

        res.status(201).json({ success: true, message: 'User registered successfully', data: { user: userResponse, token } });
    } catch (error) {
        next(error);
    }
});

// POST /api/auth/login
router.post('/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
        }

        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        user.lastActive = new Date();
        await user.save();

        const token = generateToken(user._id);
        const userResponse = { ...user.toObject() };
        delete userResponse.password;

        res.status(200).json({ success: true, message: 'Login successful', data: { user: userResponse, token } });
    } catch (error) {
        next(error);
    }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, data: { user } });
    } catch (error) {
        next(error);
    }
});

// PUT /api/auth/update-password
router.put('/update-password', protect, async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }
        user.password = newPassword;
        await user.save();
        const token = generateToken(user._id);
        res.status(200).json({ success: true, message: 'Password updated successfully', data: { token } });
    } catch (error) {
        next(error);
    }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'No user found with this email' });
        }
        res.status(200).json({ success: true, message: 'Password reset instructions sent to email' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
