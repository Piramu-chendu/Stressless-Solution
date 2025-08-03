const mongoose = require('mongoose'); // ✅ IMPORT mongoose first

const QuestionnaireResultSchema = new mongoose.Schema({
    answers: {
        mood: { type: String, enum: ['Very Low', 'Low', 'Neutral', 'High', 'Very High'], required: true },
        sleep: { type: String, enum: ['Very Poor', 'Poor', 'Neutral', 'Good', 'Very Good'], required: true },
        energy: { type: String, enum: ['Low', 'Normal', 'High'], required: true },
        appetite: { type: String, enum: ['Poor', 'Normal', 'Good'], required: true },
        interest: { type: String, enum: ['Yes, Completely', 'Somewhat', 'No'], required: true },
        irritability: { type: String, enum: ['High', 'Moderate', 'Low'], required: true },
        concentration: { type: String, enum: ['High', 'Moderate', 'Low'], required: true },
        feelingWorthy: { type: String, enum: ['Yes', 'No', 'Uncertain'], required: true },
        anxiousThoughts: { type: String, enum: ['Very Often', 'Sometimes', 'Rarely'], required: true },
        panicAttacks: { type: String, enum: ['Yes', 'No'], required: true },
        stress: { type: String, enum: ['Low', 'Moderate', 'High'], required: true },
        anxiety: { type: String, enum: ['Low', 'Moderate', 'High'], required: true },
    },
    scores: {
        stressScore: { type: String, enum: ['Low', 'Moderate', 'High'], required: true },
        anxietyScore: { type: String, enum: ['Low', 'Moderate', 'High'], required: true },
        depressionScore: { type: String, enum: ['Low', 'Moderate', 'High'], required: true },
    },
    result: {
        stressLevel: { type: String, required: true, default: 'Not assessed' },
        anxietyLevel: { type: String, required: true, default: 'Not assessed' },
        depressionLevel: { type: String, required: true, default: 'Not assessed' },
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }
}, { timestamps: true });

module.exports = mongoose.model("QuestionnaireResult", QuestionnaireResultSchema);
