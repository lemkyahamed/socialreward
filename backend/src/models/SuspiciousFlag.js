const mongoose = require('mongoose');

const suspiciousFlagSchema = new mongoose.Schema(
  {
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: true
    },
    flagType: {
      type: String,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['open', 'resolved', 'ignored'],
      default: 'open'
    }
  },
  {
    timestamps: true
  }
);

// Index
suspiciousFlagSchema.index({ status: 1 });
suspiciousFlagSchema.index({ submissionId: 1 });

const SuspiciousFlag = mongoose.model('SuspiciousFlag', suspiciousFlagSchema);

module.exports = SuspiciousFlag;
