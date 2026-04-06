const mongoose = require('mongoose');

const withdrawalRequestSchema = new mongoose.Schema(
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
    payoutMethod: {
      type: String,
      default: 'stripe_connect',
      required: true
    },
    transactionReference: {
      type: String
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

withdrawalRequestSchema.index({ creatorId: 1, status: 1 });

const WithdrawalRequest = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);
module.exports = WithdrawalRequest;
