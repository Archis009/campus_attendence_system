const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    className: {
        type: String,
        required: true,
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    code: {
        type: String,
        unique: true,
    },
    days: {
        type: [String], // ["Monday", "Wednesday"]
        default: []
    },
    startTime: {
        type: String, // "09:00"
    },
    endTime: {
        type: String, // "10:30"
    }
}, {
    timestamps: true,
});



const Class = mongoose.model('Class', classSchema);

module.exports = Class;
