const jwt = require('jsonwebtoken');

function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function signResetToken(payload) {
  return jwt.sign(payload, process.env.JWT_RESET_SECRET, {
    expiresIn: process.env.JWT_RESET_EXPIRES_IN || '15m',
  });
}

function verifyResetToken(token) {
  return jwt.verify(token, process.env.JWT_RESET_SECRET);
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  signResetToken,
  verifyResetToken,
};
