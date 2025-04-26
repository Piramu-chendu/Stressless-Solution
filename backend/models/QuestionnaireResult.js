const mongoose = require("mongoose");

const QuestionnaireResultSchema = new mongoose.Schema({
    answers: {
        mood: { type: String, enum: ['Good', 'Bad', 'Neutral'], required: true },
        sleep: { type: String, enum: ['Well', 'Poorly'], required: true },
        energy: { type: String, enum: ['High', 'Low', 'Normal'], required: true },
        appetite: { type: String, enum: ['Good', 'Poor', 'Normal'], required: true },
        interest: { type: String, enum: ['High', 'Low', 'Normal'], required: true },
        irritability: { type: String, enum: ['High', 'Low', 'Normal'], required: true },
        concentration: { type: String, enum: ['High', 'Low', 'Normal'], required: true },
        feelingWorthy: { type: String, enum: ['Yes', 'No', 'Uncertain'], required: true },
        anxiousThoughts: { type: String, enum: ['Yes', 'No'], required: true },
        panicAttacks: { type: String, enum: ['Yes', 'No'], required: true },
    },
    scores: {
        stress: { type: String, required: true, enum: ['Low', 'Medium', 'High'] },
        anxiety: { type: String, required: true, enum: ['Low', 'Medium', 'High'] },
        depression: { type: String, required: true, enum: ['Low', 'Medium', 'High'] },
    },
    result: {
        stressLevel: { type: String, required: true, default: 'Not assessed' },
        anxietyLevel: { type: String, required: true, default: 'Not assessed' },
        depressionLevel: { type: String, required: true, default: 'Not assessed' },
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false } // Optional reference to a User model
}, { timestamps: true });

module.exports = mongoose.model("QuestionnaireResult", QuestionnaireResultSchema);
