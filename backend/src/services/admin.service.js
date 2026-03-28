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

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getCampaigns,
  updateCampaignStatus,
  getSuspiciousFlags,
  updateSuspiciousFlagStatus,
  getJobLogs,
  deleteCampaign
};
