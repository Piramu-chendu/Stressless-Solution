// backend/routes/journal.js

const express = require('express');
const router = express.Router();
const JournalEntry = require('../models/JournalEntry'); // Import JournalEntry model

// POST route for adding a new journal entry
router.post('/', async (req, res) => {
    const { entry } = req.body; // Destructure entry from the request body

    try {
        // Validate that the entry is provided
        if (!entry) {
            return res.status(400).json({ message: 'Journal entry is required.' });
        }

        // Create and save a new journal entry
        const newEntry = new JournalEntry({ content: entry, date: new Date() });
        await newEntry.save();

        // Respond with the newly created entry
        res.status(201).json({ message: 'Journal entry saved successfully!', entry: newEntry });
    } catch (error) {
        console.error('Error saving journal entry:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET route for fetching all journal entries
router.get('/', async (req, res) => {
    try {
        const entries = await JournalEntry.find(); // Fetch all journal entries
        res.json(entries); // Send the entries as a response
    } catch (error) {
        console.error('Error fetching entries:', error);
        res.status(500).json({ message: 'Error fetching entries.' });
    }
});

module.exports = router; // Export the router for use in the application
