const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0.50
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'paid'],
      default: 'pending'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    processedAt: {
      type: Date
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: {
      type: String,
      trim: true
    },
    payoutMethod: {
       type: String,
       required: true,
       default: 'stripe_connect'
    },
    transactionId: {
      type: String
    },
    relatedLedgerEntryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EarningsLedger'
    }
  },
  {
    timestamps: true
  }
);

withdrawalSchema.index({ creatorId: 1, status: 1 });

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);
module.exports = Withdrawal;
