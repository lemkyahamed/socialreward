const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Campaign = require('../../src/models/Campaign');
const CampaignJoin = require('../../src/models/CampaignJoin');
const Submission = require('../../src/models/Submission');
const Payout = require('../../src/models/Payout');

describe('Brand Endpoints', () => {
  let brand1Token, brand2Token, creatorToken;
  let brand1Id, brand2Id, creatorId;
  let campaignId, submissionId;

  beforeEach(async () => {
    // Brand 1 setup
    const b1 = await request(app).post('/api/auth/register').send({
      email: 'brand1@test.com', password: 'password123', role: 'brand', profile: { companyName: 'Brand 1' }
    });
    brand1Token = b1.body.data.accessToken; brand1Id = b1.body.data.user.id;

    // Brand 2 setup
    const b2 = await request(app).post('/api/auth/register').send({
      email: 'brand2@test.com', password: 'password123', role: 'brand', profile: { companyName: 'Brand 2' }
    });
    brand2Token = b2.body.data.accessToken; brand2Id = b2.body.data.user.id;

    // Creator setup
    const c1 = await request(app).post('/api/auth/register').send({
      email: 'creator@test.com', password: 'password123', role: 'creator', profile: { displayName: 'Creator' }
    });
    creatorToken = c1.body.data.accessToken; creatorId = c1.body.data.user.id;

    // Brand 1 creates a campaign
    const campRes = await request(app)
      .post('/api/brand/campaigns')
      .set('Authorization', `Bearer ${brand1Token}`)
      .send({
        title: 'B1 Campaign',
        shortDescription: 'This is a valid short description for the campaign.',
        fullDescription: 'This is a much longer and more detailed full description that satisfies the Zod validation requirements of at least 20 characters.',
        platform: 'youtube',
        category: 'Tech',
        rewardAmount: 500,
        budgetTotal: 5000,
        maxCreators: 10,
        instructions: 'Submit video',
        startAt: new Date().toISOString(),
        endAt: new Date(Date.now() + 86400000).toISOString()
      });
    campaignId = campRes.body.data.campaign._id;

    // Make it live
    await request(app).patch(`/api/brand/campaigns/${campaignId}/status`).set('Authorization', `Bearer ${brand1Token}`).send({ status: 'live' });

    // Creator joins and submits
    await request(app).post(`/api/creator/campaigns/${campaignId}/join`).set('Authorization', `Bearer ${creatorToken}`);
    const subRes = await request(app).post(`/api/creator/campaigns/${campaignId}/submit`).set('Authorization', `Bearer ${creatorToken}`).send({
      submissionType: 'url',
      contentUrl: 'https://youtube.com/watch?v=123'
    });
    submissionId = subRes.body.data.submission._id;
  });

  describe('Campaign Access Isolation', () => {
    it('brand 2 cannot access brand 1 campaign', async () => {
      const res = await request(app)
        .get(`/api/brand/campaigns/${campaignId}`)
        .set('Authorization', `Bearer ${brand2Token}`)
        .expect(404); // Not found due to ownership check
    });

    it('brand 2 cannot approve brand 1 submission', async () => {
      const res = await request(app)
        .post(`/api/brand/submissions/${submissionId}/approve`)
        .set('Authorization', `Bearer ${brand2Token}`)
        .expect(403);
      expect(res.body.message).toMatch(/do not own this campaign/i);
    });
  });

  describe('Submission Review', () => {
    it('approving a submission creates a payout', async () => {
      const res = await request(app)
        .post(`/api/brand/submissions/${submissionId}/approve`)
        .set('Authorization', `Bearer ${brand1Token}`)
        .expect(200);

      expect(res.body.data.submission.reviewStatus).toBe('approved');

      // Verify payout was created inside transaction
      const payout = await Payout.findOne({ submissionId });
      expect(payout).toBeTruthy();
      expect(payout.amount).toBe(500); // from campaign
      expect(payout.status).toBe('pending');
    });

    it('rejecting requires a reason', async () => {
        const noReasonRes = await request(app)
          .post(`/api/brand/submissions/${submissionId}/reject`)
          .set('Authorization', `Bearer ${brand1Token}`)
          .send({})
          .expect(400); // Validation fails
  
        const validRes = await request(app)
          .post(`/api/brand/submissions/${submissionId}/reject`)
          .set('Authorization', `Bearer ${brand1Token}`)
          .send({ rejectionReason: 'Quality is too low' })
          .expect(200);
  
        expect(validRes.body.data.submission.reviewStatus).toBe('rejected');
        expect(validRes.body.data.submission.rejectionReason).toBe('Quality is too low');
    });
  });
});
