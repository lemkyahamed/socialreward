const creatorService = require('../services/creator.service');
const asyncHandler = require('../utils/asyncHandler');

const getDashboard = asyncHandler(async (req, res, next) => {
  const stats = await creatorService.getDashboardStats(req.user.id);
  res.status(200).json({ status: 'success', data: stats });
});

const getCampaigns = asyncHandler(async (req, res, next) => {
  const result = await creatorService.getCampaignsWithJoinStatus(req.user.id, req.query);
  res.status(200).json({ status: 'success', data: result });
});

const getJoined = asyncHandler(async (req, res, next) => {
  const result = await creatorService.getJoinedCampaigns(req.user.id);
  res.status(200).json({ status: 'success', data: { items: result } });
});

const joinCampaign = asyncHandler(async (req, res, next) => {
  const join = await creatorService.joinCampaign(req.user.id, req.params.id);
  res.status(201).json({ status: 'success', data: { join } });
});

const submitWork = asyncHandler(async (req, res, next) => {
  const submission = await creatorService.submitWork(req.user.id, req.params.id, req.body);
  res.status(201).json({ status: 'success', data: { submission } });
});

const getSubmissions = asyncHandler(async (req, res, next) => {
  const submissions = await creatorService.getSubmissions(req.user.id, req.params.campaignId);
  res.status(200).json({ status: 'success', data: { items: submissions } });
});

const getEarnings = asyncHandler(async (req, res, next) => {
  const earnings = await creatorService.getEarnings(req.user.id);
  const { records, ...stats } = earnings;
  res.status(200).json({ status: 'success', data: { items: records, stats } });
});

const getCampaignStatus = asyncHandler(async (req, res, next) => {
  const status = await creatorService.getCampaignStatus(req.user.id, req.params.id);
  res.status(200).json({ status: 'success', data: status });
});

const completeOnboarding = asyncHandler(async (req, res, next) => {
  const profile = await creatorService.completeOnboarding(req.user.id, req.body);
  res.status(200).json({ status: 'success', data: { profile } });
});

module.exports = {
  getDashboard,
  getCampaigns,
  getJoined,
  joinCampaign,
  submitWork,
  getSubmissions,
  getEarnings,
  getCampaignStatus,
  completeOnboarding
};
