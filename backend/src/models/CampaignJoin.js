const mongoose = require('mongoose');

const campaignJoinSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ['joined', 'withdrawn'],
      default: 'joined'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate joins for the same creator and campaign
campaignJoinSchema.index({ campaignId: 1, creatorId: 1 }, { unique: true });

const CampaignJoin = mongoose.model('CampaignJoin', campaignJoinSchema);

module.exports = CampaignJoin;
