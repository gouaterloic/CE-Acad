const mongoose = require('mongoose');
require('dotenv').config

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    referrer_link: {
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
    revenue_to_redistribute: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    },
    affiliate: {
        type: String,
        default: process.env.ADMIN_ID
    },
    role: {
        type: String,
        default: "member"
    }
});

const User = mongoose.model('User',UserSchema);

module.exports = User;