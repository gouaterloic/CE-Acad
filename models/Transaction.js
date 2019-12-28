const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    type: {//deposit,withdrawal,paid_for_quiz,prepare_quiz,won_quiz
        type: String,
        required: true
    },
    amount: {// Net amount after fee deduction
        type: Number,
        required: true
    },
    fee: {// Fee
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    provider: {
        type: String,
        required: true
    },
    momo_number: {
        type: String,
        default: "none"
    },
    old_revenue: {//Revenue before transaction
        type: Number,
        required: true
    },
    new_revenue: {//Revenue after transaction
        type: Number,
        required: true
    },
    id_user: {// ID of user concerned
        type: String,
        required: true
    }, 
    from_to: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    ref: {
        type: String,
        default: "none"
    },
    dusu_ref: {
        type: String,
        default: "none"
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Transaction = mongoose.model('Transaction',TransactionSchema);

module.exports = Transaction;