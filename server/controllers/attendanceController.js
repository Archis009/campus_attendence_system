const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const jwt = require('jsonwebtoken');

// @desc    Mark attendance via QR Scan
// @route   POST /api/attendance/mark
// @access  Private (Student)
const markAttendance = async (req, res) => {
    const { token } = req.body;
    // token is the QR code content (JWT)

    if (!token) {
        return res.status(400).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { classId, generatedAt } = decoded;

        // Verify Class Exists
        const classObj = await Class.findById(classId);
        if (!classObj) {
            return res.status(404).json({ message: 'Class not found' });
        }

        // Verify Student Enrolled (optional, strictly speaking, but good practice)
        if (!classObj.students.includes(req.user._id)) {
             return res.status(403).json({ message: 'You are not enrolled in this class' });
        }

        // Verify Token Freshness (Validity period) - JWT 'exp' handles this mostly, but we can double check
        // The JWT verification above throws if expired.
        
        // Prevent Duplicate Attendance for TODAY
        const startOfDay = new Date();
        startOfDay.setHours(0,0,0,0);
        const endOfDay = new Date();
        endOfDay.setHours(23,59,59,999);

        const existingAttendance = await Attendance.findOne({
            classId,
            studentId: req.user._id,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (existingAttendance) {
            return res.status(400).json({ message: 'Attendance already marked for today' });
        }

        const attendance = await Attendance.create({
            classId,
            studentId: req.user._id,
            date: new Date(),
            status: 'present'
        });

        res.status(201).json({ message: 'Attendance marked successfully', attendance });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'QR Code expired' });
        }
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get attendance history for student
// @route   GET /api/attendance/history
// @access  Private (Student)
const getHistory = async (req, res) => {
    const history = await Attendance.find({ studentId: req.user._id })
        .populate('classId', 'className')
        .sort({ date: -1 });
    res.json(history);
};

// @desc    Get attendance for a specific class
// @route   GET /api/attendance/class/:classId
// @access  Private (Teacher)
const getClassAttendance = async (req, res) => {
    const { classId } = req.params;

    const classObj = await Class.findById(classId);
    if (!classObj) {
        return res.status(404).json({ message: 'Class not found' });
    }

    if (classObj.teacherId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    // Filter for last 7 days (7 * 24 * 60 * 60 * 1000 ms)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const records = await Attendance.find({ 
        classId,
        date: { $gte: sevenDaysAgo }
    })
        .populate('studentId', 'name email')
        .sort({ date: -1 });
    
    res.json(records);
};

// @desc    Export attendance as CSV
// @route   GET /api/attendance/export/:classId
// @access  Private (Teacher)
const exportAttendance = async (req, res) => {
    const { classId } = req.params;

    const classObj = await Class.findById(classId);
    if (!classObj) {
        return res.status(404).json({ message: 'Class not found' });
    }

    if (classObj.teacherId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    const records = await Attendance.find({ classId })
        .populate('studentId', 'name email')
        .sort({ date: -1 });

    let csv = 'Student Name,Student Email,Date,Status\n';
    
    records.forEach(record => {
        const studentName = record.studentId ? record.studentId.name : 'Unknown';
        const studentEmail = record.studentId ? record.studentId.email : 'Unknown';
        const date = new Date(record.date).toLocaleString();
        const status = record.status;
        csv += `"${studentName}","${studentEmail}","${date}","${status}"\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment(`attendance_${classObj.className}.csv`);
    res.send(csv);
};

module.exports = {
    markAttendance,
    getHistory,
    getClassAttendance,
    exportAttendance
};
