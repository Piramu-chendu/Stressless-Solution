import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Results.css';

const Results = () => {
    const [result, setResult] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedResult = localStorage.getItem("result");
        if (storedResult) {
            setResult(JSON.parse(storedResult));
        } else {
            // If no result, redirect back to questionnaire
            navigate("/questionnaire");
        }
    }, [navigate]);

    if (!result) {
        return <p>Loading results...</p>;
    }

    const { prediction } = result;

    const getFinalSolution = () => {
        const [stress, anxiety, depression] = prediction;

        const countHigh = [stress, anxiety, depression].filter((level) => level === 'High').length;
        const countModerate = [stress, anxiety, depression].filter((level) => level === 'Moderate').length;

        if (countHigh >= 2) {
            return "⚠️ Your responses suggest you may be experiencing high levels of stress, anxiety, or depression. Please consider consulting a mental health professional.";
        } else if (countModerate >= 2) {
            return "🔔 You appear to have moderate mental health concerns. Engage in mindfulness, regular exercise, and self-care. Seek professional advice if needed.";
        } else {
            return "🌟 You seem to be doing well overall. Keep up your positive mental health habits!";
        }
    };

    return (
        <div className="results-container">
            <h2>Your Mental Health Results</h2>
            <p><strong>Stress Level:</strong> {prediction[0]}</p>
            <p><strong>Anxiety Level:</strong> {prediction[1]}</p>
            <p><strong>Depression Level:</strong> {prediction[2]}</p>

            <p><strong>Final Suggestion:</strong> {getFinalSolution()}</p>

            <p><strong>Note:</strong> If you feel overwhelmed, don't hesitate to contact a mental health professional.</p>

            <button onClick={() => navigate("/questionnaire")} className="retake-btn">
                Retake Questionnaire
            </button>
        </div>
    );
};

export default Results;
