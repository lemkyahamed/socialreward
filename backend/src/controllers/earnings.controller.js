const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const Submission = require('../models/Submission');
const Campaign = require('../models/Campaign');
const EarningsLedger = require('../models/EarningsLedger');
const WithdrawalRequest = require('../models/WithdrawalRequest');
const { calculateEarnings } = require('../utils/earnings');
const mongoose = require('mongoose');

// Sync APIs dynamically to fetch live metrics and recalculate calculatedEarnings
const syncSubmissionMetrics = asyncHandler(async (req, res, next) => {
  const submissionId = req.params.id;
  const creatorId = req.user.id;

  const submission = await Submission.findOne({ _id: submissionId, creatorId }).populate('campaignId');
  if (!submission) {
    return next(new AppError('Submission not found', 404));
  }

  // Mock API scrape mechanism (in production, integrate YouTube/TikTok APIs securely)
  const mockScrape = {
    views: Math.floor(Math.random() * 50000) + 1000,
    likes: Math.floor(Math.random() * 5000) + 100,
    comments: Math.floor(Math.random() * 500) + 10,
    shares: Math.floor(Math.random() * 200) + 5
  };

  const newMetrics = {
    views: submission.metrics?.views > 0 ? submission.metrics.views : mockScrape.views,
    likes: submission.metrics?.likes > 0 ? submission.metrics.likes : mockScrape.likes,
    comments: submission.metrics?.comments > 0 ? submission.metrics.comments : mockScrape.comments,
    shares: submission.metrics?.shares > 0 ? submission.metrics.shares : mockScrape.shares,
    syncedAt: new Date()
  };

  const rawEarnings = calculateEarnings(submission.campaignId, newMetrics);
  const calculatedEarnings = Number(rawEarnings.toFixed(2));

  // Auto-clear thresholds (if approved status allows payout readiness scaling)
  let newTrackingStatus = submission.trackingStatus;
  if (submission.trackingStatus === 'validating') newTrackingStatus = 'live';

  submission.metrics = newMetrics;
  submission.calculatedEarnings = calculatedEarnings;
  submission.trackingStatus = newTrackingStatus;
  await submission.save();

  // If approved and not logged yet in ledger, create an immutable delta
  if (submission.reviewStatus === 'approved' && calculatedEarnings > 0) {
    const existingLedger = await EarningsLedger.findOne({ submissionId });
    if (!existingLedger) {
      await EarningsLedger.create({
        creatorId,
        submissionId: submission._id,
        campaignId: submission.campaignId._id,
        amount: calculatedEarnings,
        transactionType: 'credit',
        status: 'cleared',
        description: `Yield from campaign: ${submission.campaignId.title}`
      });
    } else if (existingLedger.amount !== calculatedEarnings) {
      // Update ledger if metrics pushed higher earnings
      existingLedger.amount = calculatedEarnings;
      await existingLedger.save();
    }
  }

  res.status(200).json({ status: 'success', data: { submission } });
});

// Fetch detailed financial accounting bounds
const getCreatorLedger = asyncHandler(async (req, res, next) => {
  const creatorId = req.user.id;
  
  const ledgers = await EarningsLedger.find({ creatorId })
    .populate('campaignId', 'title')
    .sort({ createdAt: -1 });

  const totalCleared = ledgers.filter(l => l.status === 'cleared' && l.transactionType === 'credit').reduce((a, b) => a + b.amount, 0);
  const totalWithdrawn = ledgers.filter(l => l.status === 'withdrawn' || l.transactionType === 'debit').reduce((a, b) => a + b.amount, 0);
  const pendingCredits = ledgers.filter(l => l.status === 'pending').reduce((a, b) => a + b.amount, 0);

  res.status(200).json({
    status: 'success',
    data: {
      balances: {
        available: totalCleared - totalWithdrawn,
        withdrawn: totalWithdrawn,
        pending: pendingCredits
      },
      transactions: ledgers
    }
  });
});

// Fire withdrawal and debit balance
const requestWithdrawal = asyncHandler(async (req, res, next) => {
  const creatorId = req.user.id;
  const { amount, payoutMethod } = req.body;

  if (!amount || amount <= 0) {
    return next(new AppError('Invalid withdrawal amount', 400));
  }

  const ledgers = await EarningsLedger.find({ creatorId, status: 'cleared', transactionType: 'credit' });
  const totalCleared = ledgers.reduce((a, b) => a + b.amount, 0);
  
  const previousWithdrawals = await EarningsLedger.find({ creatorId, transactionType: 'debit' });
  const totalWithdrawn = previousWithdrawals.reduce((a, b) => a + b.amount, 0);

  const availableBalance = totalCleared - totalWithdrawn;

  if (amount > availableBalance) {
    return next(new AppError(`Insufficient cleared funds. Available: $${availableBalance}`, 400));
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const request = await WithdrawalRequest.create([{
      creatorId,
      amount,
      payoutMethod: payoutMethod || 'stripe'
    }], { session });

    await EarningsLedger.create([{
      creatorId,
      amount,
      transactionType: 'debit',
      status: 'pending',
      description: `Withdrawal request initiated via ${payoutMethod || 'stripe'}`
    }], { session });

    await session.commitTransaction();
    res.status(201).json({ status: 'success', data: { withdrawal: request[0] } });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

module.exports = {
  syncSubmissionMetrics,
  getCreatorLedger,
  requestWithdrawal
};
