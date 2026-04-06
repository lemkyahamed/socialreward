const express = require('express');
const brandController = require('../controllers/brand.controller');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { 
  onboardingSchema,
  createCampaignSchema, 
  updateCampaignSchema, 
  updateCampaignStatusSchema,
  reviewSubmissionSchema
} = require('../validations/brand.validation');

const router = express.Router();

router.use(protect);
router.use(restrictTo('brand'));

router.post('/onboarding', validate(onboardingSchema), brandController.onboardBrand);
router.get('/dashboard', brandController.getDashboard);

router.post('/campaigns', validate(createCampaignSchema), brandController.createCampaign);
router.get('/campaigns', brandController.getCampaigns);
router.get('/campaigns/:id', brandController.getCampaign);
router.patch('/campaigns/:id', validate(updateCampaignSchema), brandController.updateCampaign);
router.patch('/campaigns/:id/status', validate(updateCampaignStatusSchema), brandController.updateCampaignStatus);

router.get('/campaigns/:id/submissions', brandController.getSubmissions);
router.get('/submissions', brandController.getAllSubmissions);
router.get('/submissions/:id', brandController.getSubmission);
router.post('/submissions/:id/approve', brandController.approveSubmission);
router.post('/submissions/:id/reject', validate(reviewSubmissionSchema), brandController.rejectSubmission);

router.get('/payouts', brandController.getPayouts);
router.post('/payouts/:id/mark-paid', brandController.markPayoutPaid);

module.exports = router;
