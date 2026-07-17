const { body } = require('express-validator');

const registerRules = [
  body('name').trim().notEmpty().withMessage('Tên không được để trống.')
    .isLength({ min: 2, max: 100 }).withMessage('Tên phải từ 2-100 ký tự.'),
  body('email').trim().notEmpty().withMessage('Email không được để trống.')
    .isEmail().withMessage('Email không hợp lệ.').normalizeEmail(),
  body('password').notEmpty().withMessage('Mật khẩu không được để trống.')
    .isLength({ min: 8 }).withMessage('Mật khẩu phải có ít nhất 8 ký tự.')
    .matches(/\d/).withMessage('Mật khẩu phải chứa ít nhất 1 chữ số.')
    .matches(/[A-Za-z]/).withMessage('Mật khẩu phải chứa ít nhất 1 chữ cái.'),
];

const loginRules = [
  body('email').trim().notEmpty().withMessage('Email không được để trống.')
    .isEmail().withMessage('Email không hợp lệ.').normalizeEmail(),
  body('password').notEmpty().withMessage('Mật khẩu không được để trống.'),
];

const forgotPasswordRules = [
  body('email').trim().notEmpty().withMessage('Email không được để trống.')
    .isEmail().withMessage('Email không hợp lệ.').normalizeEmail(),
];

const resetPasswordRules = [
  body('token').notEmpty().withMessage('Thiếu token đặt lại mật khẩu.'),
  body('password').notEmpty().withMessage('Mật khẩu không được để trống.')
    .isLength({ min: 8 }).withMessage('Mật khẩu phải có ít nhất 8 ký tự.')
    .matches(/\d/).withMessage('Mật khẩu phải chứa ít nhất 1 chữ số.')
    .matches(/[A-Za-z]/).withMessage('Mật khẩu phải chứa ít nhất 1 chữ cái.'),
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Vui lòng nhập mật khẩu hiện tại.'),
  body('newPassword').notEmpty().withMessage('Vui lòng nhập mật khẩu mới.')
    .isLength({ min: 8 }).withMessage('Mật khẩu mới phải có ít nhất 8 ký tự.')
    .matches(/\d/).withMessage('Mật khẩu mới phải chứa ít nhất 1 chữ số.')
    .matches(/[A-Za-z]/).withMessage('Mật khẩu mới phải chứa ít nhất 1 chữ cái.'),
];

module.exports = {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  changePasswordRules,
};
