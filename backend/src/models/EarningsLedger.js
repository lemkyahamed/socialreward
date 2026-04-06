const mongoose = require('mongoose');

const earningsLedgerSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission'
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign'
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    transactionType: {
      type: String,
      enum: ['credit', 'debit'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'cleared', 'withdrawn'],
      default: 'pending'
    },
    description: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

earningsLedgerSchema.index({ creatorId: 1, status: 1 });
earningsLedgerSchema.index({ submissionId: 1 });

const EarningsLedger = mongoose.model('EarningsLedger', earningsLedgerSchema);
module.exports = EarningsLedger;
