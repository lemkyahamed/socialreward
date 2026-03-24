jest.setTimeout(30000);
const { connect, closeDatabase, clearDatabase } = require('./db');

beforeAll(async () => {
  // Ensure we don't accidentally connect to prod/dev db during tests
  process.env.NODE_ENV = 'development';
  process.env.JWT_ACCESS_SECRET = 'test_access_secret';
  process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
  process.env.COOKIE_NAME = 'test_refresh_token';
  
  await connect();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});
