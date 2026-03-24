const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema(
  {
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
      unique: true // One payout per submission
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'paid', 'failed'],
      default: 'pending'
    },
    paidAt: {
      type: Date
    },
    paymentReference: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Indexes
payoutSchema.index({ brandId: 1, status: 1 });
payoutSchema.index({ creatorId: 1, status: 1 });

const Payout = mongoose.model('Payout', payoutSchema);

module.exports = Payout;
