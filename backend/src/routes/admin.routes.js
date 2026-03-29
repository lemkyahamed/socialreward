const express = require('express');
const adminController = require('../controllers/admin.controller');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { 
  updateUserStatusSchema,
  updateCampaignStatusAdminSchema,
  updateSuspiciousFlagSchema
} = require('../validations/admin.validation');

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));

router.get('/dashboard', adminController.getDashboard);

router.get('/users', adminController.getUsers);
router.patch('/users/:id/status', validate(updateUserStatusSchema), adminController.updateUserStatus);
router.get('/users/:id/impact', adminController.getUserImpact);
router.delete('/users/:id', adminController.deleteUser);

router.get('/campaigns', adminController.getCampaigns);
router.patch('/campaigns/:id/status', validate(updateCampaignStatusAdminSchema), adminController.updateCampaignStatus);
router.delete('/campaigns/:id', adminController.deleteCampaign);

router.get('/suspicious', adminController.getSuspicious);
router.patch('/suspicious/:id', validate(updateSuspiciousFlagSchema), adminController.updateSuspiciousStatus);

router.get('/jobs', adminController.getJobs);

module.exports = router;
