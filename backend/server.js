const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const assessmentRoutes = require('./routes/assessment');
const careerRoutes = require('./routes/career');
const courseRoutes = require('./routes/course');
const mentorRoutes = require('./routes/mentor');
const aiRoutes = require('./routes/ai');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// CORS — allow all origins for mobile
app.use(cors());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('dev'));

// Database connection with retry logic
const connectDB = async (retries = 5, delay = 5000) => {
    for (let i = 1; i <= retries; i++) {
        try {
            await mongoose.connect(process.env.MONGODB_URI, {
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
                maxPoolSize: 10,
            });
            console.log('✅ MongoDB connected successfully');
            return;
        } catch (err) {
            console.error(`❌ MongoDB connection attempt ${i}/${retries} failed:`, err.message);
            if (i < retries) {
                console.log(`⏳ Retrying in ${delay / 1000}s...`);
                await new Promise(res => setTimeout(res, delay));
            } else {
                console.error('🚫 All MongoDB connection attempts failed. Server running without DB.');
            }
        }
    }
};

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    connectDB(3, 3000);
});

connectDB();

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'SkillPilot Mobile Backend is running',
        timestamp: new Date().toISOString(),
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SkillPilot Mobile Backend running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
