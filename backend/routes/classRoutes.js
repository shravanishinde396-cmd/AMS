const express = require('express');
const router = express.Router();
const {
  createClass,
  getClasses,
  getClassById,
  enrollStudent,
  removeStudent,
} = require('../controllers/classController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// All class routes are teacher-only
router.use(protect, restrictTo('teacher'));

router.route('/').post(createClass).get(getClasses);
router.route('/:classId').get(getClassById);
router.route('/:classId/enroll').post(enrollStudent);
router.route('/:classId/enroll/:studentId').delete(removeStudent);

module.exports = router;
