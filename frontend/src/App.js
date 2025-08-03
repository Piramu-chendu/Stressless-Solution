import React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Questionnaire from './components/Questionnaire';
import Results from './components/Results';
import Journal from './components/Journal';
import ToDoList from './components/ToDoList';
import './App.css';

function App() {
    const navigate = useNavigate();

    const handleQuestionnaireSubmit = (answers) => {
        const scores = calculateScores(answers);
        localStorage.setItem("results", JSON.stringify(scores)); // Store scores in localStorage

        // Navigate to results page
        navigate('/results');
    };

    const calculateScores = (answers) => {
        let stressScore = 0, depressionScore = 0, anxietyScore = 0;

        // Calculate stress score
        stressScore += (answers.mood === 'Very Low' ? 3 : answers.mood === 'Low' ? 2 : answers.mood === 'Neutral' ? 1 : 0);
        stressScore += (answers.sleep === 'Very Poor' ? 3 : answers.sleep === 'Poor' ? 2 : answers.sleep === 'Neutral' ? 1 : 0);
        stressScore += (answers.energy === 'Very Low' ? 3 : answers.energy === 'Low' ? 2 : answers.energy === 'Moderate' ? 1 : 0);

        // Calculate anxiety score
        anxietyScore += (answers.anxiousThoughts === 'Very Often' ? 3 : answers.anxiousThoughts === 'Sometimes' ? 2 : answers.anxiousThoughts === 'Rarely' ? 1 : 0);
        anxietyScore += (answers.panicAttacks === 'Yes' ? 3 : 0);

        // Calculate depression score
        depressionScore += (answers.interest === 'Yes, Completely' ? 3 : answers.interest === 'Somewhat' ? 2 : 0);
        depressionScore += (answers.feelingWorthy === 'Very Often' ? 3 : answers.feelingWorthy === 'Sometimes' ? 2 : 0);

        return { stressScore, depressionScore, anxietyScore };
    };

    return (
        <div className="app-container">
            <Header />
            <Routes>
                <Route path="/" element={<Questionnaire onSubmit={handleQuestionnaireSubmit} />} />
                <Route path="/results" element={<Results />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/todolist" element={<ToDoList />} />
            </Routes>
        </div>
    );
}

export default App;
