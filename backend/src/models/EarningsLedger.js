const mongoose = require('mongoose');

const earningsLedgerSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true
    },
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission'
    },
    transactionType: {
      type: String,
      enum: ['credit', 'debit'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'cleared', 'withdrawn', 'failed'],
      default: 'pending'
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

earningsLedgerSchema.index({ creatorId: 1, createdAt: -1 });

const EarningsLedger = mongoose.model('EarningsLedger', earningsLedgerSchema);
module.exports = EarningsLedger;
