const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const Submission = require('../models/Submission');
const Campaign = require('../models/Campaign');
const EarningsLedger = require('../models/EarningsLedger');
const Withdrawal = require('../models/Withdrawal');
const SuspiciousFlag = require('../models/SuspiciousFlag');
const { calculateEarnings } = require('../utils/earnings');
const ledgerService = require('../services/ledger.service');
const { verifyMetricIncrease } = require('../services/mlVerification.service');
const mongoose = require('mongoose');

// Sync APIs dynamically to fetch pending admin metrics and recalculate calculatedEarnings
const syncSubmissionMetrics = asyncHandler(async (req, res, next) => {
  const submissionId = req.params.id;
  const creatorId = req.user.id;

  const submission = await Submission.findOne({ _id: submissionId, creatorId }).populate('campaignId');
  if (!submission) {
    return next(new AppError('Submission not found', 404));
  }

  // Check if there are pending metrics to sync
  if (!submission.hasPendingMetricSync || !submission.pendingMetrics) {
    return res.status(200).json({ 
      status: 'success', 
      data: { submission }, 
      message: 'Metrics are already up to date.' 
    });
  }

  const previousViews = submission.metrics?.views ?? 0;
  const previousLikes = submission.metrics?.likes ?? 0;
  const pendingViews = submission.pendingMetrics?.views ?? previousViews;
  const pendingLikes = submission.pendingMetrics?.likes ?? previousLikes;

  const viewIncrease = Math.max(0, pendingViews - previousViews);
  const likeIncrease = Math.max(0, pendingLikes - previousLikes);

  const lastSyncedAt = submission.metrics?.lastSyncedAt || submission.createdAt;
  const hoursSinceLastCheck = Math.max(0.1, (new Date() - lastSyncedAt) / (1000 * 60 * 60));
  
  const likeViewRatio = viewIncrease > 0 ? (likeIncrease / viewIncrease) : 0;

  const mlResult = await verifyMetricIncrease({
    total_views: pendingViews,
    total_likes: pendingLikes,
    view_increase: viewIncrease,
    like_increase: likeIncrease,
    like_view_ratio: likeViewRatio,
    hours_since_last_check: hoursSinceLastCheck
  });

  const verifiedViewsAdded = mlResult.verified_views_added ?? 0;
  const verifiedLikesAdded = mlResult.verified_likes_added ?? 0;

  const newMetrics = {
    views: previousViews + verifiedViewsAdded,
    likes: previousLikes + verifiedLikesAdded,
    comments: submission.pendingMetrics?.comments ?? submission.metrics?.comments ?? 0,
    shares: submission.pendingMetrics?.shares ?? submission.metrics?.shares ?? 0,
    lastSyncedAt: new Date()
  };

  submission.mlVerification = {
    prediction: mlResult.prediction,
    confidence: mlResult.confidence,
    verifiedViewsAdded,
    verifiedLikesAdded,
    checkedAt: new Date(),
    modelVersion: mlResult.model_version
  };

  if (mlResult.prediction === 'suspicious') {
    const existingFlag = await SuspiciousFlag.findOne({ submissionId: submission._id, status: 'open' });
    if (!existingFlag) {
      await SuspiciousFlag.create({
        submissionId: submission._id,
        flagType: 'ml_anomaly',
        reason: 'ML Model detected highly suspicious metric ratios or engagement velocity.',
        score: Math.round(mlResult.confidence * 100)
      });
    }
  }

  const calculatedEarnings = calculateEarnings(submission.campaignId, newMetrics);

  submission.metrics = newMetrics;
  submission.hasPendingMetricSync = false;
  submission.calculatedEarnings = calculatedEarnings;

  // Auto-transition tracking status logically
  let newTrackingStatus = submission.trackingStatus;
  if (submission.trackingStatus === 'submitted') newTrackingStatus = 'validating';
  else if (submission.trackingStatus === 'validating') newTrackingStatus = 'live';
  else if (submission.trackingStatus === 'live') newTrackingStatus = 'tracking';

  submission.trackingStatus = newTrackingStatus;
  await submission.save();

  // If approved, ensure ledger and budget are in sync
  if (submission.reviewStatus === 'approved' && calculatedEarnings > 0) {
    const existingLedger = await EarningsLedger.findOne({ submissionId });
    
    if (!existingLedger) {
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

