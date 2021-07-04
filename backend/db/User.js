const mongoose  = require('mongoose');
const ROLE      = require('./enum_role');



const User = new mongoose.Schema({
    name: {
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
    role: {
        type: [String],
        enum: Object.values(ROLE),
        required: true
    },
    isAllowed : {
        type: String,
        enum: ["pending", "banned", "inactive", "active"],
        default: "pending"
    },
    date_created : {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('users', User);
