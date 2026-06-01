const { v4: uuidv4 } = require('uuid');
const Session = require('../models/Session');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const { generateSessionLink } = require('../utils/generateLink');

/**
 * @desc    Create a new attendance session
 * @route   POST /api/sessions/create
 * @access  Private (Teacher only)
 */
const createSession = async (req, res, next) => {
  try {
    const { classId, subject, classroomLocation, durationMinutes, radiusMeters } = req.body;

    // Validate required fields
    if (!classId || !classroomLocation || !classroomLocation.latitude || !classroomLocation.longitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide classId and classroomLocation (latitude, longitude)',
      });
    }

    // Verify class exists and belongs to teacher
    const classData = await Class.findOne({ _id: classId, teacher: req.user._id });
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found or you are not the teacher of this class',
      });
    }

    // Check no other active session for this class
    const activeSession = await Session.findOne({ class: classId, isActive: true });
    if (activeSession) {
      // Auto-close if expired
      if (Date.now() > activeSession.expiresAt) {
        activeSession.isActive = false;
        activeSession.closedAt = new Date();
        activeSession.closedBy = 'expired';
        await activeSession.save();
      } else {
        return res.status(409).json({
          success: false,
          message: 'An active session already exists for this class. Close it first.',
        });
      }
    }

    // Generate session token
    const sessionToken = uuidv4();

    // Calculate expiry
    const duration = durationMinutes || parseInt(process.env.SESSION_DURATION_MINUTES) || 5;
    const expiresAt = new Date(Date.now() + duration * 60 * 1000);

    // Create session
    const session = await Session.create({
      sessionToken,
      class: classId,
      teacher: req.user._id,
      subject: subject || classData.name,
      classroomLocation: {
        latitude: classroomLocation.latitude,
        longitude: classroomLocation.longitude,
        address: classroomLocation.address,
      },
      radiusMeters: radiusMeters || parseInt(process.env.LOCATION_RADIUS_METERS) || 30,
      expiresAt,
    });

    // Generate attendance link
    const attendanceLink = generateSessionLink(sessionToken);

    res.status(201).json({
      success: true,
      data: {
        session,
        attendanceLink,
      },
      message: 'Session created successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all sessions for authenticated teacher
 * @route   GET /api/sessions
 * @access  Private (Teacher only)
 */
const getSessions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, classId, active } = req.query;

    const query = { teacher: req.user._id };
    if (classId) query.class = classId;
    if (active !== undefined) query.isActive = active === 'true';

    const sessions = await Session.find(query)
      .populate('class', 'name code')
      .sort({ startTime: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Session.countDocuments(query);

    res.status(200).json({
      success: true,
      count: sessions.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get session by ID with attendance records
 * @route   GET /api/sessions/:sessionId
 * @access  Private (Teacher only)
 */
const getSessionById = async (req, res, next) => {
  try {
    const session = await Session.findOne({
      _id: req.params.sessionId,
      teacher: req.user._id,
    })
      .populate('class', 'name code')
      .populate('teacher', 'name email');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Get attendance records for this session
    const attendance = await Attendance.find({ session: session._id })
      .populate('student', 'name email rollNumber')
      .sort({ markedAt: 1 });

    res.status(200).json({
      success: true,
      data: {
        session,
        attendance,
        attendanceLink: generateSessionLink(session.sessionToken),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get session by token (public preview)
 * @route   GET /api/sessions/link/:sessionToken
 * @access  Public
 */
const getSessionByToken = async (req, res, next) => {
  try {
    const session = await Session.findOne({ sessionToken: req.params.sessionToken })
      .populate('class', 'name code')
      .populate('teacher', 'name');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found. The link may be invalid.',
      });
    }

    // SECURITY: Never return classroom coordinates to students
    res.status(200).json({
      success: true,
      data: {
        subject: session.subject,
        className: session.class?.name,
        classCode: session.class?.code,
        teacherName: session.teacher?.name,
        isActive: session.isActive,
        isExpired: Date.now() > session.expiresAt,
        expiresAt: session.expiresAt,
        startTime: session.startTime,
        radiusMeters: session.radiusMeters,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Close a session manually
 * @route   PUT /api/sessions/:sessionId/close
 * @access  Private (Teacher only)
 */
const closeSession = async (req, res, next) => {
  try {
    const session = await Session.findOne({
      _id: req.params.sessionId,
      teacher: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    if (!session.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Session is already closed',
      });
    }

    session.isActive = false;
    session.closedAt = new Date();
    session.closedBy = 'teacher';
    await session.save();

    res.status(200).json({
      success: true,
      data: session,
      message: 'Session closed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a session
 * @route   DELETE /api/sessions/:sessionId
 * @access  Private (Teacher only)
 */
const deleteSession = async (req, res, next) => {
  try {
    const session = await Session.findOne({
      _id: req.params.sessionId,
      teacher: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Check if attendance records exist
    const attendanceCount = await Attendance.countDocuments({ session: session._id });
    if (attendanceCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete session with ${attendanceCount} attendance records. Close it instead.`,
      });
    }

    await Session.findByIdAndDelete(session._id);

    res.status(200).json({
      success: true,
      message: 'Session deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSession,
  getSessions,
  getSessionById,
  getSessionByToken,
  closeSession,
  deleteSession,
};
