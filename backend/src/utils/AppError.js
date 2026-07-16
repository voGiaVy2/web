/**
 * Lớp lỗi tuỳ chỉnh dùng xuyên suốt ứng dụng
 * để trả về status code + message rõ ràng cho client.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Lỗi được kiểm soát (không phải bug lạ)
    Error.captureStackTrace(this, this.constructor);
  }
}

// Bọc các hàm async trong controller để tự động catch lỗi
// và chuyển vào middleware xử lý lỗi tập trung -> tránh lặp try/catch
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { AppError, catchAsync };
