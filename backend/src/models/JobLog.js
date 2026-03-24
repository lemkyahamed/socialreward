const mongoose = require('mongoose');

const jobLogSchema = new mongoose.Schema(
  {
    jobName: {
      type: String,
      required: true
    },
    jobType: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['queued', 'running', 'success', 'failed'],
      default: 'queued'
    },
    payload: {
      type: mongoose.Schema.Types.Mixed
    },
    result: {
      type: mongoose.Schema.Types.Mixed
    },
    startedAt: {
      type: Date
    },
    finishedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Index
jobLogSchema.index({ jobName: 1, status: 1 });

const JobLog = mongoose.model('JobLog', jobLogSchema);

module.exports = JobLog;
