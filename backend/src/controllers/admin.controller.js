const adminService = require('../services/admin.service');
const asyncHandler = require('../utils/asyncHandler');

const getDashboard = asyncHandler(async (req, res, next) => {
  const stats = await adminService.getDashboardStats();
  res.status(200).json({ status: 'success', data: stats });
});

const getUsers = asyncHandler(async (req, res, next) => {
  const result = await adminService.getUsers(req.query);
  res.status(200).json({ status: 'success', data: result });
});

const updateUserStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const user = await adminService.updateUserStatus(req.user.id, req.params.id, status);
  res.status(200).json({ status: 'success', data: { user } });
});

const getCampaigns = asyncHandler(async (req, res, next) => {
  const result = await adminService.getCampaigns(req.query);
  res.status(200).json({ status: 'success', data: result });
});

const updateCampaignStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const campaign = await adminService.updateCampaignStatus(req.user.id, req.params.id, status);
  res.status(200).json({ status: 'success', data: { campaign } });
});

const getSuspicious = asyncHandler(async (req, res, next) => {
  const result = await adminService.getSuspiciousFlags(req.query);
  res.status(200).json({ status: 'success', data: result });
});

const updateSuspiciousStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const flag = await adminService.updateSuspiciousFlagStatus(req.user.id, req.params.id, status);
  res.status(200).json({ status: 'success', data: { flag } });
});

const getJobs = asyncHandler(async (req, res, next) => {
  const result = await adminService.getJobLogs(req.query);
  res.status(200).json({ status: 'success', data: result });
});

const deleteCampaign = asyncHandler(async (req, res, next) => {
  await adminService.deleteCampaign(req.user.id, req.params.id);
  res.status(200).json({ status: 'success', data: null });
});

const getUserImpact = asyncHandler(async (req, res, next) => {
  const impact = await adminService.getUserImpact(req.params.id);
  res.status(200).json({ status: 'success', data: impact });
});

const deleteUser = asyncHandler(async (req, res, next) => {
  await adminService.deleteUser(req.user.id, req.params.id);
  res.status(200).json({ status: 'success', data: null });
});

module.exports = {
  getDashboard,
  getUsers,
  updateUserStatus,
  getCampaigns,
  updateCampaignStatus,
  getSuspicious,
  updateSuspiciousStatus,
  getJobs,
  deleteCampaign,
  getUserImpact,
  deleteUser
};
