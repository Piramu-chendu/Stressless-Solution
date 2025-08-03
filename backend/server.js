const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const { predictMood, getMentalState } = require('./utils/predictMood'); // ✅ Import keyword-based logic

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Routes
const journalRoutes = require('./routes/journal');
const questionnaireRoutes = require('./routes/questionnaire');

app.use('/api/journal', journalRoutes);
app.use('/api/questionnaire', questionnaireRoutes);

// ✅ Questionnaire submission route
app.post('/api/questionnaire/submit', async (req, res) => {
    try {
        const answers = req.body;
        console.log("Submitting answers:", answers);

        const flaskRes = await axios.post('http://127.0.0.1:5001/submit', answers);

        res.status(200).json({
            message: 'Responses submitted and prediction received',
            prediction: flaskRes.data.prediction,
            depressionSolution: flaskRes.data.depressionSolution
        });
    } catch (error) {
        console.error('Error submitting responses:', error.response?.data || error.message);
        res.status(500).json({ message: 'Failed to submit responses' });
    }
});

// ✅ Journal entry analysis using keyword-based logic
app.post('/api/journal/analyze', (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: 'Journal content is required.' });
        }

        const mood = predictMood(content);
        const mentalState = getMentalState(content);

        res.status(200).json({
            message: 'Journal analyzed successfully.',
            mood: mood,
            mentalState: mentalState
        });
    } catch (error) {
        console.error('Error analyzing journal entry:', error);
        res.status(500).json({ message: 'Failed to analyze journal entry' });
    }
});

// Route to call the Flask ML API for predictions (using all questionnaire inputs)
app.post('/predict-ml', async (req, res) => {
    try {
        const {
            mood, sleep, energy, appetite, interest,
            irritability, concentration, feelingWorthy,
            anxiousThoughts, panicAttacks, stress, anxiety
        } = req.body;

        const response = await axios.post('http://127.0.0.1:5001/predict', {
            mood,
            sleep,
            energy,
            appetite,
            interest,
            irritability,
            concentration,
            feelingWorthy,
            anxiousThoughts,
            panicAttacks,
            stress,
            anxiety
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error calling Flask API:', error);
        res.status(500).json({ error: 'Something went wrong while making the prediction.' });
    }
});

// Handle invalid routes
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
});

// Start the Node.js server
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
});
