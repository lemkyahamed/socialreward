const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');
const AppError = require('../utils/appError');

const getPublicCampaigns = async (queryFilters) => {
  const { search, platform, category, rewardType, sort = 'newest', page = 1, limit = 10 } = queryFilters;

  // Base query: only live campaigns
  const filter = { status: 'live' };

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { shortDescription: { $regex: search, $options: 'i' } }
    ];
  }

  if (platform) filter.platform = platform;
  if (category) filter.category = category;
  if (rewardType) filter.rewardType = rewardType;

  let sortOption = { createdAt: -1 };
  if (sort === 'reward') {
    sortOption = { rewardAmount: -1 };
  } else if (sort === 'oldest') {
    sortOption = { createdAt: 1 };
  }

  const skip = (page - 1) * limit;

  const campaigns = await Campaign.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(limit * 1)
    .select('-__v -fullDescription'); // Don't send full desc in list view to save BW

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

const getCampaignBySlug = async (identifier) => {
  const query = { status: 'live' };
  
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    query._id = identifier;
  } else {
    query.slug = identifier;
  }

  const campaign = await Campaign.findOne(query).populate({
    path: 'brandId',
    select: 'email'
  });

  if (!campaign) {
    throw new AppError('Campaign not found or not live', 404);
  }

  return campaign;
};

// Optional: view count increment
const incrementCampaignView = async (id) => {
  await Campaign.updateOne(
    { _id: id, status: 'live' },
    { $inc: { 'stats.views': 1 } }
  );
  return true;
};

module.exports = {
  getPublicCampaigns,
  getCampaignBySlug,
  incrementCampaignView
};
