const publicService = require('../services/public.service');
const asyncHandler = require('../utils/asyncHandler');
const BrandProfile = require('../models/BrandProfile');

const getCampaigns = asyncHandler(async (req, res, next) => {
  const result = await publicService.getPublicCampaigns(req.query);

  res.status(200).json({
    status: 'success',
    data: result
  });
});

const getCampaign = asyncHandler(async (req, res, next) => {
  const campaign = await publicService.getCampaignBySlug(req.params.slug);
  
  // Attach brand profile info since it's a separate collection
  const brandProfile = await BrandProfile.findOne({ userId: campaign.brandId._id });
  
  const campaignData = campaign.toObject();
  campaignData.brand = brandProfile; // Add formatted brand details

  res.status(200).json({
    status: 'success',
    data: campaignData
  });
});

const incrementView = asyncHandler(async (req, res, next) => {
  await publicService.incrementCampaignView(req.params.id);
  res.status(200).json({
    status: 'success',
    message: 'View count updated'
  });
});

module.exports = {
  getCampaigns,
  getCampaign,
  incrementView
};
