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
    player1_id: {
        type: String,
        required: true
    },
    player1_points: {
        type: Number,
        required: true
    },
    player2_id: {
        type: String,
        required: true
    },
    player2_points: {
        type: Number,
        required: true
    },
    player3_id: {
        type: String,
        required: true
    },
    player3_points: {
        type: Number,
        required: true
    },
    player4_id: {
        type: String,
        required: true
    },
    player4_points: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Result = mongoose.model('Result',ResultSchema);

module.exports = Result;