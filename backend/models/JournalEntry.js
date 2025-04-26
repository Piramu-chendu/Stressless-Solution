// backend/models/JournalEntry.js

const mongoose = require('mongoose');

// Define the schema with both 'content' and 'text' fields and a default 'createdAt' date
const JournalEntrySchema = new mongoose.Schema({
    content: { 
        type: String, 
        required: true  // Content is required
    },
    text: { 
        type: String  // Optional field for 'text'
    },
    createdAt: { 
        type: Date, 
        default: Date.now  // Default value for date is the current date
    }
});

// Create the model using the schema
const JournalEntry = mongoose.model('JournalEntry', JournalEntrySchema);

// Export the model for use in other files
module.exports = JournalEntry;
