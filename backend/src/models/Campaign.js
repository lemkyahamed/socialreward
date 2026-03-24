const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, 'A campaign must have a title'],
      trim: true
    },
    slug: {
      type: String,
      unique: true,
      required: true
    },
    shortDescription: {
      type: String,
      required: [true, 'A campaign must have a short description'],
      maxlength: 300
    },
    fullDescription: {
      type: String,
      required: [true, 'A campaign must have a full description']
    },
    platform: {
      type: String,
      enum: ['tiktok', 'instagram', 'youtube', 'twitter', 'other'],
      required: true
    },
    category: {
      type: String,
      required: true
    },
    rewardType: {
      type: String,
      enum: ['fixed', 'per_submission'],
      default: 'fixed'
    },
    rewardAmount: {
      type: Number,
      required: true,
      min: 0
    },
    budgetTotal: {
      type: Number,
      required: true,
      min: 0
    },
    maxCreators: {
      type: Number,
      required: true,
      min: 1
    },
    requirements: {
      type: [String],
      default: []
    },
    instructions: {
      type: String,
      required: true
    },
    bannerUrl: {
      type: String
    },
    thumbnailUrl: {
      type: String
    },
    startAt: {
      type: Date,
      required: true
    },
    endAt: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['draft', 'live', 'paused', 'closed', 'archived'],
      default: 'draft'
    },
    stats: {
      views: { type: Number, default: 0 },
      joins: { type: Number, default: 0 },
      submissions: { type: Number, default: 0 },
      approvals: { type: Number, default: 0 },
      rejections: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true
  }
);

// Indexes for common queries
campaignSchema.index({ brandId: 1, status: 1 });
campaignSchema.index({ status: 1, platform: 1, category: 1 });

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;
