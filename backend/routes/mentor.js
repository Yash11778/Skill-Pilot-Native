const express = require('express');
const User = require('../models/User');
const { protect, isMentor } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/mentor — list available mentors
router.get('/', async (req, res, next) => {
    try {
        const { specialization, industry } = req.query;
        const filter = { isMentor: true, _id: { $ne: req.user.id } };
        const mentors = await User.find(filter).select('firstName lastName skills interests careerStage currentRole profilePicture');

        const enrichedMentors = mentors.map(m => ({
            _id: m._id,
            name: `${m.firstName} ${m.lastName}`,
            title: m.currentRole || 'Career Mentor',
            specializations: m.skills.slice(0, 3).map(s => s.name),
            rating: (Math.random() * 1 + 4).toFixed(1),
            sessions: Math.floor(Math.random() * 50) + 10,
            availability: 'Available',
            profilePicture: m.profilePicture
        }));

        // If no mentors in DB, return sample data
        const result = enrichedMentors.length > 0 ? enrichedMentors : getSampleMentors();
        res.status(200).json({ success: true, data: { mentors: result, total: result.length } });
    } catch (error) { next(error); }
});

// POST /api/mentor/:mentorId/connect — send connection request
router.post('/:mentorId/connect', async (req, res, next) => {
    try {
        const mentor = await User.findById(req.params.mentorId);
        if (!mentor) return res.status(404).json({ success: false, message: 'Mentor not found' });

        const user = await User.findById(req.user.id);
        const existing = user.mentors.find(m => m.mentorId?.toString() === req.params.mentorId);
        if (existing) return res.status(400).json({ success: false, message: 'Connection request already exists' });

        user.mentors.push({ mentorId: mentor._id, status: 'pending', connectedAt: new Date() });
        await user.save();

        mentor.mentees.push({ menteeId: user._id, status: 'pending', connectedAt: new Date() });
        await mentor.save();

        res.status(200).json({ success: true, message: 'Connection request sent', data: { status: 'pending' } });
    } catch (error) { next(error); }
});

// GET /api/mentor/requests — get pending requests
router.get('/requests', async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const pendingRequests = user.isMentor
            ? user.mentees.filter(m => m.status === 'pending')
            : user.mentors.filter(m => m.status === 'pending');
        res.status(200).json({ success: true, data: { requests: pendingRequests } });
    } catch (error) { next(error); }
});

// PUT /api/mentor/requests/:requestId — accept/reject request
router.put('/requests/:requestId', async (req, res, next) => {
    try {
        const { status } = req.body; // 'active' or 'completed' (reject)
        const user = await User.findById(req.user.id);

        const request = user.mentees.id(req.params.requestId) || user.mentors.id(req.params.requestId);
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

        request.status = status;
        await user.save();

        res.status(200).json({ success: true, message: `Request ${status}`, data: { request } });
    } catch (error) { next(error); }
});

// GET /api/mentor/connections — active connections
router.get('/connections', async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('mentors.mentorId', 'firstName lastName currentRole skills profilePicture')
            .populate('mentees.menteeId', 'firstName lastName currentRole skills profilePicture');

        const connections = [
            ...user.mentors.filter(m => m.status === 'active').map(m => ({
                _id: m._id,
                user: m.mentorId,
                role: 'mentor',
                connectedAt: m.connectedAt
            })),
            ...user.mentees.filter(m => m.status === 'active').map(m => ({
                _id: m._id,
                user: m.menteeId,
                role: 'mentee',
                connectedAt: m.connectedAt
            }))
        ];

        res.status(200).json({ success: true, data: { connections } });
    } catch (error) { next(error); }
});

// POST /api/mentor/register — register as mentor
router.post('/register', async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        user.isMentor = true;
        await user.save();
        res.status(200).json({ success: true, message: 'Registered as mentor successfully', data: { user } });
    } catch (error) { next(error); }
});

// GET /api/mentor/profile/:mentorId
router.get('/profile/:mentorId', async (req, res, next) => {
    try {
        const mentor = await User.findById(req.params.mentorId).select('-password');
        if (!mentor) return res.status(404).json({ success: false, message: 'Mentor not found' });
        res.status(200).json({ success: true, data: { mentor } });
    } catch (error) { next(error); }
});

// PUT /api/mentor/connections/:connectionId
router.put('/connections/:connectionId', async (req, res, next) => {
    try {
        const { status } = req.body;
        const user = await User.findById(req.user.id);
        const connection = user.mentors.id(req.params.connectionId) || user.mentees.id(req.params.connectionId);
        if (!connection) return res.status(404).json({ success: false, message: 'Connection not found' });
        connection.status = status;
        await user.save();
        res.status(200).json({ success: true, message: 'Connection updated', data: { connection } });
    } catch (error) { next(error); }
});

// — Sample mentors fallback —
function getSampleMentors() {
    return [
        { _id: 'sample1', name: 'Dr. Priya Sharma', title: 'Senior Data Scientist at Google', specializations: ['Machine Learning', 'Python', 'Data Analysis'], rating: '4.9', sessions: 45, availability: 'Available' },
        { _id: 'sample2', name: 'Rahul Verma', title: 'Full Stack Lead at Microsoft', specializations: ['React', 'Node.js', 'System Design'], rating: '4.8', sessions: 38, availability: 'Available' },
        { _id: 'sample3', name: 'Anita Desai', title: 'Product Manager at Amazon', specializations: ['Product Strategy', 'Agile', 'UX'], rating: '4.7', sessions: 52, availability: 'Limited' },
        { _id: 'sample4', name: 'Vikram Patel', title: 'Cloud Architect at AWS', specializations: ['AWS', 'DevOps', 'Kubernetes'], rating: '4.9', sessions: 31, availability: 'Available' },
    ];
}

module.exports = router;
