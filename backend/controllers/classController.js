const Class = require('../models/Class');
const User = require('../models/User');

/**
 * @desc    Create a new class
 * @route   POST /api/classes
 * @access  Private (Teacher only)
 */
const createClass = async (req, res, next) => {
  try {
    const { name, code, department } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide class name and code',
      });
    }

    const existingClass = await Class.findOne({ code: code.toUpperCase() });
    if (existingClass) {
      return res.status(409).json({
        success: false,
        message: 'A class with this code already exists',
      });
    }

    const newClass = await Class.create({
      name,
      code: code.toUpperCase(),
      department,
      teacher: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: newClass,
      message: 'Class created successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all classes for authenticated teacher
 * @route   GET /api/classes
 * @access  Private (Teacher only)
 */
const getClasses = async (req, res, next) => {
  try {
    const classes = await Class.find({ teacher: req.user._id })
      .populate('students', 'name email rollNumber department')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: classes.length,
      data: classes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single class by ID
 * @route   GET /api/classes/:classId
 * @access  Private (Teacher only)
 */
const getClassById = async (req, res, next) => {
  try {
    const classData = await Class.findOne({
      _id: req.params.classId,
      teacher: req.user._id,
    }).populate('students', 'name email rollNumber department');

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    res.status(200).json({
      success: true,
      data: classData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Enroll a student in a class
 * @route   POST /api/classes/:classId/enroll
 * @access  Private (Teacher only)
 */
const enrollStudent = async (req, res, next) => {
  try {
    const { studentEmail, rollNumber } = req.body;

    if (!studentEmail && !rollNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide student email or roll number',
      });
    }

    // Find the class
    const classData = await Class.findOne({
      _id: req.params.classId,
      teacher: req.user._id,
    });

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    // Find the student
    const query = studentEmail ? { email: studentEmail } : { rollNumber };
    const student = await User.findOne({ ...query, role: 'student' });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found. Make sure the student has registered.',
      });
    }

    // Check if already enrolled
    if (classData.students.includes(student._id)) {
      return res.status(409).json({
        success: false,
        message: 'Student is already enrolled in this class',
      });
    }

    // Enroll student
    classData.students.push(student._id);
    await classData.save();

    // Return updated class with populated students
    const updatedClass = await Class.findById(classData._id).populate(
      'students',
      'name email rollNumber department'
    );

    res.status(200).json({
      success: true,
      message: `${student.name} enrolled successfully`,
      data: updatedClass,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove a student from a class
 * @route   DELETE /api/classes/:classId/enroll/:studentId
 * @access  Private (Teacher only)
 */
const removeStudent = async (req, res, next) => {
  try {
    const classData = await Class.findOne({
      _id: req.params.classId,
      teacher: req.user._id,
    });

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    const studentIndex = classData.students.indexOf(req.params.studentId);
    if (studentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Student not found in this class',
      });
    }

    classData.students.splice(studentIndex, 1);
    await classData.save();

    res.status(200).json({
      success: true,
      message: 'Student removed from class',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createClass, getClasses, getClassById, enrollStudent, removeStudent };
