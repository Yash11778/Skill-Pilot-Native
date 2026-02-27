const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: [true, 'First name is required'], trim: true, maxlength: 50 },
    lastName: { type: String, required: [true, 'Last name is required'], trim: true, maxlength: 50 },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true },
    password: { type: String, required: [true, 'Password is required'], minlength: 6 },
    phone: { type: String, trim: true },
    age: { type: Number, min: 13, max: 100 },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer-not-to-say'], default: 'prefer-not-to-say' },
    location: { city: String, state: String, country: String },
    profilePicture: { type: String, default: '' },

    // Education
    education: [{
        level: { type: String, enum: ['high-school', 'diploma', 'bachelor', 'master', 'phd', 'other'], required: true },
        field: String, institution: String, year: Number, grade: String,
        isCompleted: { type: Boolean, default: false }
    }],

    // Skills & Interests
    skills: [{ name: { type: String, required: true }, level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'beginner' }, category: { type: String, default: 'other' }, verified: { type: Boolean, default: false } }],
    interests: [{ name: String, category: String, priority: { type: Number, min: 1, max: 10, default: 5 } }],

    // Career
    careerStage: { type: String, enum: ['student', 'fresh-graduate', 'entry-level', 'mid-level', 'senior-level', 'executive'], default: 'student' },
    currentRole: String,
    targetRoles: [String],
    experience: [{ title: String, company: String, duration: String, description: String, skills: [String] }],

    // Assessment Results
    assessments: [{ type: { type: String, enum: ['personality', 'skills', 'interests', 'aptitude'] }, name: String, result: mongoose.Schema.Types.Mixed, score: Number, completedAt: { type: Date, default: Date.now } }],

    // AI Recommendations
    careerRecommendations: [{ jobTitle: String, matchScore: Number, reasons: [String], skillGaps: [String], salaryRange: { min: Number, max: Number, currency: { type: String, default: 'USD' } }, growth: String, generatedAt: { type: Date, default: Date.now } }],
    courseRecommendations: [{ title: String, provider: String, url: String, difficulty: String, duration: String, rating: Number, price: Number, skills: [String], relevanceScore: Number, generatedAt: { type: Date, default: Date.now } }],

    // Progress
    completedCourses: [{ courseId: String, title: String, provider: String, completedAt: Date, certificate: String, skills: [String] }],
    savedJobs: [{ jobId: String, title: String, company: String, savedAt: { type: Date, default: Date.now } }],

    // Social
    mentors: [{ mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, status: { type: String, enum: ['pending', 'active', 'completed'], default: 'pending' }, connectedAt: Date }],
    mentees: [{ menteeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, status: { type: String, enum: ['pending', 'active', 'completed'], default: 'pending' }, connectedAt: Date }],

    // Account
    isVerified: { type: Boolean, default: false },
    isMentor: { type: Boolean, default: false },
    preferences: {
        notifications: { email: { type: Boolean, default: true }, push: { type: Boolean, default: true }, recommendations: { type: Boolean, default: true } },
        privacy: { profileVisibility: { type: String, enum: ['public', 'private', 'connections-only'], default: 'public' }, showEmail: { type: Boolean, default: false } }
    },

    // System
    lastActive: { type: Date, default: Date.now },
    onboardingCompleted: { type: Boolean, default: false },
    profileCompleteness: { type: Number, default: 0, min: 0, max: 100 }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

userSchema.virtual('fullName').get(function () { return `${this.firstName} ${this.lastName}`; });

// Hash password before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password
userSchema.methods.matchPassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate profile completeness
userSchema.methods.calculateProfileCompleteness = function () {
    let score = 20; // basic info always present
    if (this.age && this.phone && this.location?.city) score += 15;
    if (this.education && this.education.length > 0) score += 20;
    if (this.skills && this.skills.length >= 3) score += 20;
    if (this.interests && this.interests.length >= 3) score += 10;
    if (this.experience && this.experience.length > 0) score += 15;
    this.profileCompleteness = score;
    return score;
};

userSchema.index({ email: 1 });
userSchema.index({ 'skills.name': 1 });
userSchema.index({ careerStage: 1 });

module.exports = mongoose.model('User', userSchema);
