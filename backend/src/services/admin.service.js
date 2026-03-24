const User = require('../models/User');
const Campaign = require('../models/Campaign');
const SuspiciousFlag = require('../models/SuspiciousFlag');
const JobLog = require('../models/JobLog');
const AppError = require('../utils/appError');
const AuditLog = require('../models/AuditLog');

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

  return {
    totalUsers,
    totalLiveCampaigns: totalCampaigns,
    openSuspiciousCount: openSuspicious,
    failedJobsCount: failedJobs,
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
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit * 1);

  const total = await User.countDocuments(filter);

  return {
    users,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page, 10),
    totalUsers: total
  };
};

const updateUserStatus = async (adminId, userId, status) => {
  const user = await User.findById(userId);
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
    campaigns,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page, 10),
    totalCampaigns: total
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
    flags,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page, 10),
    totalFlags: total
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
    jobs,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page, 10),
    totalJobs: total
  };
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getCampaigns,
  updateCampaignStatus,
  getSuspiciousFlags,
  updateSuspiciousFlagStatus,
  getJobLogs
};
