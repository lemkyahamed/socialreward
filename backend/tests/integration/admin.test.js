const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');

describe('Admin Endpoints', () => {
  let adminToken, creatorToken;
  let adminId, creatorId;

  beforeEach(async () => {
    // 1. Manually create an admin in the DB (since registration is blocked)
    const admin = await User.create({
      email: 'admin@test.com',
      passwordHash: 'password123', // Will be hashed by pre-save
      role: 'admin'
    });
    
    const adminLoginRes = await request(app).post('/api/auth/login').send({
      email: 'admin@test.com', password: 'password123'
    });
    adminToken = adminLoginRes.body.data.accessToken;
    adminId = admin._id;

    // 2. Register normal creator
    const creatorRes = await request(app).post('/api/auth/register').send({
      email: 'creator@test.com',
      password: 'password123',
      role: 'creator',
      profile: { displayName: 'Creator' }
    });
    creatorToken = creatorRes.body.data.accessToken;
    creatorId = creatorRes.body.data.user.id;
  });

  describe('Route Protection', () => {
    it('should block non-admins from admin routes', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${creatorToken}`)
        .expect(403);
      expect(res.body.message).toMatch(/do not have permission/i);
    });

    it('should allow admins', async () => {
      await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('PATCH /api/admin/users/:id/status', () => {
    it('should allow admin to suspend user', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${creatorId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'suspended' })
        .expect(200);

      expect(res.body.data.user.status).toBe('suspended');

      // Verify the suspended user can no longer login
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'creator@test.com', password: 'password123' })
        .expect(403);
      
      expect(loginRes.body.message).toMatch(/suspended/i);
    });

    it('should prevent admin from suspending themselves', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${adminId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'suspended' })
        .expect(400);

      expect(res.body.message).toMatch(/cannot suspend your own/i);
    });
  });
});
