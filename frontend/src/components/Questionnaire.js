import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Questionnaire.css';

// Export getSolutions function outside the component to allow imports in other files
export const getSolutions = (stress, anxiety, depression) => {
    const solutions = {
        stress: {
            High: "Consider relaxation techniques, mindfulness exercises, and seeking professional help.",
            Moderate: "Try managing stress through exercise, proper sleep, and healthy lifestyle choices.",
            Low: "Maintain a balanced routine, continue self-care, and stay mindful."
        },
        anxiety: {
            High: "Consult a healthcare provider for anxiety management, including therapy and medication.",
            Moderate: "Practice relaxation methods like deep breathing or yoga.",
            Low: "Engage in positive activities that reduce stress and enhance well-being."
        },
        depression: {
            High: "Seek professional help, including therapy and possibly medication. Consider engaging in social activities.",
            Moderate: "Talk with a close friend, family member, or counselor. Consider engaging in light physical activities.",
            Low: "Continue with your regular activities, practice mindfulness, and focus on self-care."
        }
    };

    return {
        stressSolution: solutions.stress[stress],
        anxietySolution: solutions.anxiety[anxiety],
        depressionSolution: solutions.depression[depression]
    };
};

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
        panicAttacks: '',
        stress: '',
        anxiety: ''
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setAnswers({ ...answers, [e.target.name]: e.target.value });
    };

    const encodeScore = (score) => {
        switch (score) {
            case 'Low': return 1;
            case 'Moderate': return 2;
            case 'High': return 3;
            default: return 0;
        }
    };

    const calculateScores = (answers) => {
        let stressScore = 0;
        let anxietyScore = 0;
        let depressionScore = 0;

        if (answers.mood === 'Very Low' || answers.energy === 'Very Low' || answers.appetite === 'Very Low' || answers.interest === 'Very Low') {
            depressionScore = 3; // Severe depression
        } else if (answers.mood === 'Low' || answers.energy === 'Low' || answers.appetite === 'Low' || answers.interest === 'Low') {
            depressionScore = 2; // Moderate depression
        } else if(answers.mood === 'Neutral' || answers.energy === 'Neutral' || answers.appetite === 'Neutral' || answers.interest === 'Neutral') {
            depressionScore = 1; // Mild depression
        }

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
        

        const scoreMap = { 1: 'Low', 2: 'Moderate', 3: 'High' };

        return {
            stress: scoreMap[stressScore],
            anxiety: scoreMap[anxietyScore],
            depression: scoreMap[depressionScore]
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const scores = calculateScores(answers);
            const solutions = getSolutions(scores.stress, scores.anxiety,scores.depression);
    
            const payload = { 
                ...answers, 
                stress: encodeScore(scores.stress), 
                anxiety: encodeScore(scores.anxiety),
                depression: encodeScore(scores.depression)
            };
    
            const response = await axios.post('http://localhost:5001/submit', payload);
            console.log('✅ Prediction response:', response.data);
    
            // Storing the prediction result along with solutions in localStorage
            localStorage.setItem('prediction', JSON.stringify({
                prediction: response.data.prediction,
                stressLevel: scores.stress,
                anxietyLevel: scores.anxiety,
                depressionLevel: scores.depression,  // Assuming this is the depression level
                stressSolution: solutions.stressSolution,
                anxietySolution: solutions.anxietySolution,
                depressionSolution: solutions.depressionSolution // Storing the depression solution
            }));
    
            // ✅ Success popup
            window.alert('✅ Submitted Successfully! Redirecting to Results...');
    
            navigate('/results'); // Redirect to results page after submission
        } catch (error) {
            console.error('❌ Error submitting data:', error);
            alert('Error submitting data. Please try again.');
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
