const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Submission = require('../models/Submission');
const CampaignJoin = require('../models/CampaignJoin');
const CreatorProfile = require('../models/CreatorProfile');
const BrandProfile = require('../models/BrandProfile');
const SuspiciousFlag = require('../models/SuspiciousFlag');
const JobLog = require('../models/JobLog');
const AppError = require('../utils/appError');
const AuditLog = require('../models/AuditLog');
const Withdrawal = require('../models/Withdrawal');
const EarningsLedger = require('../models/EarningsLedger');
const { reevaluateTrustScore } = require('../utils/trustScore');
const { calculateEarnings } = require('../utils/earnings');
const ledgerService = require('./ledger.service');

const getDashboardStats = async () => {
  const [totalUsers, totalCampaigns, openSuspicious, failedJobs] = await Promise.all([
    User.countDocuments(),
    Campaign.countDocuments({ status: 'live' }),
    SuspiciousFlag.countDocuments({ status: 'open' }),
    JobLog.countDocuments({ status: 'failed' })
  ]);

  const recentActivity = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('actorUserId', 'email role');

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  let baseUsers = await User.countDocuments({ createdAt: { $lt: sixMonthsAgo } });

  const userAggregation = await User.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
        users: { $sum: 1 }
      }
    }
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const userGrowth = [];
  
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    
    const found = userAggregation.find(a => a._id.month === m && a._id.year === y);
    const newUsers = found ? found.users : 0;
    baseUsers += newUsers;
    
    userGrowth.push({
      month: monthNames[m - 1],
      users: baseUsers
    });
  }

  return {
    totalUsers,
    liveCampaigns: totalCampaigns,
    suspiciousItems: openSuspicious,
    failedJobs,
    userGrowth,
    recentActivity
  };
};

const getUsers = async (queryFilters) => {
  const { search, role, status, page = 1, limit = 20 } = queryFilters;
  
  const filter = {};
  if (search) filter.email = { $regex: search, $options: 'i' };
  if (role) filter.role = role;
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const users = await User.find(filter)
    .populate('profile')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit * 1);

  const total = await User.countDocuments(filter);

  return {
    items: users,
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page, 10),
      limit: parseInt(limit, 10)
    }
  };
};

const updateUserStatus = async (adminId, userId, status) => {
  const user = await User.findById(userId).select('+refreshTokenVersion');
  if (!user) throw new AppError('User not found', 404);

  // Prevent admin self-suspend
  if (user._id.toString() === adminId.toString()) {
    throw new AppError('Cannot suspend your own account', 400);
  }

  user.status = status;
  // If suspending, we can invalidate tokens
  if (status === 'suspended') {
    user.refreshTokenVersion += 1;
  }
  
  await user.save();

  await AuditLog.create({
    actorUserId: adminId,
    entityType: 'User',
    entityId: user._id,
    action: `UPDATE_USER_STATUS_${status.toUpperCase()}`,
    metadata: { role: user.role }
  });

  return user;
};

const getCampaigns = async (queryFilters) => {
  const { search, status, platform, page = 1, limit = 20 } = queryFilters;

  const filter = {};
  if (search) filter.title = { $regex: search, $options: 'i' };
  if (status) filter.status = status;
  if (platform) filter.platform = platform;

  const skip = (page - 1) * limit;

  const campaigns = await Campaign.find(filter)
    .populate('brandId', 'email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit * 1);

  const total = await Campaign.countDocuments(filter);

  return {
    items: campaigns,
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page, 10),
      limit: parseInt(limit, 10)
    }
  };
};

const updateCampaignStatus = async (adminId, campaignId, status) => {
  const campaign = await Campaign.findByIdAndUpdate(
    campaignId,
    { status },
    { new: true }
  );

  if (!campaign) throw new AppError('Campaign not found', 404);

  await AuditLog.create({
    actorUserId: adminId,
    entityType: 'Campaign',
    entityId: campaign._id,
    action: `ADMIN_UPDATE_CAMPAIGN_STATUS_${status.toUpperCase()}`,
  });

  return campaign;
};

const getSuspiciousFlags = async (queryFilters) => {
  const { status, page = 1, limit = 20 } = queryFilters;
  
  const filter = {};
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const flags = await SuspiciousFlag.find(filter)
    .populate({
      path: 'submissionId',
      populate: [
        { path: 'creatorId', select: 'email' },
        { path: 'campaignId', select: 'title brandId' }
      ]
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit * 1);

  const total = await SuspiciousFlag.countDocuments(filter);

  return {
    items: flags,
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page, 10),
      limit: parseInt(limit, 10)
    }
  };
};

const updateSuspiciousFlagStatus = async (adminId, flagId, status) => {
  const flag = await SuspiciousFlag.findByIdAndUpdate(
    flagId,
    { status },
    { new: true }
  );

  if (!flag) throw new AppError('Suspicious flag not found', 404);

  await AuditLog.create({
    actorUserId: adminId,
    entityType: 'SuspiciousFlag',
    entityId: flag._id,
    action: `ADMIN_RESOLVE_FLAG_${status.toUpperCase()}`,
  });

  return flag;
};

const getJobLogs = async (queryFilters) => {
  const { status, page = 1, limit = 20 } = queryFilters;
  
  const filter = {};
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const jobs = await JobLog.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit * 1);

  const total = await JobLog.countDocuments(filter);

  return {
    items: jobs,
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page, 10),
      limit: parseInt(limit, 10)
    }
  };
};

const deleteCampaign = async (adminId, campaignId) => {
  const campaign = await Campaign.findByIdAndDelete(campaignId);
  if (!campaign) throw new AppError('Campaign not found', 404);

  await AuditLog.create({
    actorUserId: adminId,
    entityType: 'Campaign',
    entityId: campaignId,
    action: 'ADMIN_DELETE_CAMPAIGN',
    metadata: { title: campaign.title }
  });

  return true;
};

const getUserImpact = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  let impact = {
    role: user.role,
    email: user.email,
    stats: {}
  };

  if (user.role === 'creator') {
    const [joins, submissions] = await Promise.all([
      CampaignJoin.countDocuments({ creatorId: userId }),
      Submission.countDocuments({ creatorId: userId })
    ]);
    impact.stats = { joins, submissions };
  } else if (user.role === 'brand') {
    const campaigns = await Campaign.find({ brandId: userId });
    const campaignIds = campaigns.map(c => c._id);
    const [submissions] = await Promise.all([
      Submission.countDocuments({ campaignId: { $in: campaignIds } })
    ]);
    impact.stats = { 
      campaigns: campaigns.length, 
      submissions 
    };
  }

  return impact;
};

const deleteUser = async (adminId, userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  // Prevent self-deletion
  if (user._id.toString() === adminId.toString()) {
    throw new AppError('Cannot delete your own admin account', 400);
  }

  const role = user.role;
  const email = user.email;

  if (role === 'creator') {
    // Cascading delete for Creator
    await Promise.all([
      Submission.deleteMany({ creatorId: userId }),
      CampaignJoin.deleteMany({ creatorId: userId }),
      EarningsLedger.deleteMany({ creatorId: userId }),
      Withdrawal.deleteMany({ creatorId: userId }),
      CreatorProfile.deleteOne({ userId }),
      User.findByIdAndDelete(userId)
    ]);
  } else if (role === 'brand') {
    // Cascading delete for Brand
    const campaigns = await Campaign.find({ brandId: userId });
    const campaignIds = campaigns.map(c => c._id);

    await Promise.all([
      Submission.deleteMany({ campaignId: { $in: campaignIds } }),
      CampaignJoin.deleteMany({ campaignId: { $in: campaignIds } }),
      Campaign.deleteMany({ brandId: userId }),
      EarningsLedger.deleteMany({ campaignId: { $in: campaignIds } }),
      BrandProfile.deleteOne({ userId }),
      User.findByIdAndDelete(userId)
    ]);
  } else {
    // Admin or other role (just delete user record if no profile)
    await User.findByIdAndDelete(userId);
  }

  await AuditLog.create({
    actorUserId: adminId,
    entityType: 'User',
    entityId: userId,
    action: 'ADMIN_DELETE_USER',
    metadata: { email, role }
  });

  return true;
};

// --- New MVP Methods for Submissions, Withdrawals, and Trust Score ---

const getSubmissions = async (queryFilters) => {
  const { status, page = 1, limit = 20 } = queryFilters;
  const filter = {};
  if (status) filter.trackingStatus = status;

  const skip = (page - 1) * limit;

  const submissions = await Submission.find(filter)
    .populate('creatorId', 'email')
    .populate('campaignId', 'title rewardType rewardAmount')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit * 1);

  const total = await Submission.countDocuments(filter);

  return {
    items: submissions,
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page, 10),
      limit: parseInt(limit, 10)
    }
  };
};

const updateSubmissionReview = async (adminId, submissionId, status, reason) => {
  const submission = await Submission.findById(submissionId).populate('campaignId');
  if (!submission) throw new AppError('Submission not found', 404);

  // If already approved previously, don't allow double-dipping the ledger
  if (submission.trackingStatus === 'approved' && status === 'approved') {
    throw new AppError('Submission is already approved.', 400);
  }

  const reviewStatus = status === 'approved' ? 'approved' : 'rejected';
  submission.reviewStatus = reviewStatus;
  // Map review decision to the correct trackingStatus enum value
  submission.trackingStatus = status === 'approved' ? 'completed' : 'rejected';
  if (reason) submission.notes = reason;

  // Process Trust Engine hooks
  if (status === 'approved') {
    submission.payoutEligible = true;
    const earningAmount = calculateEarnings(submission.campaignId, submission.metrics);
    submission.calculatedEarnings = earningAmount;
    
    // Explicit ledger credit mapping
    await ledgerService.createLedgerCredit({
      creatorId: submission.creatorId,
      campaignId: submission.campaignId._id,
      submissionId: submission._id,
      amount: earningAmount,
      status: 'cleared', // MVP behavior makes approved instantly cleared
      description: `Admin Manual Approval: ${submission.campaignId.title}`
    });

    // Update campaign budget
    await Campaign.findByIdAndUpdate(submission.campaignId._id, {
      $inc: { 
        'stats.approvals': 1,
        spentBudget: earningAmount,
        remainingBudget: -earningAmount
      }
    });

    await reevaluateTrustScore(submission.creatorId, 'approve');
  } else if (status === 'rejected') {
    submission.payoutEligible = false;
    await Campaign.findByIdAndUpdate(submission.campaignId._id, {
      $inc: { 'stats.rejections': 1 }
    });
    await reevaluateTrustScore(submission.creatorId, 'reject');
  }

  await submission.save();

  await AuditLog.create({
    actorUserId: adminId,
    entityType: 'Submission',
    entityId: submission._id,
    action: `ADMIN_REVIEW_SUBMISSION_${status.toUpperCase()}`,
    metadata: { reason }
  });

  return submission;
};

const updateSubmissionMetrics = async (adminId, submissionId, metrics) => {
  const submission = await Submission.findByIdAndUpdate(
    submissionId,
    { metrics: { ...metrics } },
    { new: true }
  );

  if (!submission) throw new AppError('Submission not found', 404);

  await AuditLog.create({
    actorUserId: adminId,
    entityType: 'Submission',
    entityId: submission._id,
    action: `ADMIN_MANUAL_METRICS_OVERRIDE`
  });

  return submission;
};

const getWithdrawals = async (queryFilters) => {
  const { status, page = 1, limit = 20 } = queryFilters;
  const filter = {};
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const withdrawals = await Withdrawal.find(filter)
    .populate('creatorId', 'email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit * 1);

  const total = await Withdrawal.countDocuments(filter);

  return {
    items: withdrawals,
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page, 10),
      limit: parseInt(limit, 10)
    }
  };
};

const updateWithdrawalStatus = async (adminId, withdrawalId, status, notes) => {
  const withdrawal = await Withdrawal.findById(withdrawalId);
  if (!withdrawal) throw new AppError('Withdrawal record not found', 404);

  withdrawal.status = status;
  withdrawal.processedBy = adminId;
  withdrawal.processedAt = new Date();
  if (notes) withdrawal.notes = notes;
  
  if (status === 'paid') withdrawal.processedAt = new Date();
  
  await withdrawal.save();

  // Reflect strictly on the Ledger history
  if (status === 'paid' || status === 'rejected') {
    const ledgerStatus = status === 'paid' ? 'withdrawn' : 'failed';
    
    if (withdrawal.relatedLedgerEntryId) {
      await EarningsLedger.findByIdAndUpdate(withdrawal.relatedLedgerEntryId, { status: ledgerStatus });
    } else {
      // Fallback for any legacy records without the direct link
      await EarningsLedger.updateOne(
        { creatorId: withdrawal.creatorId, transactionType: 'debit', status: 'pending', amount: withdrawal.amount, createdAt: { $gte: withdrawal.createdAt } },
        { $set: { status: ledgerStatus } }
      );
    }
  }

  await AuditLog.create({
    actorUserId: adminId,
    entityType: 'Withdrawal',
    entityId: withdrawal._id,
    action: `ADMIN_WITHDRAWAL_${status.toUpperCase()}`,
  });

  return withdrawal;
};

const overrideUserTrustScore = async (adminId, userId, newScore) => {
  const user = await User.findById(userId);
  if (!user || user.role !== 'creator') throw new AppError('Invalid Creator ID', 404);

  const profile = await CreatorProfile.findOne({ userId });
  if (!profile) throw new AppError('Creator profile not found', 404);

  // Directly mutate integer values overriding algorithmic hooks
  const boundedScore = Math.max(0, Math.min(100, newScore));
  const oldScore = profile.trustScore;
  profile.trustScore = boundedScore;
  
  if (boundedScore < 40) profile.trustLabel = 'New';
  else if (boundedScore < 70) profile.trustLabel = 'Rising';
  else if (boundedScore < 90) profile.trustLabel = 'Trusted';
  else profile.trustLabel = 'Verified';

  await profile.save();

  await AuditLog.create({
    actorUserId: adminId,
    entityType: 'User',
    entityId: userId,
    action: `ADMIN_TRUST_OVERRIDE`,
    metadata: { oldScore, newScore: boundedScore }
  });

  return profile;
};

const deleteSubmission = async (adminId, submissionId) => {
  const submission = await Submission.findByIdAndDelete(submissionId);
  if (!submission) throw new AppError('Submission not found', 404);

  await AuditLog.create({
    actorUserId: adminId,
    entityType: 'Submission',
    entityId: submissionId,
    action: 'ADMIN_DELETE_SUBMISSION',
    metadata: { 
      creatorId: submission.creatorId,
      campaignId: submission.campaignId
    }
  });

  return true;
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getCampaigns,
  updateCampaignStatus,
  getSuspiciousFlags,
  updateSuspiciousFlagStatus,
  getJobLogs,
  deleteCampaign,
  getUserImpact,
  deleteUser,
  getSubmissions,
  updateSubmissionReview,
  updateSubmissionMetrics,
  getWithdrawals,
  updateWithdrawalStatus,
  overrideUserTrustScore,
  deleteSubmission
};
