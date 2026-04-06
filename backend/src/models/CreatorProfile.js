const mongoose = require('mongoose');

const creatorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    displayName: {
      type: String,
      required: [true, 'Please provide a display name']
    },
    bio: {
      type: String,
      maxlength: 500
    },
    avatarUrl: {
      type: String
    },
    country: {
      type: String
    },
    creatorCategory: {
      type: String
    },
    primaryPlatform: {
      type: String
    },
    followerRange: {
      type: String
    },
    trustScore: {
      type: Number,
      default: 50 // 'New' starts at 50/100
    },
    trustLabel: {
      type: String,
      enum: ['New', 'Rising', 'Trusted', 'Verified'],
      default: 'New'
    },
    trustMetrics: {
      approvals: { type: Number, default: 0 },
      rejections: { type: Number, default: 0 },
      lateSubmissions: { type: Number, default: 0 }
    },
    socialAccounts: [{
      platform: String,
      username: String,
      profileUrl: String,
      followerCount: { type: Number, default: 0 },
      lastSyncedAt: Date,
      connected: { type: Boolean, default: false }
    }],
    payoutSettings: {
      provider: String,
      status: String,
      accountName: String,
      connectedAt: Date
    },
    isOnboarded: {
      type: Boolean,
      default: false
    },
    payoutConnected: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const CreatorProfile = mongoose.model('CreatorProfile', creatorProfileSchema);

module.exports = CreatorProfile;
