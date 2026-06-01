const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  sessionToken: {
    type: String,
    unique: true,
    required: true,
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class is required'],
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher is required'],
  },
  subject: {
    type: String,
    trim: true,
  },
  classroomLocation: {
    latitude: {
      type: Number,
      required: [true, 'Classroom latitude is required'],
    },
    longitude: {
      type: Number,
      required: [true, 'Classroom longitude is required'],
    },
    address: {
      type: String,
      trim: true,
    },
  },
  radiusMeters: {
    type: Number,
    default: 30,
    min: [10, 'Radius must be at least 10 meters'],
    max: [100, 'Radius cannot exceed 100 meters'],
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiry time is required'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  closedAt: {
    type: Date,
  },
  closedBy: {
    type: String,
    enum: ['teacher', 'expired', 'auto'],
  },
  attendanceCount: {
    type: Number,
    default: 0,
  },
});

// Virtual: check if session is expired
sessionSchema.virtual('isExpired').get(function () {
  return Date.now() > this.expiresAt;
});

// Include virtuals in JSON and Object outputs
sessionSchema.set('toJSON', { virtuals: true });
sessionSchema.set('toObject', { virtuals: true });

// Indexes
sessionSchema.index({ teacher: 1 });
sessionSchema.index({ class: 1 });
sessionSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('Session', sessionSchema);
