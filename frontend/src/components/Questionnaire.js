import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Questionnaire.css';

const Questionnaire = () => {
    const [answers, setAnswers] = useState({
        mood: '',
        sleep: '',
        energy: '',
        appetite: '',
        interest: '',
        irritability: '',
        concentration: '',
        feelingWorthy: '',
        anxiousThoughts: '',
        panicAttacks: ''
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setAnswers({ ...answers, [e.target.name]: e.target.value });
    };

    // ✅ Function to calculate stress and anxiety
    const calculateScores = (answers) => {
        // Simplified example: you can adjust the logic based on your real app
        let stressScore = 0;
        let anxietyScore = 0;

        if (answers.anxiousThoughts === 'Very Often' || answers.panicAttacks === 'Very Often') {
            anxietyScore = 3;
        } else if (answers.anxiousThoughts === 'Sometimes' || answers.panicAttacks === 'Sometimes') {
            anxietyScore = 2;
        } else {
            anxietyScore = 1;
        }

        if (answers.mood === 'Very Low' || answers.sleep === 'Very Poor') {
            stressScore = 3;
        } else if (answers.mood === 'Low' || answers.sleep === 'Poor') {
            stressScore = 2;
        } else {
            stressScore = 1;
        }

        // Map numeric score to labels
        const scoreMap = { 1: 'Low', 2: 'Moderate', 3: 'High' };

        return {
            stress: scoreMap[stressScore],
            anxiety: scoreMap[anxietyScore]
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // First, calculate stress and anxiety
            const scores = calculateScores(answers);

            // Merge answers + scores
            const payload = { ...answers, ...scores };

            const response = await axios.post("http://localhost:5001/submit", payload);
            localStorage.setItem("result", JSON.stringify(response.data));
            navigate("/results");
        } catch (error) {
            console.error("Submission failed:", error);
            alert("Error submitting data");
        }
    };

    return (
        <div className="questionnaire-container">
            <center><h2>Mental Health Questionnaire</h2></center>
            <form onSubmit={handleSubmit}>
                {Object.keys(answers).map((key, index) => (
                    <div key={index} className="input-field">
                        <label>{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                        <select name={key} value={answers[key]} onChange={handleChange} required>
                            <option value="">Select</option>
                            <option value="Very Low">Very Low</option>
                            <option value="Low">Low</option>
                            <option value="Neutral">Neutral</option>
                            <option value="High">High</option>
                            <option value="Very High">Very High</option>
                            <option value="Very Poor">Very Poor</option>
                            <option value="Poor">Poor</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                            <option value="Very Often">Very Often</option>
                            <option value="Sometimes">Sometimes</option>
                            <option value="Rarely">Rarely</option>
                            <option value="Yes, Completely">Yes, Completely</option>
                            <option value="Somewhat">Somewhat</option>
                        </select>
                    </div>
                ))}
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default Questionnaire;
