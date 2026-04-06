const Campaign = require('../models/Campaign');
const CampaignJoin = require('../models/CampaignJoin');
const Submission = require('../models/Submission');
const EarningsLedger = require('../models/EarningsLedger');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');
const ledgerService = require('./ledger.service');

const getDashboardStats = async (creatorId) => {
  const joins = await CampaignJoin.find({ creatorId, status: 'joined' });
  const campaignIds = joins.map(j => j.campaignId);
  
  const activeCampaignsCount = await Campaign.countDocuments({ _id: { $in: campaignIds }, status: 'live' }) || 0;
  
  const submissionsCount = await Submission.countDocuments({ creatorId });
  const approvalsCount = await Submission.countDocuments({ creatorId, reviewStatus: 'approved' });
  const pendingApprovals = await Submission.countDocuments({ creatorId, reviewStatus: 'pending' });

  const [balances, recentEarnings] = await Promise.all([
    ledgerService.getCreatorFinancialSummary(creatorId),
    ledgerService.getRecentEarningsChart(creatorId)
  ]);

  const recentSubmissions = await Submission.find({ creatorId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('campaignId', 'title slug rewardAmount');

  return {
    activeCampaigns: activeCampaignsCount,
    submissionsCount,
    pendingApprovals,
    totalEarnings: balances.totalEarned,
    available: balances.available,
    pending: balances.pending,
    withdrawn: balances.withdrawn,
    recentEarnings,
    recentSubmissions,
    reachLimit: "10K+" // fallback since reach is not modeled yet
  };
};

const getCampaignsWithJoinStatus = async (creatorId, queryFilters) => {
  const { search, platform, rewardType, page = 1, limit = 10 } = queryFilters;
  
  const filter = { status: 'live' };
  if (search) filter.title = { $regex: search, $options: 'i' };
  if (platform) filter.platform = platform;
  if (rewardType) filter.rewardType = rewardType;

  const skip = (page - 1) * limit;

  // Find campaigns
  const campaigns = await Campaign.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit * 1)
    .lean(); // to attach virtual property

  const campaignIds = campaigns.map(c => c._id);

  // Find joins for this creator
  const joins = await CampaignJoin.find({
    creatorId,
    campaignId: { $in: campaignIds }
  }).lean();

  const joinedMap = {};
  joins.forEach(j => { joinedMap[j.campaignId.toString()] = j.status; });

  const total = await Campaign.countDocuments(filter);

  const campaignsWithStatus = campaigns.map(c => ({
    ...c,
    joinStatus: joinedMap[c._id.toString()] || 'unjoined'
  }));

  return {
    items: campaignsWithStatus,
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page, 10),
      limit: parseInt(limit, 10)
    }
  };
};

const getJoinedCampaigns = async (creatorId) => {
  const joins = await CampaignJoin.find({ creatorId, status: 'joined' })
    .populate({
      path: 'campaignId',
      match: { status: { $ne: 'archived' } }
    })
    .sort({ createdAt: -1 });

  return joins.filter(j => j.campaignId !== null);
};

const joinCampaign = async (creatorId, campaignId) => {
  const campaign = await Campaign.findById(campaignId);
  
  if (!campaign) {
    throw new AppError('Campaign not found', 404);
  }
  
  if (campaign.status !== 'live') {
    throw new AppError('Campaign is not live', 400);
  }

  // Check end date
  if (new Date(campaign.endAt) < new Date()) {
    throw new AppError('Campaign has already ended', 400);
  }

  const existingJoin = await CampaignJoin.findOne({ creatorId, campaignId });
  if (existingJoin) {
    throw new AppError('You have already joined this campaign', 400);
  }

  const session = await mongoose.startSession();
  let join;
  
  try {
    session.startTransaction();

    join = await CampaignJoin.create([{ creatorId, campaignId }], { session });
    
    await Campaign.findByIdAndUpdate(
      campaignId,
      { $inc: { 'stats.joins': 1 } },
      { session }
    );

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  return join[0];
};

const submitWork = async (creatorId, campaignId, submissionData) => {
  const join = await CampaignJoin.findOne({ creatorId, campaignId, status: 'joined' });
  
  if (!join) {
    throw new AppError('You must join the campaign before submitting', 403);
  }

  const campaign = await Campaign.findById(campaignId);
  if (!campaign || campaign.status !== 'live') {
    throw new AppError('Campaign is not currently accepting submissions', 400);
  }

  const existingSubmission = await Submission.findOne({ creatorId, campaignId });
  if (existingSubmission) {
    throw new AppError('You have already submitted work for this campaign', 400);
  }

  const session = await mongoose.startSession();
  let submission;

  try {
    session.startTransaction();

    submission = await Submission.create([{
      creatorId,
      campaignId,
      joinId: join._id,
      ...submissionData
    }], { session });

    await Campaign.findByIdAndUpdate(
      campaignId,
      { $inc: { 'stats.submissions': 1 } },
      { session }
    );

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  return submission[0];
};

const getSubmissions = async (creatorId, campaignId) => {
  const query = { creatorId };
  if (campaignId) query.campaignId = campaignId;

  const submissions = await Submission.find(query)
    .populate('campaignId', 'title slug rewardAmount')
    .sort({ createdAt: -1 });

  return submissions;
};

const getEarnings = async (creatorId) => {
  const [balances, ledgers] = await Promise.all([
    ledgerService.getCreatorFinancialSummary(creatorId),
    ledgerService.getCreatorLedger(creatorId)
  ]);

  return {
    ...balances,
    records: ledgers
  };
};

const getCampaignStatus = async (creatorId, campaignId) => {
  const join = await CampaignJoin.findOne({ creatorId, campaignId });
  const submission = await Submission.findOne({ creatorId, campaignId });
  
  return {
    hasJoined: !!join,
    joinId: join ? join._id : null,
    joinStatus: join ? join.status : null,
    hasSubmitted: !!submission,
    submissionStatus: submission ? (submission.status || submission.reviewStatus) : null,
    submissionId: submission ? submission._id : null
  };
};

const completeOnboarding = async (creatorId, data) => {
  const CreatorProfile = require('../models/CreatorProfile');

  const socialAccounts = [];
  if (data.tiktok) socialAccounts.push({ platform: 'tiktok', username: data.tiktok, connected: true });
  if (data.instagram) socialAccounts.push({ platform: 'instagram', username: data.instagram, connected: true });
  if (data.youtube) socialAccounts.push({ platform: 'youtube', username: data.youtube, connected: true });

  const payoutSettings = data.payoutMethod ? {
    provider: data.payoutMethod,
    status: 'active',
    accountName: data.accountName,
    connectedAt: new Date()
  } : undefined;

  const updatePayload = {
    displayName: data.displayName,
    country: data.country,
    creatorCategory: data.niche,
    primaryPlatform: data.primaryPlatform,
    followerRange: data.followerRange,
    isOnboarded: true,
    payoutConnected: !!data.isPayoutConnected,
    $set: {}
  };

  if (socialAccounts.length > 0) {
    updatePayload.$set.socialAccounts = socialAccounts;
  }
  
  if (payoutSettings) {
    updatePayload.$set.payoutSettings = payoutSettings;
  }

  const profile = await CreatorProfile.findOneAndUpdate(
    { userId: creatorId },
    updatePayload,
    { new: true, runValidators: true }
  );

  if (!profile) {
    throw new AppError('Creator profile not found', 404);
  }

  // Allow the frontend to update User display name if they want, but usually it's tied to profile
  // Optional: update the user full name if stored in User model
  
  return profile;
};

module.exports = {
  getDashboardStats,
  getCampaignsWithJoinStatus,
  getJoinedCampaigns,
  joinCampaign,
  submitWork,
  getSubmissions,
  getEarnings,
  getCampaignStatus,
  completeOnboarding
};
