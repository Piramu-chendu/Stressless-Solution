const predictMood = (text) => {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('happy') || lowerText.includes('joy') || lowerText.includes('excited')) {
        return 'Happy';
    } else if (lowerText.includes('sad') || lowerText.includes('depressed') || lowerText.includes('down')) {
        return 'Sad';
    } else if (lowerText.includes('anxious') || lowerText.includes('worried') || lowerText.includes('stressed')) {
        return 'Anxious';
    } else {
        return 'Neutral';
    }
};

module.exports = { predictMood };
