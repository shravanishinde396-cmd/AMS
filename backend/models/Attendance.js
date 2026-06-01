const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: [true, 'Session is required'],
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required'],
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class is required'],
  },
  markedAt: {
    type: Date,
    default: Date.now,
  },
  studentLocation: {
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
  },
  distanceFromClassroom: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['present', 'rejected'],
    default: 'present',
  },
  ipAddress: {
    type: String,
  },
  deviceInfo: {
    type: String,
  },
});

// Compound unique index — prevents duplicate marking
attendanceSchema.index({ session: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
