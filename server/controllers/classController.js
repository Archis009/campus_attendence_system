const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const jwt = require('jsonwebtoken');

// @desc    Create a class
// @route   POST /api/classes
// @access  Private (Teacher)
const createClass = async (req, res) => {
    const { className, days, startTime, endTime } = req.body;

    if (!className || !days || days.length === 0 || !startTime || !endTime) {
        return res.status(400).json({ message: 'Please provide all fields: Class Name, Days, Start Time, and End Time.' });
    }

    // Generate random 6 character alphanumeric code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const newClass = await Class.create({
        className,
        teacherId: req.user._id,
        code,
        days,
        startTime,
        endTime
    });

    res.status(201).json(newClass);
};

// @desc    Get all classes for logged in user
// @route   GET /api/classes
// @access  Private
const getClasses = async (req, res) => {
    let classes;
    if (req.user.role === 'teacher') {
        classes = await Class.find({ teacherId: req.user._id });
    } else {
        // Find classes where student is enrolled
        classes = await Class.find({ students: req.user._id });
    }

    // Filter out classes that are not currently active based on schedule
    const now = new Date();
    const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = daysMap[now.getDay()];
    const currentTime = now.getHours() * 60 + now.getMinutes();

    classes = classes.filter(cls => {
        // If no schedule is set, hide it (invalid/old class)
        if (!cls.days || cls.days.length === 0 || !cls.startTime || !cls.endTime) {
            return false;
        }

        // Check Day
        if (!cls.days.includes(currentDay)) {
            return false;
        }

        // Check Time
        const [startHour, startMinute] = cls.startTime.split(':').map(Number);
        const startTime = startHour * 60 + startMinute;

        const [endHour, endMinute] = cls.endTime.split(':').map(Number);
        const endTime = endHour * 60 + endMinute;

        // Show class if it hasn't ended yet (Current time <= End Time)
        // This includes currently running AND upcoming classes for the day.
        return currentTime <= endTime;
    });

    res.json(classes);
};

// @desc    Get all available classes for student (excluding enrolled)
// @route   GET /api/classes/available
// @access  Private (Student)
const getAllAvailableClasses = async (req, res) => {
    let classes = await Class.find({ 
        students: { $ne: req.user._id } 
    }).select('className code teacherId days startTime endTime').populate('teacherId', 'name');

    // Filter out classes that are not currently active based on schedule
    const now = new Date();
    const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = daysMap[now.getDay()];
    const currentTime = now.getHours() * 60 + now.getMinutes();

    classes = classes.filter(cls => {
        // If no schedule is set, hide it (invalid/old class)
        if (!cls.days || cls.days.length === 0 || !cls.startTime || !cls.endTime) {
            return false;
        }

        // Check Day
        if (!cls.days.includes(currentDay)) {
            return false;
        }

        // Check Time
        const [startHour, startMinute] = cls.startTime.split(':').map(Number);
        const startTime = startHour * 60 + startMinute;

        const [endHour, endMinute] = cls.endTime.split(':').map(Number);
        const endTime = endHour * 60 + endMinute;

        return currentTime <= endTime;
    });

    res.json(classes);
};

// @desc    Get single class by ID
// @route   GET /api/classes/:id
// @access  Private
const getClassById = async (req, res) => {
    const classObj = await Class.findById(req.params.id).populate('students', 'name email');
    if (classObj) {
        res.json(classObj);
    } else {
        res.status(404).json({ message: 'Class not found' });
    }
};

// @desc    Enroll in a class
// @route   POST /api/classes/:id/enroll
// @access  Private (Student)
const enrollClass = async (req, res) => {
    const classObj = await Class.findById(req.params.id);

    if (!classObj) {
        return res.status(404).json({ message: 'Class not found' });
    }

    if (classObj.students.includes(req.user._id)) {
        return res.status(400).json({ message: 'Already enrolled' });
    }

    classObj.students.push(req.user._id);
    await classObj.save();

    res.json({ message: 'Enrolled successfully' });
};

// @desc    Enroll in class by Code
// @route   POST /api/classes/enroll
// @access  Private (Student)
const enrollByCode = async (req, res) => {
    const { code } = req.body;

    if (!code) {
         return res.status(400).json({ message: 'Class code is required' });
    }

    const classObj = await Class.findOne({ code: code.toUpperCase() });

    if (!classObj) {
        return res.status(404).json({ message: 'Invalid class code' });
    }

    if (classObj.students.includes(req.user._id)) {
        return res.status(400).json({ message: 'Already enrolled' });
    }

    // Schedule Validation
    if (classObj.days && classObj.days.length > 0 && classObj.startTime && classObj.endTime) {
        const now = new Date();
        const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = daysMap[now.getDay()];

        if (!classObj.days.includes(currentDay)) {
             return res.status(400).json({ message: `Class is not scheduled for today (${currentDay})` });
        }

        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const [startHour, startMinute] = classObj.startTime.split(':').map(Number);
        const startTime = startHour * 60 + startMinute;

        const [endHour, endMinute] = classObj.endTime.split(':').map(Number);
        const endTime = endHour * 60 + endMinute;

        if (currentTime < startTime || currentTime > endTime) {
            return res.status(400).json({ message: `Class has ended or not started yet. (Time: ${classObj.startTime} - ${classObj.endTime})` });
        }
    }

    classObj.students.push(req.user._id);
    await classObj.save();

    // Auto-mark attendance
    await Attendance.create({
        classId: classObj._id,
        studentId: req.user._id,
        status: 'present',
        date: new Date()
    });

    res.json({ message: 'Enrolled successfully and attendance marked!', classId: classObj._id });
};

// @desc    Generate QR Token for a class
// @route   GET /api/classes/:id/qr
// @access  Private (Teacher)
const generateQR = async (req, res) => {
    const classObj = await Class.findById(req.params.id);
    
    if (!classObj) {
        return res.status(404).json({ message: 'Class not found' });
    }

    if (classObj.teacherId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    // Generate a short-lived token containing classId and timestamp
    // Expiry is handled by verification, but we can set JWT expiry too.
    const payload = {
        classId: classObj._id,
        generatedAt: Date.now(),
    };

    // 60 seconds validity
    const qrToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '60s' });

    res.json({ qrToken });
};

// @desc    Backfill missing codes
// @route   POST /api/classes/backfill
// @access  Public (Temporary)
const backfillCodes = async (req, res) => {
    const classes = await Class.find({ $or: [{ code: { $exists: false } }, { code: null }, { code: "" }] });
    let count = 0;
    for (const cls of classes) {
        cls.code = Math.random().toString(36).substring(2, 8).toUpperCase();
        await cls.save();
        count++;
    }
    res.json({ message: `Updated ${count} classes with new codes` });
};

module.exports = {
    createClass,
    getClasses,
    getClassById,
    enrollClass,
    enrollByCode,
    generateQR,
    getAllAvailableClasses,
    backfillCodes
};
