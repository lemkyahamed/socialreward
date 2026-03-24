const User = require('../models/User');
const CreatorProfile = require('../models/CreatorProfile');
const BrandProfile = require('../models/BrandProfile');
const AppError = require('../utils/appError');
const { generateTokens } = require('../utils/token');

const registerUser = async (userData) => {
  const { email, password, role, profile } = userData;

  // 1. Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already in use', 400);
  }

  // 2. Prevent creating admin through public API
  if (role === 'admin') {
    throw new AppError('Admin registration is not allowed', 403);
  }

  // 3. Create User
  const user = await User.create({
    email,
    passwordHash: password,
    role
  });

  // 4. Create associated profile based on role
  if (role === 'creator') {
    await CreatorProfile.create({
      userId: user._id,
      displayName: profile.displayName || email.split('@')[0],
      // Adding empty defaults if needed
    });
  } else if (role === 'brand') {
    await BrandProfile.create({
      userId: user._id,
      companyName: profile.companyName || email.split('@')[0],
      // Adding empty defaults if needed
    });
  }

  // 5. Generate Tokens
  const tokens = generateTokens(user);

  return { user, ...tokens };
};

const loginUser = async (email, password) => {
  // 1. Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user || !(await user.comparePassword(password, user.passwordHash))) {
    throw new AppError('Incorrect email or password', 401);
  }

  // 2. Check if user is active
  if (user.status === 'suspended') {
    throw new AppError('Your account has been suspended', 403);
  }

  // 3. Increment refresh token version to invalidate old refresh tokens (optional on login, typical on password change, but good for security if we want single-device login. Let's keep it simple for now and not invalidate previous tokens on regular login unless desired).

  // 4. Generate Tokens
  const tokens = generateTokens(user);

  return { user, ...tokens };
};

const invalidateAllTokens = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Invalidate all existing refresh tokens
  user.refreshTokenVersion += 1;
  await user.save({ validateBeforeSave: false });
  
  return true;
};

module.exports = {
  registerUser,
  loginUser,
  invalidateAllTokens
};
