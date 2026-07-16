const rateLimit = require('express-rate-limit');

// Giới hạn chung cho toàn bộ API
const generalLimiter = rateLimit({
  windowMs: (Number(process.env.RATE_LIMIT_WINDOW_MIN) || 15) * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau ít phút.' },
});

// Giới hạn chặt hơn cho các route nhạy cảm: login, register, forgot-password
// để chống brute-force / credential stuffing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Quá nhiều lần thử. Vui lòng thử lại sau 15 phút.' },
});

module.exports = { generalLimiter, authLimiter };
