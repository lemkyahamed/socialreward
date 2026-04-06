const express = require('express');
const creatorController = require('../controllers/creator.controller');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { submitToCampaignSchema, onboardingSchema } = require('../validations/creator.validation');

const router = express.Router();

router.use(protect);
router.use(restrictTo('creator'));

const earningsController = require('../controllers/earnings.controller');

router.post('/onboarding', validate(onboardingSchema), creatorController.completeOnboarding);
router.get('/dashboard', creatorController.getDashboard);
router.get('/campaigns', creatorController.getCampaigns);
router.get('/joined', creatorController.getJoined);
router.get('/campaigns/:id/status', creatorController.getCampaignStatus);
router.post('/campaigns/:id/join', creatorController.joinCampaign);
router.post('/campaigns/:id/submit', validate(submitToCampaignSchema), creatorController.submitWork);
router.get('/submissions', creatorController.getSubmissions);
router.get('/submissions/:campaignId', creatorController.getSubmissions);
router.post('/submissions/:id/sync', earningsController.syncSubmissionMetrics);

router.get('/earnings', creatorController.getEarnings); // Legacy compat route
router.get('/earnings/ledger', earningsController.getCreatorLedger);
router.post('/earnings/withdraw', earningsController.requestWithdrawal);

module.exports = router;
