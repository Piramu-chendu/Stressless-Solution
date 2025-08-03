const mongoose = require('mongoose');

// Updated JournalEntry schema with consistent field naming and structured mental health fields
const JournalEntrySchema = new mongoose.Schema({
    entry: {
        type: String,
        required: true
    },
    moodPrediction: {
        type: String,
        enum: ['Happy', 'Sad', 'Anxious', 'Neutral'],
        default: 'Neutral'
    },
    stressLevel: {
        type: String,
        enum: ['High', 'Low'],
        default: 'Low'
    },
    anxietyLevel: {
        type: String,
        enum: ['High', 'Low'],
        default: 'Low'
    },
    depressionLevel: {
        type: String,
        enum: ['High', 'Low'],
        default: 'Low'
    },
    stressSolution: {
        type: String,
        default: 'Stay calm and relaxed!'
    },
    anxietySolution: {
        type: String,
        default: 'Relax and enjoy your moment'
    },
    depressionSolution: {
        type: String,
        default: 'Keep your spirits up!'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('JournalEntry', JournalEntrySchema);
