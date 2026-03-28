const Campaign = require('../models/Campaign');
const Submission = require('../models/Submission');
const Payout = require('../models/Payout');
const AuditLog = require('../models/AuditLog');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');
const crypto = require('crypto');

const getDashboardStats = async (brandId) => {
  const activeCampaigns = await Campaign.countDocuments({ brandId, status: 'live' });
  
  const campaigns = await Campaign.find({ brandId });
  const campaignIds = campaigns.map(c => c._id);

  const totalSubmissions = await Submission.countDocuments({ campaignId: { $in: campaignIds } });
  const approvedSubmissions = await Submission.countDocuments({ campaignId: { $in: campaignIds }, reviewStatus: 'approved' });
  const submissionsPending = await Submission.countDocuments({ campaignId: { $in: campaignIds }, reviewStatus: 'pending' });
  
  const approvalRate = totalSubmissions > 0 ? (approvedSubmissions / totalSubmissions) * 100 : 0;

  const payouts = await Payout.find({ brandId, status: { $in: ['approved', 'paid'] } });
  const totalSpend = payouts.reduce((acc, curr) => acc + curr.amount, 0);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const spendAggregation = await Payout.aggregate([
    {
      $match: {
        brandId: new mongoose.Types.ObjectId(brandId),
        status: { $in: ['approved', 'paid'] },
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
        spend: { $sum: "$amount" }
      }
    }
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const spendHistory = [];
  
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    
    const found = spendAggregation.find(a => a._id.month === m && a._id.year === y);
    spendHistory.push({
      month: monthNames[m - 1],
      spend: found ? found.spend : 0
    });
  }

  const recentSubmissions = await Submission.find({ campaignId: { $in: campaignIds } })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('creatorId', 'email')
    .populate('campaignId', 'title');

  return {
    activeCampaigns,
    submissionsPending,
    avgApprovalRate: `${Math.round(approvalRate * 10) / 10}%`,
    totalSpend,
    spendHistory,
    recentSubmissions
  };
};

const createCampaign = async (brandId, campaignData) => {
  // Generate a unique slug based on title and a random string
  const baseSlug = campaignData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const slug = `${baseSlug}-${crypto.randomBytes(3).toString('hex')}`;

  const campaign = await Campaign.create({
    brandId,
    ...campaignData,
    slug,
    status: 'draft' // default
  });

  await AuditLog.create({
    actorUserId: brandId,
    entityType: 'Campaign',
    entityId: campaign._id,
    action: 'CREATE_CAMPAIGN',
    metadata: { title: campaign.title }
  });

  return campaign;
};

const getCampaigns = async (brandId, queryFilters = {}) => {
  const { page = 1, limit = 10 } = queryFilters;
  const skip = (page - 1) * limit;

  const campaigns = await Campaign.find({ brandId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit * 1);

  const total = await Campaign.countDocuments({ brandId });

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

const getCampaignById = async (brandId, campaignId) => {
  const campaign = await Campaign.findOne({ _id: campaignId, brandId });
  if (!campaign) {
    throw new AppError('Campaign not found', 404);
  }
  return campaign;
};

const updateCampaign = async (brandId, campaignId, updateData) => {
  const campaign = await Campaign.findOneAndUpdate(
    { _id: campaignId, brandId },
    updateData,
    { new: true, runValidators: true }
  );

  if (!campaign) {
    throw new AppError('Campaign not found', 404);
  }

  await AuditLog.create({
    actorUserId: brandId,
    entityType: 'Campaign',
    entityId: campaign._id,
    action: 'UPDATE_CAMPAIGN'
  });

  return campaign;
};

const updateCampaignStatus = async (brandId, campaignId, status) => {
  const campaign = await Campaign.findOneAndUpdate(
    { _id: campaignId, brandId },
    { status },
    { new: true }
  );

  if (!campaign) {
    throw new AppError('Campaign not found', 404);
  }

  await AuditLog.create({
    actorUserId: brandId,
    entityType: 'Campaign',
    entityId: campaign._id,
    action: 'UPDATE_CAMPAIGN_STATUS',
    metadata: { status }
  });

  return campaign;
};

const getSubmissions = async (brandId, campaignId, queryFilters) => {
  // Verify ownership
  const campaign = await Campaign.findOne({ _id: campaignId, brandId });
  if (!campaign) {
    throw new AppError('Campaign not found', 404);
  }

  const { status, page = 1, limit = 20 } = queryFilters;
  const filter = { campaignId };
  if (status) filter.reviewStatus = status;

  const skip = (page - 1) * limit;

  const submissions = await Submission.find(filter)
    .populate({
      path: 'creatorId',
      select: 'email',
    })
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

const getSubmissionById = async (brandId, submissionId) => {
  const submission = await Submission.findById(submissionId)
    .populate('campaignId')
    .populate('creatorId', 'firstName lastName avatar email');
    
  if (!submission) {
    throw new AppError('Submission not found', 404);
  }

  if (submission.campaignId.brandId.toString() !== brandId.toString()) {
    throw new AppError('You do not own this campaign', 403);
  }

  return submission;
};

const reviewSubmission = async (brandId, submissionId, action, reason) => {
  const submission = await Submission.findById(submissionId).populate('campaignId');
  if (!submission) {
    throw new AppError('Submission not found', 404);
  }

  if (submission.campaignId.brandId.toString() !== brandId.toString()) {
    throw new AppError('You do not own this campaign', 403);
  }

  if (submission.reviewStatus !== 'pending' && submission.reviewStatus !== 'flagged') {
    throw new AppError(`Submission is already ${submission.reviewStatus}`, 400);
  }

  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    const reviewStatus = action === 'approve' ? 'approved' : 'rejected';
    
    submission.reviewStatus = reviewStatus;
    submission.reviewedBy = brandId;
    submission.reviewedAt = new Date();
    
    if (action === 'reject') {
      if (!reason) throw new AppError('Rejection reason is required', 400);
      submission.rejectionReason = reason;
      
      await Campaign.findByIdAndUpdate(submission.campaignId._id, {
        $inc: { 'stats.rejections': 1 }
      }, { session });
    } else {
      // Create Payout
      await Payout.create([{
        submissionId: submission._id,
        creatorId: submission.creatorId,
        brandId,
        campaignId: submission.campaignId._id,
        amount: submission.campaignId.rewardAmount,
        status: 'pending'
      }], { session });

      await Campaign.findByIdAndUpdate(submission.campaignId._id, {
        $inc: { 'stats.approvals': 1 }
      }, { session });
    }

    await submission.save({ session });

    await AuditLog.create([{
      actorUserId: brandId,
      entityType: 'Submission',
      entityId: submission._id,
      action: action === 'approve' ? 'APPROVE_SUBMISSION' : 'REJECT_SUBMISSION'
    }], { session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  return submission;
};

const getPayouts = async (brandId, queryFilters = {}) => {
  const { status, campaignId, page = 1, limit = 20 } = queryFilters;
  
  const filter = { brandId };
  if (status) filter.status = status;
  if (campaignId) filter.campaignId = campaignId;

  const skip = (page - 1) * limit;

  const payouts = await Payout.find(filter)
    .populate('campaignId', 'title slug')
    .populate('creatorId', 'email firstName lastName avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit * 1);

  const total = await Payout.countDocuments(filter);

  return {
    items: payouts,
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page, 10),
      limit: parseInt(limit, 10)
    }
  };
};

const markPayoutPaid = async (brandId, payoutId, paymentReference) => {
  const payout = await Payout.findOne({ _id: payoutId, brandId });
  if (!payout) {
    throw new AppError('Payout not found', 404);
  }

  if (payout.status === 'paid') {
    throw new AppError('Payout is already paid', 400);
  }

  payout.status = 'paid';
  payout.paidAt = new Date();
  payout.paymentReference = paymentReference || 'Manual Payment';
  await payout.save();

  await AuditLog.create({
    actorUserId: brandId,
    entityType: 'Payout',
    entityId: payout._id,
    action: 'MARK_PAYOUT_PAID',
    metadata: { paymentReference }
  });

  return payout;
};

module.exports = {
  getDashboardStats,
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  updateCampaignStatus,
  getSubmissions,
  getSubmissionById,
  reviewSubmission,
  getPayouts,
  markPayoutPaid
};
