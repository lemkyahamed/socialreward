const jwt = require('jsonwebtoken');

const generateToken = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn });
};

const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};

const generateTokens = (user) => {
  const payload = {
    id: user._id,
    role: user.role,
    tokenVersion: user.refreshTokenVersion || 0
  };

  const accessToken = generateToken(
    payload,
    process.env.JWT_ACCESS_SECRET,
    process.env.JWT_ACCESS_EXPIRES_IN || '15m'
  );

  const refreshToken = generateToken(
    payload,
    process.env.JWT_REFRESH_SECRET,
    process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  );

  return { accessToken, refreshToken };
};

const setCookies = (res, refreshToken) => {
  res.cookie(process.env.COOKIE_NAME || 'refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Use strict or none depending on frontend location
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days matching refresh token
  });
};

const clearCookies = (res) => {
  res.clearCookie(process.env.COOKIE_NAME || 'refresh_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
};

module.exports = {
  generateToken,
  verifyToken,
  generateTokens,
  setCookies,
  clearCookies
};
