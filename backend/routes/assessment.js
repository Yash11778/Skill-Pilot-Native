const express = require('express');
const { Assessment, AssessmentResult } = require('../models/Assessment');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/assessment — list all assessments
router.get('/', async (req, res, next) => {
    try {
        const { type, category, difficulty } = req.query;
        const filter = { isActive: true };
        if (type) filter.type = type;
        if (category) filter.category = category;
        if (difficulty) filter.difficulty = difficulty;

        const assessments = await Assessment.find(filter).select('-questions.weight');
        res.status(200).json({ success: true, data: { assessments, count: assessments.length } });
    } catch (error) { next(error); }
});

// GET /api/assessment/results — user's results
router.get('/results', async (req, res, next) => {
    try {
        const results = await AssessmentResult.find({ userId: req.user.id })
            .populate('assessmentId', 'title type category')
            .sort({ completedAt: -1 });
        res.status(200).json({ success: true, data: { results, count: results.length } });
    } catch (error) { next(error); }
});

// GET /api/assessment/results/:resultId
router.get('/results/:resultId', async (req, res, next) => {
    try {
        const result = await AssessmentResult.findOne({ _id: req.params.resultId, userId: req.user.id })
            .populate('assessmentId');
        if (!result) return res.status(404).json({ success: false, message: 'Result not found' });
        res.status(200).json({ success: true, data: { result } });
    } catch (error) { next(error); }
});

// GET /api/assessment/:assessmentId
router.get('/:assessmentId', async (req, res, next) => {
    try {
        const assessment = await Assessment.findById(req.params.assessmentId);
        if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });
        res.status(200).json({ success: true, data: { assessment } });
    } catch (error) { next(error); }
});

// POST /api/assessment/:assessmentId/submit
router.post('/:assessmentId/submit', async (req, res, next) => {
    try {
        const { responses, completionTime } = req.body;
        const assessment = await Assessment.findById(req.params.assessmentId);
        if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });

        // Calculate score
        let totalScore = 0;
        let maxScore = 0;
        const traits = [];

        responses.forEach(response => {
            const question = assessment.questions.find(q => q.id === response.questionId);
            if (question) {
                maxScore += question.weight;
                // Simple scoring: add weight for each answer
                totalScore += question.weight * (response.answer !== null ? 1 : 0);
            }
        });

        const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

        // Determine strengths and areas for improvement
        const strengths = [];
        const areasForImprovement = [];
        if (percentage >= 80) strengths.push('Strong analytical skills', 'Good problem-solving ability');
        else if (percentage >= 60) { strengths.push('Good foundational knowledge'); areasForImprovement.push('Practice more complex scenarios'); }
        else { areasForImprovement.push('Review fundamentals', 'Practice regularly'); }

        const result = await AssessmentResult.create({
            userId: req.user.id,
            assessmentId: assessment._id,
            responses,
            results: {
                score: totalScore,
                percentage,
                category: assessment.category,
                traits,
                strengths,
                areasForImprovement,
                recommendations: ['Continue practicing', 'Explore related topics']
            },
            interpretation: {
                summary: `You scored ${percentage}% on the ${assessment.title}.`,
                detailedAnalysis: `Your performance indicates a ${percentage >= 70 ? 'strong' : 'developing'} understanding of the subject matter.`,
                careerImplications: 'These results can help guide your career development path.',
                nextSteps: ['Review weak areas', 'Take advanced assessments', 'Connect with a mentor']
            },
            completionTime: completionTime || 0
        });

        // Update user assessments
        const user = await User.findById(req.user.id);
        user.assessments.push({
            type: assessment.type,
            name: assessment.title,
            result: { score: totalScore, percentage },
            score: percentage
        });
        await user.save();

        res.status(200).json({ success: true, message: 'Assessment submitted successfully', data: { result } });
    } catch (error) { next(error); }
});

module.exports = router;
