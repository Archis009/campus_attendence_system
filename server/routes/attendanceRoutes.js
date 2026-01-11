const express = require('express');
const router = express.Router();
const { markAttendance, getHistory, getClassAttendance, exportAttendance, endClass, getLiveAttendanceStatus } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/mark', protect, authorize('student'), markAttendance);
router.post('/end', protect, authorize('student'), endClass);
router.get('/history', protect, authorize('student'), getHistory);
router.get('/class/:classId', protect, authorize('teacher'), getClassAttendance);
router.get('/live/:classId', protect, authorize('teacher'), getLiveAttendanceStatus);
router.get('/export/:classId', protect, authorize('teacher'), exportAttendance);

module.exports = router;
