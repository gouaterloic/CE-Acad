const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    revenue: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    },
    affiliate: {
        type: String,
        default: "admin@ce-acad.com"
    },
    role: {
        type: String,
        default: "member"
    },
    revenue_to_redistribute: {
        type: Number,
        default:0
    }
});

const User = mongoose.model('User',UserSchema);

module.exports = User;