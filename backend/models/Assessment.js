const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: ['personality', 'skills', 'interests', 'aptitude', 'career-readiness'] },
    description: { type: String, required: true },
    category: { type: String, enum: ['mbti', 'big-five', 'holland-code', 'technical', 'soft-skills', 'cognitive'], required: true },
    questions: [{
        id: { type: Number, required: true },
        question: { type: String, required: true },
        type: { type: String, enum: ['multiple-choice', 'rating', 'boolean', 'text'], required: true },
        options: [String],
        required: { type: Boolean, default: true },
        weight: { type: Number, default: 1 }
    }],
    scoring: {
        type: { type: String, enum: ['weighted', 'categorical', 'percentage'], default: 'weighted' },
        maxScore: Number,
        categories: [String]
    },
    duration: { type: Number, default: 30 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    isActive: { type: Boolean, default: true },
    tags: [String],
    metadata: { version: { type: String, default: '1.0' }, author: String, source: String }
}, { timestamps: true });

const assessmentResultSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
    responses: [{ questionId: Number, answer: mongoose.Schema.Types.Mixed, timeSpent: Number }],
    results: {
        score: Number, percentage: Number, category: String,
        traits: [{ name: String, score: Number, description: String }],
        strengths: [String], areasForImprovement: [String], recommendations: [String]
    },
    interpretation: { summary: String, detailedAnalysis: String, careerImplications: String, nextSteps: [String] },
    completionTime: { type: Number, required: true },
    completedAt: { type: Date, default: Date.now },
    isValid: { type: Boolean, default: true }
}, { timestamps: true });

assessmentSchema.index({ type: 1, category: 1 });
assessmentResultSchema.index({ userId: 1, assessmentId: 1 });

const Assessment = mongoose.model('Assessment', assessmentSchema);
const AssessmentResult = mongoose.model('AssessmentResult', assessmentResultSchema);

module.exports = { Assessment, AssessmentResult };
