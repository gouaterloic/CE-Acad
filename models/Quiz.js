const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
    title: {//deposit,withdrawal,paid_for_quiz,prepare_quiz,won_quiz
        type: String,
        required: true
    },
    rules: {// Net amount after fee deduction
        type: String,
        required: true
    },
    subject: {// Fee
        type: String,
        required: true
    },
    topic: {
        type: String,
        default:"all"
    },
    level: {
        type: String,
        default:"all"
    },
    current_participants: {
        type: Number,
        default:0
    },
    registration_fee: {//Revenue before transaction
        type: Number,
        required: true
    },
    winning_price: {//Revenue after transaction
        type: Number,
        required: true
    },
    registered_users: {
        type:Array,
        default:[]
    },
    played_users: {
        type:Array,
        default:[]
    },
    round: {
        type: Number,
        default: 1
    },
    results: {
        type: Array,
        default: []
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Quiz = mongoose.model('Quiz',QuizSchema);

module.exports = Quiz;