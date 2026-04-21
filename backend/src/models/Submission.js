const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CampaignJoin',
      required: true
    },
    submissionType: {
      type: String,
      enum: ['url', 'file', 'both'],
      required: true
    },
    contentUrl: {
      type: String
    },
    fileUrl: {
      type: String
    },
    notes: {
      type: String,
      maxlength: 1000
    },
    reviewStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'flagged'],
      default: 'pending'
    },
    rejectionReason: {
      type: String
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    },
    platform: {
      type: String,
      enum: ['tiktok', 'instagram', 'youtube', 'twitter', 'other']
    },
    trackingStatus: {
      type: String,
      enum: ['submitted', 'validating', 'live', 'tracking', 'payout_ready', 'completed', 'rejected'],
      default: 'submitted'
    },
    payoutEligible: {
      type: Boolean,
      default: false
    },
    calculatedEarnings: {
      type: Number,
      default: 0
    },
    metrics: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      lastSyncedAt: { type: Date }
    },
    pendingMetrics: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      updatedAt: { type: Date }
    },
    hasPendingMetricSync: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Indexes
submissionSchema.index({ campaignId: 1, creatorId: 1 });
submissionSchema.index({ reviewStatus: 1 });

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;
