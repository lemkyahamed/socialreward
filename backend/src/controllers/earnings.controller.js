const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const Submission = require('../models/Submission');
const Campaign = require('../models/Campaign');
const EarningsLedger = require('../models/EarningsLedger');
const Withdrawal = require('../models/Withdrawal');
const { calculateEarnings } = require('../utils/earnings');
const ledgerService = require('../services/ledger.service');
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
    lastSyncedAt: new Date()
  };

  const calculatedEarnings = calculateEarnings(submission.campaignId, newMetrics);

  // Auto-transition tracking status if in validating/live
  let newTrackingStatus = submission.trackingStatus;
  if (submission.trackingStatus === 'submitted') newTrackingStatus = 'validating';
  if (submission.trackingStatus === 'validating') newTrackingStatus = 'live';
  if (submission.trackingStatus === 'live') newTrackingStatus = 'tracking';

  submission.metrics = newMetrics;
  submission.calculatedEarnings = calculatedEarnings;
  submission.trackingStatus = newTrackingStatus;
  await submission.save();

  // If approved, ensure ledger and budget are in sync
  if (submission.reviewStatus === 'approved' && calculatedEarnings > 0) {
    const existingLedger = await EarningsLedger.findOne({ submissionId });
    
    if (!existingLedger) {
       // This shouldn't normally happen as approval creates the ledger entry, 
       // but we handle it just in case.
      await ledgerService.createLedgerCredit({
        creatorId,
        submissionId: submission._id,
        campaignId: submission.campaignId._id,
        amount: calculatedEarnings,
        status: 'cleared',
        description: `Yield from campaign: ${submission.campaignId.title}`
      });
      
      // Update campaign budget
      await Campaign.findByIdAndUpdate(submission.campaignId._id, {
        $inc: { 
          spentBudget: calculatedEarnings,
          remainingBudget: -calculatedEarnings
        }
      });
    } else if (existingLedger.amount !== calculatedEarnings) {
      const delta = calculatedEarnings - existingLedger.amount;
      
      // Update ledger if metrics pushed higher earnings
      existingLedger.amount = calculatedEarnings;
      await existingLedger.save();
      
      // Sync campaign budget with the new delta
      await Campaign.findByIdAndUpdate(submission.campaignId._id, {
        $inc: { 
          spentBudget: delta,
          remainingBudget: -delta
        }
      });
    }
  }

  res.status(200).json({ status: 'success', data: { submission } });
});

/**
 * GET /creator/earnings/ledger
 * Fetch detailed financial accounting bounds and history.
 */
const getCreatorLedger = asyncHandler(async (req, res, next) => {
  const creatorId = req.user.id;
  
  const [balances, transactions] = await Promise.all([
    ledgerService.getCreatorBalances(creatorId),
    ledgerService.getCreatorLedger(creatorId)
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      balances,
      transactions
    }
  });
});

/**
 * POST /creator/earnings/withdraw
 * Fire withdrawal and log debit balance to ledger.
 */
const requestWithdrawal = asyncHandler(async (req, res, next) => {
  const creatorId = req.user.id;
  const { amount, payoutMethod } = req.body;

  if (!amount || amount <= 0) {
    return next(new AppError('Invalid withdrawal amount', 400));
  }

  const balances = await ledgerService.getCreatorBalances(creatorId);
  const availableBalance = balances.available;

  if (amount > availableBalance) {
    return next(new AppError(`Insufficient cleared funds. Available: $${availableBalance}`, 400));
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const ledgerEntry = await ledgerService.createLedgerDebit({
      creatorId,
      amount,
      status: 'pending',
      description: `Withdrawal request initiated via ${payoutMethod || 'stripe'}`
    }, session);

    const withdrawalRequest = await Withdrawal.create([{
      creatorId,
      amount,
      payoutMethod: payoutMethod || 'stripe_connect',
      status: 'pending',
      requestedAt: new Date(),
      relatedLedgerEntryId: ledgerEntry._id
    }], { session });

    await session.commitTransaction();
    const updatedBalances = await ledgerService.getCreatorBalances(creatorId);
    res.status(201).json({ 
      status: 'success', 
      data: { 
        withdrawal: withdrawalRequest[0],
        balances: updatedBalances
      } 
    });
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

