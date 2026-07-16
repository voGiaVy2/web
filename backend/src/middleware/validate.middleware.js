const { validationResult } = require('express-validator');

/**
 * Chạy sau các rule của express-validator, nếu có lỗi thì trả về 422
 * kèm danh sách lỗi rõ ràng cho từng field.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Dữ liệu đầu vào không hợp lệ.',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = validate;
