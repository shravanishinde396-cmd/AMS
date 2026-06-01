const Attendance = require('../models/Attendance');
const Session = require('../models/Session');
const Class = require('../models/Class');
const { calculateDistance } = require('../utils/locationUtils');

/**
 * @desc    Mark attendance for a session
 * @route   POST /api/attendance/mark
 * @access  Private (Student only)
 */
const markAttendance = async (req, res, next) => {
  try {
    const { sessionToken, studentLocation } = req.body;

    // Validate input
    if (!sessionToken || !studentLocation || !studentLocation.latitude || !studentLocation.longitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide sessionToken and studentLocation (latitude, longitude)',
      });
    }

    // 1. Find session by token
    const session = await Session.findOne({ sessionToken }).populate('class', 'name code');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found. The link may be invalid.',
      });
    }

    // 2. Check session is active
    if (!session.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This session is no longer active',
      });
    }

    // 3. Check session has not expired
    if (Date.now() > session.expiresAt) {
      // Auto-close the session
      session.isActive = false;
      session.closedAt = new Date();
      session.closedBy = 'expired';
      await session.save();

      return res.status(400).json({
        success: false,
        message: 'This session has expired',
      });
    }

    // 4. Check student has not already marked attendance
    const existingAttendance = await Attendance.findOne({
      session: session._id,
      student: req.user._id,
    });

    if (existingAttendance) {
      return res.status(409).json({
        success: false,
        message: 'You have already marked attendance for this session',
        markedAt: existingAttendance.markedAt,
      });
    }

    // 5. Calculate distance using Haversine formula
    const distance = calculateDistance(
      studentLocation.latitude,
      studentLocation.longitude,
      session.classroomLocation.latitude,
      session.classroomLocation.longitude
    );

    // 6. Check if within radius
    if (distance > session.radiusMeters) {
      return res.status(403).json({
        success: false,
        message: 'You are not within the classroom range',
        distance,
        allowed: session.radiusMeters,
      });
    }

    // 7. Create attendance record
    const attendance = await Attendance.create({
      session: session._id,
      student: req.user._id,
      class: session.class._id,
      studentLocation: {
        latitude: studentLocation.latitude,
        longitude: studentLocation.longitude,
      },
      distanceFromClassroom: distance,
      status: 'present',
      ipAddress: req.ip || req.connection.remoteAddress,
      deviceInfo: req.headers['user-agent'],
    });

    // 8. Increment attendance count
    session.attendanceCount += 1;
    await session.save();

    // 9. Return success
    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully',
      data: {
        markedAt: attendance.markedAt,
        distanceFromClassroom: distance,
        className: session.class?.name,
        subject: session.subject,
      },
    });
  } catch (error) {
    // Handle duplicate key error (race condition on compound index)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You have already marked attendance for this session',
      });
    }
    next(error);
  }
};

/**
 * @desc    Get attendance history for authenticated student
 * @route   GET /api/attendance/my-history
 * @access  Private (Student only)
 */
const getMyHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const attendance = await Attendance.find({ student: req.user._id })
      .populate({
        path: 'session',
        select: 'subject startTime expiresAt',
      })
      .populate('class', 'name code')
      .sort({ markedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Attendance.countDocuments({ student: req.user._id });

    res.status(200).json({
      success: true,
      count: attendance.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get attendance records for a specific session
 * @route   GET /api/attendance/session/:sessionId
 * @access  Private (Teacher only)
 */
const getSessionAttendance = async (req, res, next) => {
  try {
    // Verify session belongs to teacher
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

    const attendance = await Attendance.find({ session: session._id })
      .populate('student', 'name email rollNumber')
      .sort({ markedAt: 1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get attendance report for a class
 * @route   GET /api/attendance/report/:classId
 * @access  Private (Teacher only)
 */
const getClassReport = async (req, res, next) => {
  try {
    const classData = await Class.findOne({
      _id: req.params.classId,
      teacher: req.user._id,
    }).populate('students', 'name email rollNumber');

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    // Get all sessions for this class
    const sessions = await Session.find({ class: classData._id }).sort({ startTime: -1 });

    // Get all attendance records for this class
    const attendanceRecords = await Attendance.find({ class: classData._id })
      .populate('student', 'name rollNumber')
      .populate('session', 'subject startTime');

    // Calculate per-student attendance
    const totalSessions = sessions.length;
    const attendanceByStudent = classData.students.map((student) => {
      const studentRecords = attendanceRecords.filter(
        (record) => record.student._id.toString() === student._id.toString()
      );
      return {
        name: student.name,
        rollNumber: student.rollNumber,
        email: student.email,
        present: studentRecords.length,
        total: totalSessions,
        percentage: totalSessions > 0 ? Math.round((studentRecords.length / totalSessions) * 100) : 0,
      };
    });

    // Calculate per-session attendance
    const attendanceBySession = sessions.map((session) => {
      const sessionRecords = attendanceRecords.filter(
        (record) => record.session._id.toString() === session._id.toString()
      );
      return {
        sessionId: session._id,
        date: session.startTime,
        subject: session.subject,
        present: sessionRecords.length,
        total: classData.students.length,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        className: classData.name,
        classCode: classData.code,
        totalSessions,
        totalStudents: classData.students.length,
        attendanceByStudent,
        attendanceBySession,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { markAttendance, getMyHistory, getSessionAttendance, getClassReport };
