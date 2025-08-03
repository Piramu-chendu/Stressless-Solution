const express = require('express');
const axios = require('axios');
const router = express.Router();
const JournalEntry = require('../models/JournalEntry');
const { predictMood } = require('../utils/predictMood');

// === Analyze journal entry without saving ===
router.post('/analyze', async (req, res) => {
    try {
        const entry = req.body.entry || req.body.content;

        if (!entry) return res.status(400).json({ message: 'Journal entry content is required.' });

        const mood = predictMood(entry);
        const flaskRes = await axios.post('http://localhost:5000/predict_journal', { content: entry });
        const { stress, anxiety, depression } = flaskRes.data;

        const stressSolution = stress === 'High' ? 'Take deep breaths and practice mindfulness' : 'Stay calm and relaxed!';
        const anxietySolution = anxiety === 'High' ? 'Talk to someone you trust' : 'Relax and enjoy your moment';
        const depressionSolution = depression === 'High' ? 'Engage in activities you enjoy' : 'Keep your spirits up!';

        return res.status(200).json({
            moodPrediction: mood,
            stressLevel: stress,
            anxietyLevel: anxiety,
            depressionLevel: depression,
            stressSolution,
            anxietySolution,
            depressionSolution
        });
    } catch (error) {
        console.error('Error analyzing journal entry:', error.message || error);
        res.status(500).json({ message: 'Server error during analysis' });
    }
});

// === Create a new journal entry ===
router.post('/entries', async (req, res) => {
    const { entry } = req.body;
    if (!entry) return res.status(400).json({ message: 'Journal content is required' });

    try {
        const moodPrediction = predictMood(entry);
        const flaskRes = await axios.post('http://localhost:5000/predict_journal', { content: entry });
        const { stress, anxiety, depression } = flaskRes.data;

        const newEntry = new JournalEntry({
            entry,
            moodPrediction,
            stressLevel: stress,
            anxietyLevel: anxiety,
            depressionLevel: depression,
            stressSolution: stress === 'High' ? 'Take deep breaths and practice mindfulness' : 'Stay calm and relaxed!',
            anxietySolution: anxiety === 'High' ? 'Talk to someone you trust' : 'Relax and enjoy your moment',
            depressionSolution: depression === 'High' ? 'Engage in activities you enjoy' : 'Keep your spirits up!',
            date: new Date()
        });

        const saved = await newEntry.save();
        res.status(200).json(saved);
    } catch (err) {
        console.error('Error saving journal entry:', err.message || err);
        res.status(500).json({ message: 'Internal server error while saving entry' });
    }
});

// === Get all journal entries ===
router.get('/entries', async (req, res) => {
    try {
        const entries = await JournalEntry.find().sort({ date: -1 });
        res.status(200).json(entries);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch journal entries' });
    }
});

// === Get a single journal entry by ID ===
router.get('/entries/:id', async (req, res) => {
    try {
        const entry = await JournalEntry.findById(req.params.id);
        if (!entry) return res.status(404).json({ message: 'Entry not found' });
        res.status(200).json(entry);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch journal entry' });
    }
});

// === Update a journal entry ===
router.put('/edit/:id', async (req, res) => {
    const { entry } = req.body;
    if (!entry) return res.status(400).json({ message: 'Updated content is required' });

    try {
        const moodPrediction = predictMood(entry);
        const flaskRes = await axios.post('http://localhost:5000/predict_journal', { content: entry });
        const { stress, anxiety, depression } = flaskRes.data;

        const updated = await JournalEntry.findByIdAndUpdate(
            req.params.id,
            {
                entry,
                moodPrediction,
                stressLevel: stress,
                anxietyLevel: anxiety,
                depressionLevel: depression,
                stressSolution: stress === 'High' ? 'Take deep breaths and practice mindfulness' : 'Stay calm and relaxed!',
                anxietySolution: anxiety === 'High' ? 'Talk to someone you trust' : 'Relax and enjoy your moment',
                depressionSolution: depression === 'High' ? 'Engage in activities you enjoy' : 'Keep your spirits up!',
            },
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: 'Entry not found' });

        res.status(200).json(updated);
    } catch (err) {
        console.error('Error updating journal entry:', err.message || err);
        res.status(500).json({ message: 'Failed to update journal entry' });
    }
});

// === Delete a journal entry ===
router.delete('/entries/:id', async (req, res) => {
    try {
        const deleted = await JournalEntry.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Entry not found' });

        res.status(200).json({ message: 'Entry deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete journal entry' });
    }
});

module.exports = router;
