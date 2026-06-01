const express = require('express');
const router = express.Router();
const {
  createSession,
  getSessions,
  getSessionById,
  getSessionByToken,
  closeSession,
  deleteSession,
} = require('../controllers/sessionController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Public route — session preview by token (must be before /:sessionId to avoid conflict)
router.get('/link/:sessionToken', getSessionByToken);

// Protected teacher-only routes
router.post('/create', protect, restrictTo('teacher'), createSession);
router.get('/', protect, restrictTo('teacher'), getSessions);
router.get('/:sessionId', protect, restrictTo('teacher'), getSessionById);
router.put('/:sessionId/close', protect, restrictTo('teacher'), closeSession);
router.delete('/:sessionId', protect, restrictTo('teacher'), deleteSession);

module.exports = router;
