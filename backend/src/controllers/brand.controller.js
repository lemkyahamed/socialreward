const brandService = require('../services/brand.service');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

const getDashboard = asyncHandler(async (req, res, next) => {
  const stats = await brandService.getDashboardStats(req.user.id);
  res.status(200).json({ status: 'success', data: stats });
});

const onboardBrand = asyncHandler(async (req, res, next) => {
  const profile = await brandService.onboardBrand(req.user.id, req.body);
  res.status(200).json({ status: 'success', data: { profile } });
});

const createCampaign = asyncHandler(async (req, res, next) => {
  const campaign = await brandService.createCampaign(req.user.id, req.body);
  res.status(201).json({ status: 'success', data: { campaign } });
});

const getCampaigns = asyncHandler(async (req, res, next) => {
  const result = await brandService.getCampaigns(req.user.id, req.query);
  res.status(200).json({ status: 'success', data: result });
});

const getCampaign = asyncHandler(async (req, res, next) => {
  const campaign = await brandService.getCampaignById(req.user.id, req.params.id);
  res.status(200).json({ status: 'success', data: { campaign } });
});

const updateCampaign = asyncHandler(async (req, res, next) => {
  const campaign = await brandService.updateCampaign(req.user.id, req.params.id, req.body);
  res.status(200).json({ status: 'success', data: { campaign } });
});

const updateCampaignStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const campaign = await brandService.updateCampaignStatus(req.user.id, req.params.id, status);
  res.status(200).json({ status: 'success', data: { campaign } });
});

const getSubmissions = asyncHandler(async (req, res, next) => {
  const result = await brandService.getSubmissions(req.user.id, req.params.id, req.query);
  res.status(200).json({ status: 'success', data: result });
});

const getAllSubmissions = asyncHandler(async (req, res, next) => {
  const result = await brandService.getAllSubmissions(req.user.id, req.query);
  res.status(200).json({ status: 'success', data: result });
});

const getSubmission = asyncHandler(async (req, res, next) => {
  const submission = await brandService.getSubmissionById(req.user.id, req.params.id);
  res.status(200).json({ status: 'success', data: { submission } });
});

const approveSubmission = asyncHandler(async (req, res, next) => {
  const submission = await brandService.reviewSubmission(req.user.id, req.params.id, 'approve');
  res.status(200).json({ status: 'success', data: { submission } });
});

const rejectSubmission = asyncHandler(async (req, res, next) => {
  const { rejectionReason } = req.body;
  if (!rejectionReason) {
    return next(new AppError('Rejection reason is required', 400));
  }
  const submission = await brandService.reviewSubmission(req.user.id, req.params.id, 'reject', rejectionReason);
  res.status(200).json({ status: 'success', data: { submission } });
});

const getPayouts = asyncHandler(async (req, res, next) => {
  const result = await brandService.getPayouts(req.user.id, req.query);
  res.status(200).json({ status: 'success', data: result });
});

const markPayoutPaid = asyncHandler(async (req, res, next) => {
  const { paymentReference } = req.body;
  const payout = await brandService.markPayoutPaid(req.user.id, req.params.id, paymentReference);
  res.status(200).json({ status: 'success', data: { payout } });
});

module.exports = {
  getDashboard,
  onboardBrand,
  createCampaign,
  getCampaigns,
  getCampaign,
  updateCampaign,
  updateCampaignStatus,
  getSubmissions,
  getAllSubmissions,
  getSubmission,
  approveSubmission,
  rejectSubmission,
  getPayouts,
  markPayoutPaid
};
