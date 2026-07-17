const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { catchAsync, AppError } = require('../utils/AppError');
const { signAccessToken, signResetToken, verifyResetToken } = require('../utils/jwt');
const { sendVerificationEmail, sendResetPasswordEmail } = require('../utils/mailer');

const SALT_ROUNDS = 12;

// Loại bỏ field nhạy cảm trước khi trả về client
function toSafeUser(user) {
  const { password, resetPasswordToken, resetPasswordExpires, emailVerifyToken, ...safe } = user;
  return safe;
}

// POST /api/auth/register
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return next(new AppError('Email này đã được đăng ký.', 409));
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const emailVerifyToken = crypto.randomBytes(32).toString('hex');

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, emailVerifyToken },
  });

  try {
    await sendVerificationEmail(email, emailVerifyToken);
  } catch (e) {
    console.error('Gửi email xác thực thất bại:', e.message);
  }

  const token = signAccessToken({ id: user.id, role: user.role });

  res.status(201).json({
    success: true,
    message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
    token,
    user: toSafeUser(user),
  });
});

// POST /api/auth/login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  // Thông báo lỗi chung chung (không tiết lộ email có tồn tại hay không) -> chống user enumeration
  if (!user) {
    return next(new AppError('Email hoặc mật khẩu không đúng.', 401));
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new AppError('Email hoặc mật khẩu không đúng.', 401));
  }

  const token = signAccessToken({ id: user.id, role: user.role });

  res.json({
    success: true,
    message: 'Đăng nhập thành công.',
    token,
    user: toSafeUser(user),
  });
});

// GET /api/auth/verify-email?token=...
exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.query;
  if (!token) return next(new AppError('Thiếu token xác thực.', 400));

  const user = await prisma.user.findFirst({ where: { emailVerifyToken: token } });
  if (!user) return next(new AppError('Token xác thực không hợp lệ hoặc đã được sử dụng.', 400));

  await prisma.user.update({
    where: { id: user.id },
    data: { isEmailVerified: true, emailVerifyToken: null },
  });

  res.json({ success: true, message: 'Xác thực email thành công.' });
});

// POST /api/auth/forgot-password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  // Luôn trả về cùng 1 message dù email có tồn tại hay không -> chống user enumeration
  const genericMessage = 'Nếu email tồn tại trong hệ thống, một liên kết đặt lại mật khẩu đã được gửi.';

  if (!user) {
    return res.json({ success: true, message: genericMessage });
  }

  const resetToken = signResetToken({ id: user.id });
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: new Date(Date.now() + 15 * 60 * 1000), // 15 phút
    },
  });

  try {
    await sendResetPasswordEmail(email, resetToken);
  } catch (e) {
    console.error('Gửi email reset password thất bại:', e.message);
  }

  res.json({ success: true, message: genericMessage });
});

// POST /api/auth/reset-password
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token, password } = req.body;

  let decoded;
  try {
    decoded = verifyResetToken(token);
  } catch (e) {
    return next(new AppError('Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.', 400));
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await prisma.user.findFirst({
    where: {
      id: decoded.id,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { gt: new Date() },
    },
  });

  if (!user) {
    return next(new AppError('Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.', 400));
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword, resetPasswordToken: null, resetPasswordExpires: null },
  });

  res.json({ success: true, message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.' });
});

// POST /api/auth/change-password (yêu cầu đăng nhập)
exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return next(new AppError('Mật khẩu hiện tại không đúng.', 401));
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });

  res.json({ success: true, message: 'Đổi mật khẩu thành công.' });
});

// GET /api/auth/me (yêu cầu đăng nhập)
exports.getMe = catchAsync(async (req, res) => {
  res.json({ success: true, user: req.user });
});
