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


// @desc    End class (Student leaves)
// @route   POST /api/attendance/end
// @access  Private (Student)
const endClass = async (req, res) => {
    const { classId } = req.body;

    if (!classId) {
        return res.status(400).json({ message: 'Class ID is required' });
    }

    try {
        const startOfDay = new Date();
        startOfDay.setHours(0,0,0,0);
        const endOfDay = new Date();
        endOfDay.setHours(23,59,59,999);

        // Find today's attendance record
        const attendance = await Attendance.findOne({
            classId,
            studentId: req.user._id,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found for today. Did you join?' });
        }

        // Update leave time - keep the latest time if they click multiple times
        attendance.leaveTime = new Date();
        await attendance.save();

        res.json({ message: 'Class ended successfully', leaveTime: attendance.leaveTime });

    } catch (error) {
        console.error("Error ending class:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get live status of all enrolled students
// @route   GET /api/attendance/live/:classId
// @access  Private (Teacher)
const getLiveAttendanceStatus = async (req, res) => {
    const { classId } = req.params;

    try {
        const classObj = await Class.findById(classId).populate('students', 'name email');
        if (!classObj) {
            return res.status(404).json({ message: 'Class not found' });
        }

        if (classObj.teacherId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Get today's attendance Record
        // We use a broader range or just check "last 12 hours" to be safe, but "today" is standard
        const startOfDay = new Date();
        startOfDay.setHours(0,0,0,0);
        const endOfDay = new Date();
        endOfDay.setHours(23,59,59,999);

        const attendanceRecords = await Attendance.find({ 
            classId,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        // Map students to status
        const liveStatus = classObj.students.map(student => {
            const record = attendanceRecords.find(r => r.studentId.toString() === student._id.toString());
            
            let status = 'Waiting to join';
            if (record) {
                status = 'Present'; // Or 'Left' if leaveTime exists? Requirement says "Present" or "Absent" mostly.
                // User requirement: "keep on updating... initial state Waiting to join... after class ends if didn't join show Absent"
                // For now, if they have a record, they are 'Present' (or have attended).
                // If the class has officially "ended" (based on schedule), we could mark 'Waiting' as 'Absent'.
                
                // Let's refine based on user prompt: "show every student ... with 'present' or 'absent' status ... initial state 'Waiting to join'"
            } else {
                 // Check if class time is over
                 if (classObj.endTime) {
                    const now = new Date();
                    const [endHour, endMinute] = classObj.endTime.split(':').map(Number);
                    const classEndTime = new Date();
                    classEndTime.setHours(endHour, endMinute, 0);

                    // If simple time compare:
                    const currentTimeVal = now.getHours() * 60 + now.getMinutes();
                    const endTimeVal = endHour * 60 + endMinute;

                    // Also check if it's the right day
                    const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    const currentDay = daysMap[now.getDay()];
                    
                    if (classObj.days.includes(currentDay) && currentTimeVal > endTimeVal) {
                        status = 'Absent';
                    }
                 }
            }

            return {
                _id: student._id,
                name: student.name,
                email: student.email,
                status: status,
                joinTime: record ? record.date : null,
                leaveTime: record ? record.leaveTime : null
            };
        });

        res.json(liveStatus);

    } catch (error) {
         console.error("Error fetching live status:", error);
         res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    markAttendance,
    getHistory,
    getClassAttendance,
    exportAttendance,
    endClass,
    getLiveAttendanceStatus
};
