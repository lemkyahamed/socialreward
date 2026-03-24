const express = require('express');
const creatorController = require('../controllers/creator.controller');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { submitToCampaignSchema } = require('../validations/creator.validation');

const router = express.Router();

router.use(protect);
router.use(restrictTo('creator'));

router.get('/dashboard', creatorController.getDashboard);
router.get('/campaigns', creatorController.getCampaigns);
router.get('/joined', creatorController.getJoined);
router.post('/campaigns/:id/join', creatorController.joinCampaign);
router.post('/campaigns/:id/submit', validate(submitToCampaignSchema), creatorController.submitWork);
router.get('/submissions', creatorController.getSubmissions);
router.get('/submissions/:campaignId', creatorController.getSubmissions);
router.get('/earnings', creatorController.getEarnings);

module.exports = router;
