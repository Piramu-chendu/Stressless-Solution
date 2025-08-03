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

// Example: Calculate stress score
const getStressScore = (a) => {
    let score = 0;
    score += a.mood === 'Very Low' ? 3 : a.mood === 'Low' ? 2 : a.mood === 'Neutral' ? 1 : 0;
    score += a.sleep === 'Very Poor' ? 3 : a.sleep === 'Poor' ? 2 : a.sleep === 'Neutral' ? 1 : 0;
    return score;
};

// Example: Calculate anxiety score
const getAnxietyScore = (a) => {
    let score = 0;
    score += a.anxiousThoughts === 'Very Often' ? 3 : a.anxiousThoughts === 'Sometimes' ? 2 : a.anxiousThoughts === 'Rarely' ? 1 : 0;
    score += a.panicAttacks === 'Yes' ? 3 : 0;
    return score;
};

// Example: Calculate depression score
const getDepressionScore = (a) => {
    let score = 0;
    score += a.interest === 'Yes, Completely' ? 3 : a.interest === 'Somewhat' ? 2 : 0;
    score += a.feelingWorthy === 'Very Often' ? 3 : a.feelingWorthy === 'Sometimes' ? 2 : 0;
    return score;
};

// 🧠 Utility: Get solutions based on levels
const getSolutions = (level) => {
    const solutions = {
        Low: "You're doing well! Continue practicing self-care and managing your stress with positive activities.",
        Moderate: "You're managing okay, but consider introducing more relaxation techniques or talking to someone you trust.",
        High: "It's important to seek support. Consider professional help or talking to someone who can guide you through coping strategies."
    };
    return solutions[level] || "No solution available.";
};

// ✅ POST /questionnaire/submit - Save and predict
router.post("/questionnaire/submit", async (req, res) => {
    try {
        const answers = req.body;

        if (!answers) {
            return res.status(400).json({ message: "Missing answers" });
        }

        const scores = calculateScores(answers);

        // Get solutions based on the levels
        const solutions = {
            stressSolution: getSolutions(scores.stress),
            anxietySolution: getSolutions(scores.anxiety),
            depressionSolution: getSolutions(scores.depression)
        };

        // Save to MongoDB
        const newEntry = new QuestionnaireResult({
            answers: answers,
            scores: {
                stressScore: scores.stress,
                anxietyScore: scores.anxiety,
                depressionScore: scores.depression,
            },
            result: {
                stressLevel: scores.stress,
                anxietyLevel: scores.anxiety,
                depressionLevel: scores.depression,
            },
            solutions: solutions // Save the solutions to the database (optional)
        });

        await newEntry.save();

        // Send scores to Flask ML
        const flaskResponse = await axios.post("http://localhost:5001/predict", { scores });

        res.status(201).json({
            message: "Result saved and prediction received",
            prediction: flaskResponse.data.prediction,
            solutions: solutions // Send solutions along with the prediction
        });

    } catch (error) {
        console.error("Error submitting questionnaire:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
