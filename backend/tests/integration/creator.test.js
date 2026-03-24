const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Campaign = require('../../src/models/Campaign');
const CampaignJoin = require('../../src/models/CampaignJoin');
const mongoose = require('mongoose');

describe('Creator Endpoints', () => {
  let creatorToken, brandToken;
  let creatorId, brandId;
  let campaignId;

  beforeEach(async () => {
    // 1. Setup Brand
    const brandRes = await request(app).post('/api/auth/register').send({
      email: 'brand@test.com',
      password: 'password123',
      role: 'brand',
      profile: { companyName: 'Test Brand' }
    });
    brandToken = brandRes.body.data.accessToken;
    brandId = brandRes.body.data.user.id;

    // 2. Setup Creator
    const creatorRes = await request(app).post('/api/auth/register').send({
      email: 'creator@test.com',
      password: 'password123',
      role: 'creator',
      profile: { displayName: 'Test Creator' }
    });
    creatorToken = creatorRes.body.data.accessToken;
    creatorId = creatorRes.body.data.user.id;

    // 3. Create a live Campaign manually (Brand logic tested elsewhere)
    const campaign = await Campaign.create({
      brandId,
      title: 'Test Campaign',
      slug: 'test-campaign',
      shortDescription: 'This is a valid short description for the creator test.',
      fullDescription: 'This is a much longer and more detailed full description that satisfies the Zod validation for creators.',
      platform: 'tiktok',
      category: 'Tech',
      rewardAmount: 100,
      budgetTotal: 1000,
      maxCreators: 10,
      instructions: 'Do this',
      startAt: new Date(),
      endAt: new Date(Date.now() + 86400000), // +1 day
      status: 'live'
    });
    campaignId = campaign._id;
  });

  describe('POST /api/creator/campaigns/:id/join', () => {
    it('should allow creator to join a live campaign', async () => {
      const res = await request(app)
        .post(`/api/creator/campaigns/${campaignId}/join`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .expect(201);

      expect(res.body.status).toBe('success');
      expect(res.body.data.join.campaignId.toString()).toBe(campaignId.toString());

      const updatedCampaign = await Campaign.findById(campaignId);
      expect(updatedCampaign.stats.joins).toBe(1);
    });

    it('should block duplicate joins', async () => {
      // First join
      await request(app)
        .post(`/api/creator/campaigns/${campaignId}/join`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .expect(201);

      // Second join
      const res = await request(app)
        .post(`/api/creator/campaigns/${campaignId}/join`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .expect(400);

      expect(res.body.message).toMatch(/already joined/i);
    });

    it('should block joining if not live', async () => {
      await Campaign.findByIdAndUpdate(campaignId, { status: 'draft' });

      const res = await request(app)
        .post(`/api/creator/campaigns/${campaignId}/join`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .expect(400);
      
      expect(res.body.message).toMatch(/not live/i);
    });
  });

  describe('POST /api/creator/campaigns/:id/submit', () => {
    it('should allow submit to joined campaign', async () => {
      await request(app)
        .post(`/api/creator/campaigns/${campaignId}/join`)
        .set('Authorization', `Bearer ${creatorToken}`);

      const res = await request(app)
        .post(`/api/creator/campaigns/${campaignId}/submit`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          submissionType: 'url',
          contentUrl: 'https://tiktok.com/@creator/video/123'
        })
        .expect(201);

      expect(res.body.status).toBe('success');
      expect(res.body.data.submission.reviewStatus).toBe('pending');
      
      const updatedCampaign = await Campaign.findById(campaignId);
      expect(updatedCampaign.stats.submissions).toBe(1);
    });

    it('should block submit if not joined', async () => {
      const res = await request(app)
        .post(`/api/creator/campaigns/${campaignId}/submit`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          submissionType: 'url',
          contentUrl: 'https://tiktok.com/@creator/video/123'
        })
        .expect(403);

      expect(res.body.message).toMatch(/must join/i);
    });
  });
});
