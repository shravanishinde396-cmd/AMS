const Class = require('../models/Class');
const Session = require('../models/Session');
const Attendance = require('../models/Attendance');

/**
 * @desc    Get teacher dashboard summary
 * @route   GET /api/teacher/dashboard
 * @access  Private (Teacher only)
 */
const getDashboard = async (req, res, next) => {
  try {
    const teacherId = req.user._id;

    // Get total classes
    const totalClasses = await Class.countDocuments({ teacher: teacherId });

    // Get total sessions
    const totalSessions = await Session.countDocuments({ teacher: teacherId });

    // Get total unique students across all classes
    const classes = await Class.find({ teacher: teacherId });
    const allStudentIds = new Set();
    classes.forEach((cls) => {
      cls.students.forEach((sid) => allStudentIds.add(sid.toString()));
    });
    const totalStudents = allStudentIds.size;

    // Get active session
    const activeSession = await Session.findOne({
      teacher: teacherId,
      isActive: true,
    })
      .populate('class', 'name code')
      .lean();

    // Auto-close expired active session
    if (activeSession && Date.now() > activeSession.expiresAt) {
      await Session.findByIdAndUpdate(activeSession._id, {
        isActive: false,
        closedAt: new Date(),
        closedBy: 'expired',
      });
      activeSession.isActive = false;
      activeSession.closedBy = 'expired';
    }

    // Get recent sessions (last 5)
    const recentSessions = await Session.find({ teacher: teacherId })
      .populate('class', 'name code')
      .sort({ startTime: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalClasses,
        totalSessions,
        totalStudents,
        activeSession: activeSession && activeSession.isActive ? activeSession : null,
        recentSessions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get stats for a specific class
 * @route   GET /api/teacher/stats/:classId
 * @access  Private (Teacher only)
 */
const getClassStats = async (req, res, next) => {
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

    const sessions = await Session.find({ class: classData._id }).sort({ startTime: -1 });

    const attendanceRecords = await Attendance.find({ class: classData._id })
      .populate('student', 'name rollNumber')
      .populate('session', 'subject startTime');

    const totalSessions = sessions.length;

    // Per-student attendance
    const attendanceByStudent = classData.students.map((student) => {
      const studentRecords = attendanceRecords.filter(
        (r) => r.student._id.toString() === student._id.toString()
      );
      return {
        name: student.name,
        rollNumber: student.rollNumber,
        present: studentRecords.length,
        total: totalSessions,
        percentage: totalSessions > 0 ? Math.round((studentRecords.length / totalSessions) * 100) : 0,
      };
    });

    // Per-session attendance
    const attendanceBySession = sessions.map((session) => {
      const sessionRecords = attendanceRecords.filter(
        (r) => r.session._id.toString() === session._id.toString()
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

module.exports = { getDashboard, getClassStats };
