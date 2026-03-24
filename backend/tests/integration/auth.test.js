const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const CreatorProfile = require('../../src/models/CreatorProfile');

describe('Auth Endpoints', () => {
  const registerPayload = {
    email: 'creator@test.com',
    password: 'password123',
    role: 'creator',
    profile: { displayName: 'Test Creator' }
  };

  describe('POST /api/auth/register', () => {
    it('should register a new creator', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(registerPayload)
        .expect(201);

      expect(res.body.status).toBe('success');
      expect(res.body.data.user.email).toBe(registerPayload.email);
      expect(res.body.data.accessToken).toBeDefined();

      // Ensure profile was created
      const profile = await CreatorProfile.findOne({ userId: res.body.data.user.id });
      expect(profile).toBeTruthy();
      expect(profile.displayName).toBe('Test Creator');
    });

    it('should block duplicate emails', async () => {
      await request(app).post('/api/auth/register').send(registerPayload);
      const res = await request(app)
        .post('/api/auth/register')
        .send(registerPayload)
        .expect(400);

      expect(res.body.message).toMatch(/already in use/i);
    });

    it('should block registering an admin role', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...registerPayload, role: 'admin' })
        .expect(400); // Caught by Zod validation
      expect(res.body.message).toMatch(/Invalid option|creator.*brand/i);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(registerPayload);
    });

    it('should login perfectly with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: registerPayload.email, password: registerPayload.password })
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.accessToken).toBeDefined();

      // Check if refresh token cookie is set
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/test_refresh_token=/);
    });

    it('should block incorrect password', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({ email: registerPayload.email, password: 'wrongpassword' })
        .expect(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should successfully refresh token with valid cookie', async () => {
      // 1. Register and login to get the cookie
      const loginRes = await request(app)
        .post('/api/auth/register')
        .send(registerPayload);

      const cookies = loginRes.headers['set-cookie'];

      // 2. Call refresh endpoint with cookie attached
      const refreshRes = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', cookies)
        .expect(200);

      expect(refreshRes.body.accessToken).toBeDefined();
    });

    it('should fail if no cookie is provided', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .expect(401);
      
      expect(res.body.message).toMatch(/no refresh token/i);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear cookies on logout', async () => {
      const loginRes = await request(app)
        .post('/api/auth/register')
        .send(registerPayload);

      const cookies = loginRes.headers['set-cookie'];

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', cookies)
        .expect(200);

      const logoutCookies = res.headers['set-cookie'];
      expect(logoutCookies[0]).toMatch(/test_refresh_token=;/);
    });
  });
});
