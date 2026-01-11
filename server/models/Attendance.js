const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true,
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['present', 'absent'],
        default: 'present',
    },
    leaveTime: {
        type: Date,
    },
}, {
    timestamps: true,
});

// Prevent duplicate attendance for same class same day? 
// For this MVP, we might allow multiple scans or just check if one exists in the last X minutes.
// The requirement says "Prevent duplicate attendance". 
// A user shouldn't be able to scan twice for the same "session".
// We can use the formatted date (YYYY-MM-DD) + classId + studentId as a composite index or check logic.

attendanceSchema.index({ classId: 1, studentId: 1, date: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
