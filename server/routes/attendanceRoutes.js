const express = require('express');
const router = express.Router();
const { markAttendance, getHistory, getClassAttendance, exportAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/mark', protect, authorize('student'), markAttendance);
router.get('/history', protect, authorize('student'), getHistory);
router.get('/class/:classId', protect, authorize('teacher'), getClassAttendance);
router.get('/export/:classId', protect, authorize('teacher'), exportAttendance);

module.exports = router;
