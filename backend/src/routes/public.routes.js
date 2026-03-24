const express = require('express');
const publicController = require('../controllers/public.controller');

const router = express.Router();

router.get('/campaigns', publicController.getCampaigns);
router.get('/campaigns/:slug', publicController.getCampaign);
router.post('/campaigns/:id/view', publicController.incrementView);

module.exports = router;
