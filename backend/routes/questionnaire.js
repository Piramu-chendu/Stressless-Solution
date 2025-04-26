const express = require('express');
const axios = require('axios');
const QuestionnaireResult = require('../models/QuestionnaireResult');

const router = express.Router();

// 🧠 Utility: Calculate scores like frontend
const calculateScores = (answers) => {
    const stress = getStressScore(answers);
    const anxiety = getAnxietyScore(answers);
    const depression = getDepressionScore(answers);

    return {
        stress: stress > 5 ? 'High' : stress > 2 ? 'Moderate' : 'Low',
        anxiety: anxiety > 5 ? 'High' : anxiety > 2 ? 'Moderate' : 'Low',
        depression: depression > 5 ? 'High' : depression > 2 ? 'Moderate' : 'Low',
    };
};

const getStressScore = (a) => {
    let score = 0;
    score += a.mood === 'Very Low' ? 3 : a.mood === 'Low' ? 2 : a.mood === 'Neutral' ? 1 : 0;
    score += a.sleep === 'Very Poor' ? 3 : a.sleep === 'Poor' ? 2 : a.sleep === 'Neutral' ? 1 : 0;
    return score;
};

const getAnxietyScore = (a) => {
    let score = 0;
    score += a.anxiousThoughts === 'Very Often' ? 3 : a.anxiousThoughts === 'Sometimes' ? 2 : a.anxiousThoughts === 'Rarely' ? 1 : 0;
    score += a.panicAttacks === 'Yes' ? 3 : 0;
    return score;
};

const getDepressionScore = (a) => {
    let score = 0;
    score += a.interest === 'Yes, Completely' ? 3 : a.interest === 'Somewhat' ? 2 : 0;
    score += a.feelingWorthy === 'Very Often' ? 3 : a.feelingWorthy === 'Sometimes' ? 2 : 0;
    return score;
};

// ✅ POST /questionnaire/submit - Save and predict
router.post("/questionnaire/submit", async (req, res) => {
    try {
        const answers = req.body;

        if (!answers) {
            return res.status(400).json({ message: "Missing answers" });
        }

        const scores = calculateScores(answers);

        // Save to MongoDB
        const newEntry = new QuestionnaireResult({
            result: {
                stressLevel: scores.stress,
                anxietyLevel: scores.anxiety,
                depressionLevel: scores.depression,
            }
        });

        await newEntry.save();

        // Send scores to Flask ML
        const flaskResponse = await axios.post("http://localhost:5001/predict", { scores });

        res.status(201).json({
            message: "Result saved and prediction received",
            prediction: flaskResponse.data.prediction
        });

    } catch (error) {
        console.error("Error submitting questionnaire:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
