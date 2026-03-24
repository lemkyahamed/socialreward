const Campaign = require('../models/Campaign');
const CampaignJoin = require('../models/CampaignJoin');
const Submission = require('../models/Submission');
const Payout = require('../models/Payout');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');

const getDashboardStats = async (creatorId) => {
  const joins = await CampaignJoin.find({ creatorId, status: 'joined' });
  const campaignIds = joins.map(j => j.campaignId);
  
  const activeCampaignsCount = await Campaign.countDocuments({ _id: { $in: campaignIds }, status: 'live' }) || 0;
  
  const submissionsCount = await Submission.countDocuments({ creatorId });
  const approvalsCount = await Submission.countDocuments({ creatorId, reviewStatus: 'approved' });

  const payouts = await Payout.find({ creatorId, status: { $in: ['approved', 'paid'] } });
  const totalEarnings = payouts.reduce((acc, curr) => acc + curr.amount, 0);

  const recentSubmissions = await Submission.find({ creatorId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('campaignId', 'title slug');

  return {
    activeCampaignsCount,
    submissionsCount,
    approvalsCount,
    totalEarnings,
    recentSubmissions
  };
};

const getCampaignsWithJoinStatus = async (creatorId, queryFilters) => {
  const { search, platform, page = 1, limit = 10 } = queryFilters;
  
  const filter = { status: 'live' };
  if (search) filter.title = { $regex: search, $options: 'i' };
  if (platform) filter.platform = platform;

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
    campaigns: campaignsWithStatus,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page, 10),
    totalCampaigns: total
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
  const payouts = await Payout.find({ creatorId })
    .populate('campaignId', 'title slug')
    .sort({ createdAt: -1 });

  const totalEarned = payouts.reduce((sum, p) => p.amount + sum, 0);
  const pendingPayout = payouts.filter(p => ['pending', 'approved'].includes(p.status)).reduce((sum, p) => p.amount + sum, 0);
  const paidOut = payouts.filter(p => p.status === 'paid').reduce((sum, p) => p.amount + sum, 0);

  return {
    totalEarned,
    pendingPayout,
    paidOut,
    records: payouts
  };
};

module.exports = {
  getDashboardStats,
  getCampaignsWithJoinStatus,
  getJoinedCampaigns,
  joinCampaign,
  submitWork,
  getSubmissions,
  getEarnings
};
