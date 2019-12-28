const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
    quiz_id: {
        type: String,
        required: true
    },
    round: {
        type: Number,
        required: true
    },
    total_points: {
        type: Number,
        required: true
    },
    players_id: {
        type: Array,
        required: true
    },
    players_points: {
        type: Array,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Result = mongoose.model('Result',ResultSchema);

module.exports = Result;