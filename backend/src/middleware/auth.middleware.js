const { verifyAccessToken } = require('../utils/jwt');
const { AppError } = require('../utils/AppError');
const prisma = require('../config/prisma');

/**
 * Xác thực người dùng qua JWT trong header Authorization: Bearer <token>
 */
const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.', 401));
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      return next(new AppError('Token không hợp lệ hoặc đã hết hạn.', 401));
    }

    const currentUser = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!currentUser) {
      return next(new AppError('Người dùng của token này không còn tồn tại.', 401));
    }

    // Gắn user vào request, không đính kèm password
    const { password, resetPasswordToken, ...safeUser } = currentUser;
    req.user = safeUser;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Giới hạn quyền truy cập theo role (VD: chỉ ADMIN)
 */
const restrictTo = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError('Bạn không có quyền thực hiện hành động này.', 403));
  }
  next();
};

module.exports = { protect, restrictTo };
