const authService = require('../services/auth.service');
const { setCookies, clearCookies, verifyToken, generateTokens } = require('../utils/token');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const User = require('../models/User');

const register = asyncHandler(async (req, res, next) => {
  const { user, accessToken, refreshToken } = await authService.registerUser(req.body);

  // Set refresh token in HTTP-only cookie
  setCookies(res, refreshToken);

  // Remove password from output
  user.passwordHash = undefined;

  res.status(201).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        profile: user.profile
      },
      accessToken
    }
  });
});

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.loginUser(email, password);

  // Set refresh token in HTTP-only cookie
  setCookies(res, refreshToken);

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        profile: user.profile
      },
      accessToken
    }
  });
});

const logout = asyncHandler(async (req, res, next) => {
  clearCookies(res);
  res.status(200).json({ status: 'success' });
});

const refresh = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies[process.env.COOKIE_NAME || 'refresh_token'];

  if (!refreshToken) {
    return next(new AppError('No refresh token provided. Please log in again.', 401));
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    return next(new AppError('Invalid or expired refresh token. Please log in again.', 401));
  }

  // Check if user exists and is active
  const user = await User.findById(decoded.id).select('+refreshTokenVersion');
  if (!user || user.status === 'suspended') {
    return next(new AppError('The user belonging to this token no longer exists or is suspended.', 401));
  }

  // Check token version
  if (decoded.tokenVersion !== user.refreshTokenVersion) {
    return next(new AppError('Refresh token invalid. Please log in again.', 401));
  }

  // Generate new tokens
  const tokens = generateTokens(user);

  // Set new refresh token cookie
  setCookies(res, tokens.refreshToken);

  res.status(200).json({
    status: 'success',
    accessToken: tokens.accessToken
  });
});

const CreatorProfile = require('../models/CreatorProfile');
const BrandProfile = require('../models/BrandProfile');

const getMe = asyncHandler(async (req, res, next) => {
  // User is attached to req by protect middleware
  const user = req.user.toObject();

  if (user.role === 'creator') {
    user.profile = await CreatorProfile.findOne({ userId: user._id });
  } else if (user.role === 'brand') {
    user.profile = await BrandProfile.findOne({ userId: user._id });
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        profile: user.profile
      }
    }
  });
});

module.exports = {
  register,
  login,
  logout,
  refresh,
  getMe
};
