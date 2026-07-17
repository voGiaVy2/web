/**
 * Middleware xử lý lỗi tập trung.
 * Không bao giờ lộ stack trace / chi tiết lỗi hệ thống trong production.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Đã có lỗi xảy ra trên máy chủ.';

  // Lỗi Prisma - unique constraint
  if (err.code === 'P2002') {
    statusCode = 409;
    message = `Dữ liệu đã tồn tại (trùng ${err.meta?.target?.join(', ')}).`;
  }
  // Lỗi Prisma - record not found
  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Không tìm thấy dữ liệu.';
  }
  // Lỗi JSON malformed
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Dữ liệu JSON gửi lên không hợp lệ.';
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

const notFound = (req, res, next) => {
  res.status(404).json({ success: false, message: `Route không tồn tại: ${req.originalUrl}` });
};

module.exports = { errorHandler, notFound };
