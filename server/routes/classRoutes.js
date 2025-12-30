const express = require('express');
const router = express.Router();
const { createClass, getClasses, getClassById, enrollClass, enrollByCode, generateQR, getAllAvailableClasses, backfillCodes } = require('../controllers/classController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/backfill', backfillCodes);
router.route('/')
    .post(protect, authorize('teacher'), createClass)
    .get(protect, getClasses);

router.get('/available', protect, authorize('student'), getAllAvailableClasses);

router.route('/:id')
    .get(protect, getClassById);

router.post('/:id/enroll', protect, authorize('student'), enrollClass);
router.post('/enroll', protect, authorize('student'), enrollByCode);
router.get('/:id/qr', protect, authorize('teacher'), generateQR);

module.exports = router;
