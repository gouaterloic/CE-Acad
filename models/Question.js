const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true
    },
    answers: {
        type: Array,
        required: true
    },
    correct: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    level: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        default: 1
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Question = mongoose.model('Question',QuestionSchema);

module.exports = Question;