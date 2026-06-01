const express = require('express');
const router = express.Router();
const { getDashboard, getClassStats } = require('../controllers/teacherController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect, restrictTo('teacher'));

router.get('/dashboard', getDashboard);
router.get('/stats/:classId', getClassStats);

module.exports = router;
