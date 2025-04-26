import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Journal.css'; // Import the styling for the journal page

const Journal = () => {
    const [entries, setEntries] = useState([]); // State to hold journal entries
    const [entry, setEntry] = useState(''); // State for current entry input
    const [message, setMessage] = useState(''); // State for success/error messages

    // Fetch journal entries from the backend when the component mounts
    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const response = await axios.get('/api/journal');
                setEntries(response.data); // Assuming the response contains an array of journal entries
            } catch (error) {
                console.error('Error fetching entries:', error);
                setMessage('Failed to load journal entries.');
            }
        };

        fetchEntries();
    }, []);

    // Handle text area change and adjust its height dynamically
    const handleEntryChange = (e) => {
        setEntry(e.target.value);
        // Dynamically adjust the height of the textarea based on the content
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
    };

    // Handle form submission and add the new journal entry to the backend
    const handleAddEntry = async (e) => {
        e.preventDefault(); // Prevent form submission default behavior
        if (entry) {
            try {
                const response = await axios.post('/api/journal/add', { content: entry });

                if (response.status === 200) {
                    const newEntry = response.data; // Assuming the response contains the newly added entry
                    setEntries([...entries, newEntry]); // Update state with the new entry
                    setEntry(''); // Clear the input field
                    setMessage('Journal entry submitted successfully.');
                } else {
                    setMessage('Failed to add journal entry.');
                }
            } catch (error) {
                console.error('Error adding entry:', error);
                setMessage('Failed to add journal entry. Please try again.');
            }
        }
    };

    return (
        <div className="journal-container">
            <center><h2>Journal</h2></center>
            <form onSubmit={handleAddEntry} className="journal-form">
                <textarea
                    value={entry}
                    onChange={handleEntryChange}
                    placeholder="Write about your day or feelings..."
                    rows="10"
                    required
                ></textarea>
                <button type="submit" className="submit-button">Add Entry</button>
            </form>

            {/* Display success or error message */}
            {message && <p className="message">{message}</p>}

            <div className="journal-entries">
                <h3>Your Journal Entries:</h3>
                {entries.length === 0 ? (
                    <p>No entries yet.</p>
                ) : (
                    <ul>
                        {entries.map((entry, index) => (
                            <li key={index}>{entry.content}</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Journal;
