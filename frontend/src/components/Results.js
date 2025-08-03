import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSolutions } from './Questionnaire.js'; // Importing getSolutions function from Questionnaire
import './Results.css';

const Results = () => {
    const navigate = useNavigate();
    const [results, setResults] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState('');

    useEffect(() => {
        // Get the stored prediction from localStorage
        const storedResults = localStorage.getItem('prediction');
        if (storedResults) {
            setResults(JSON.parse(storedResults));
        } else {
            navigate('/');
        }
    }, [navigate]);

    // Open Modal with appropriate content
    const openModal = (type) => {
        let content = '';
        if (type === 'stress') {
            content = (
                <div>
                    <h2>Stress Relief Tips</h2>
                    <p><strong>1. Take a Break:</strong> Step away from the stressor for a few minutes. Take a short walk or change your environment to reset.</p>
                    <p><strong>2. Deep Breathing:</strong> Practice deep breathing exercises. Inhale for 4 seconds, hold for 4, and exhale for 4 seconds.</p>
                    <p><strong>3. Engage in a Hobby:</strong> Whether it’s drawing, cooking, or playing music, doing something you enjoy can reduce stress.</p>
                    <p><strong>4. Progressive Muscle Relaxation:</strong> Slowly tense and release each muscle group to release physical tension.</p>
                </div>
            );
        } else if (type === 'anxiety') {
            content = (
                <div>
                    <h2>Anxiety Relief Techniques</h2>
                    <p><strong>1. Grounding Exercises:</strong> Focus on your senses—name 5 things you can see, 4 you can touch, 3 you can hear, etc.</p>
                    <p><strong>2. Guided Meditation:</strong> Use a meditation app (like Calm or Headspace) to guide you through a calm breathing exercise.</p>
                    <p><strong>3. Physical Exercise:</strong> Even a short 10-minute walk can help lower anxiety by releasing endorphins.</p>
                    <p><strong>4. Journaling:</strong> Write down your thoughts. It can help organize and clarify anxious feelings.</p>
                </div>
            );
        } else if (type === 'depression') {
            content = (
                <div>
                    <h2>Depression Relief Strategies</h2>
                    <p><strong>1. Talk to Someone:</strong> Reach out to a friend, family member, or therapist to discuss your feelings. Talking helps!</p>
                    <p><strong>2. Practice Gratitude:</strong> Start or end your day by writing down 3 things you are grateful for. It shifts your mindset.</p>
                    <p><strong>3. Engage in Physical Activities:</strong> Exercise can boost your mood and energy levels. Even a short walk is beneficial.</p>
                    <p><strong>4. Practice Self-Compassion:</strong> Be kind to yourself. Remind yourself that it’s okay to not be okay sometimes.</p>
                </div>
            );
        }
        setModalContent(content);
        setShowModal(true);
    };

    // Close Modal
    const closeModal = () => {
        setShowModal(false);
        setModalContent('');
    };

    // If results are available, get the solutions based on the stress, anxiety, and depression levels
    const solutions = results ? getSolutions(results.stressLevel, results.anxietyLevel, results.depressionLevel) : {};

    return (
        <div className="results-container">
            <div className="results-card">
                <h2>Your Mental Health Results</h2>
                {results ? (
                    <div className="results-content">
                        <div className="result-item">
                            <span className="result-label">Stress Level:</span>
                            <span className="result-value">{results.stressLevel}</span>
                        </div>
                        <div className="result-item">
                            <span className="result-label">Anxiety Level:</span>
                            <span className="result-value">{results.anxietyLevel}</span>
                        </div>
                        <div className="result-item">
                            <span className="result-label">Depression Level:</span>
                            <span className="result-value">{results.depressionLevel}</span>
                        </div>
                        {/* Display solutions based on the levels */}
                        <div className="solutions">
                            <h3>Suggested Solutions:</h3>
                            <div className="solution-item">
                                <span className="solution-label">Stress Solution:</span>
                                <span 
                                    className="solution-text clickable" 
                                    onClick={() => openModal('stress')}>
                                    Click here to see the stress relief tips
                                </span>
                            </div>
                            <div className="solution-item">
                                <span className="solution-label">Anxiety Solution:</span>
                                <span 
                                    className="solution-text clickable" 
                                    onClick={() => openModal('anxiety')}>
                                    Click here to see the anxiety relief tips
                                </span>
                            </div>
                            <div className="solution-item">
                                <span className="solution-label">Depression Solution:</span>
                                <span 
                                    className="solution-text clickable" 
                                    onClick={() => openModal('depression')}>
                                    Click here to see the depression relief tips
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p>Loading results...</p>
                )}
            </div>

            {/* Modal for stress, anxiety, and depression */}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        {modalContent}
                        <button onClick={closeModal} className="close-button">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Results;
