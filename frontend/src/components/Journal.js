import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import './Journal.css';

Modal.setAppElement('#root');

const quotes = [
    "🌟 Every day may not be good, but there's something good in every day.",
    "🌱 Healing takes time, and that’s okay.",
    "💖 You are stronger than you think.",
    "☀️ Breathe. You’re doing your best, and that’s enough.",
    "🌈 Storms don't last forever."
];

const prompts = [
    "What made you smile today? 😊",
    "What is one thing you are grateful for today? 🙏",
    "Describe a challenge you faced recently and how you handled it.",
    "Write a letter to your future self. 💌",
    "Describe your safe space. 🏡"
];

const affirmations = [
    "✨ You are worthy of love and joy.",
    "🌸 Peace begins with a smile.",
    "💎 You are enough exactly as you are.",
    "🌼 Difficult roads lead to beautiful destinations.",
    "💖 Healing is not linear, and that's okay.",
    "🦋 Today is a new beginning. Embrace it."
];

const moodEmojis = {
    "Happy": "😊",
    "Sad": "😔",
    "Anxious": "😥",
    "Neutral": "😐"
};

const getMoodScore = (prediction) => {
    switch (prediction) {
        case "Happy": return 100;
        case "Anxious": return 60;
        case "Sad": return 20;
        case "Neutral": return 80;
        default: return 50;
    }
};

const Journal = () => {
    const [entries, setEntries] = useState([]);
    const [entry, setEntry] = useState('');
    const [message, setMessage] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingEntry, setEditingEntry] = useState('');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [currentSuggestion, setCurrentSuggestion] = useState('');
    const [quoteOfTheDay, setQuoteOfTheDay] = useState('');
    const [prompt, setPrompt] = useState('');
    const [dailyAffirmation, setDailyAffirmation] = useState('');

    useEffect(() => {
        fetchEntries();
        setQuoteOfTheDay(quotes[Math.floor(Math.random() * quotes.length)]);
        setPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
        setDailyAffirmation(affirmations[Math.floor(Math.random() * affirmations.length)]);
    }, []);

    const fetchEntries = async () => {
        try {
            const response = await axios.get('/api/journal');
            setEntries(response.data);
        } catch (error) {
            console.error('Error fetching entries:', error);
            setMessage('Failed to load journal entries.');
        }
    };

    const handleEntryChange = (e) => {
        setEntry(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
    };

    const handleAddEntry = async (e) => {
        e.preventDefault();
        if (entry) {
            try {
                const response = await axios.post('http://localhost:5000/api/journal/entries', { entry });

                if (response.status === 200) {
                    setEntries((prevEntries) => [response.data, ...prevEntries]);
                    setEntry('');
                    setMessage(`Entry added. Mood: ${response.data.moodPrediction}`);
                } else {
                    setMessage('Failed to add journal entry.');
                }
            } catch (error) {
                console.error('Error adding entry:', error);
                setMessage(error.response?.data?.message || 'Failed to add journal entry.');
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this entry?')) {
            try {
                await axios.delete(`/api/journal/delete/${id}`);
                setEntries((prevEntries) => prevEntries.filter((e) => e._id !== id));
            } catch (error) {
                console.error('Error deleting entry:', error);
                setMessage(error.response?.data?.message || 'Failed to delete journal entry.');
            }
        }
    };

    const startEditing = (id, text) => {
        setEditingId(id);
        setEditingEntry(text);
    };

    const handleUpdateEntry = async () => {
        try {
            const response = await axios.put(`/api/journal/edit/${editingId}`, { entry: editingEntry });
            setEntries(entries.map(e => e._id === editingId ? response.data : e));
            setEditingId(null);
            setEditingEntry('');
        } catch (error) {
            console.error('Error updating entry:', error);
        }
    };

    const openModalWithSuggestion = (mood, depressionLevel) => {
        const suggestions = {
            "Sad": "💬 Try gratitude journaling, slow walks in nature, or reaching out to a friend. You matter.",
            "Anxious": "💬 Pause. Breathe deeply. Try box breathing or a quick grounding exercise!",
            "Neutral": "💬 Try a mindful walk or write a list of things you enjoy.",
            "Happy": "💬 You are doing wonderful! Celebrate yourself today with something you love.",
            "High": "💬 Consider reaching out to someone and engaging in a joyful or creative activity.",
            "Low": "💬 Maintain your peace with something simple like music or a good book."
        };

        const suggestion = suggestions[mood] || suggestions[depressionLevel] || "💬 Take a moment for yourself today. You deserve it.";
        setCurrentSuggestion(suggestion);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const chartData = entries.slice().reverse().map((entry) => ({
        name: new Date(entry.date || entry.createdAt).toLocaleDateString(),
        mood: getMoodScore(entry.moodPrediction)
    }));

    return (
        <div className="journal-container fade-in">
            <center><h2>📝 Your Healing Journal</h2></center>

            <div className="quote-box fade-in-slow">
                <h3>✨ Quote of the Day ✨</h3>
                <p>{quoteOfTheDay}</p>
            </div>

            <div className="prompt-box fade-in">
                <h4>💡 Feeling stuck? Here's a prompt:</h4>
                <p>{prompt}</p>
            </div>

            <div className="affirmation-box fade-in">
                <h4>🌸 Your Daily Affirmation:</h4>
                <p>{dailyAffirmation}</p>
            </div>

            <form onSubmit={handleAddEntry} className="journal-form">
                <textarea
                    value={entry}
                    onChange={handleEntryChange}
                    placeholder="Write your thoughts, feelings or a story..."
                    rows="5"
                    required
                />
                <button type="submit" className="submit-button">Add Entry</button>
            </form>

            {message && <p className="message">{message}</p>}

            <div className="journal-entries fade-in-slow">
                <h3>📚 Your Past Entries:</h3>
                {entries.length === 0 ? (
                    <p>No entries yet.</p>
                ) : (
                    <ul>
                        {entries.map((e) => (
                            <li key={e._id} className="entry-item fade-in">
                                {editingId === e._id ? (
                                    <>
                                        <textarea
                                            value={editingEntry}
                                            onChange={(e) => setEditingEntry(e.target.value)}
                                            rows="4"
                                        />
                                        <button onClick={handleUpdateEntry}>Save</button>
                                        <button onClick={() => setEditingId(null)}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <p><strong>Mood:</strong> {e.moodPrediction || 'N/A'} {moodEmojis[e.moodPrediction]}</p>
                                        <p><strong>Stress:</strong> {e.stressLevel}</p>
                                        <p><strong>Anxiety:</strong> {e.anxietyLevel}</p>
                                        <p><strong>Depression:</strong> {e.depressionLevel}</p>
                                        <p>{e.entry}</p>
                                        <small>{new Date(e.date || e.createdAt).toLocaleString()}</small><br />
                                        <button onClick={() => startEditing(e._id, e.entry)}>Edit</button>
                                        <button onClick={() => handleDelete(e._id)}>Delete</button>
                                        <button onClick={() => openModalWithSuggestion(e.moodPrediction, e.depressionLevel)}>Click for Relief Tips 🌟</button>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="chart-container">
                <h3>📈 Mood Trend Over Time:</h3>
                {chartData.length > 0 && (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Line type="monotone" dataKey="mood" stroke="#82ca9d" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Self Care Tips"
                className="modal"
                overlayClassName="modal-overlay"
            >
                <h2>💖 Self-Care Suggestion</h2>
                <p>{currentSuggestion}</p>
                <button onClick={closeModal}>Close</button>
            </Modal>
        </div>
    );
};

export default Journal;
