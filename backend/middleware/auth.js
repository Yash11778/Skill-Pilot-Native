const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

// Protect middleware
const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                return res.status(401).json({ success: false, message: 'No user found with this token' });
            }
            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
        }
    } catch (error) {
        next(error);
    }
};

// Check if user is mentor
const isMentor = (req, res, next) => {
    if (!req.user || !req.user.isMentor) {
        return res.status(403).json({ success: false, message: 'Mentor privileges required' });
    }
    next();
};

module.exports = { generateToken, protect, isMentor };
