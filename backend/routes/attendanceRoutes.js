const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getMyHistory,
  getSessionAttendance,
  getClassReport,
} = require('../controllers/attendanceController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { attendanceLimiter } = require('../middleware/rateLimiter');

// Student routes
router.post('/mark', protect, restrictTo('student'), attendanceLimiter, markAttendance);
router.get('/my-history', protect, restrictTo('student'), getMyHistory);

// Teacher routes
router.get('/session/:sessionId', protect, restrictTo('teacher'), getSessionAttendance);
router.get('/report/:classId', protect, restrictTo('teacher'), getClassReport);

module.exports = router;
