const { body, query } = require('express-validator');

const createRoomRules = [
  body('title').trim().notEmpty().withMessage('Tiêu đề không được để trống.')
    .isLength({ max: 200 }).withMessage('Tiêu đề tối đa 200 ký tự.'),
  body('description').trim().notEmpty().withMessage('Mô tả không được để trống.'),
  body('price').notEmpty().withMessage('Giá không được để trống.')
    .isFloat({ min: 0 }).withMessage('Giá phải là số dương.'),
  body('area').notEmpty().withMessage('Diện tích không được để trống.')
    .isFloat({ min: 1 }).withMessage('Diện tích phải là số dương.'),
  body('address').trim().notEmpty().withMessage('Địa chỉ không được để trống.'),
  body('district').trim().notEmpty().withMessage('Quận/Huyện không được để trống.'),
  body('categoryId').notEmpty().withMessage('Danh mục không được để trống.')
    .isInt({ min: 1 }).withMessage('Danh mục không hợp lệ.'),
  body('maxPeople').optional().isInt({ min: 1 }).withMessage('Số người tối đa phải là số nguyên dương.'),
  body('images').optional().isArray().withMessage('Danh sách ảnh phải là mảng URL.'),
];

const updateRoomRules = [
  body('title').optional().trim().isLength({ max: 200 }),
  body('price').optional().isFloat({ min: 0 }),
  body('area').optional().isFloat({ min: 1 }),
  body('categoryId').optional().isInt({ min: 1 }),
  body('maxPeople').optional().isInt({ min: 1 }),
];

const searchRoomRules = [
  query('page').optional({ checkFalsy: true }).isInt({ min: 1 }),
  query('limit').optional({ checkFalsy: true }).isInt({ min: 1, max: 100 }),
  query('minPrice').optional({ checkFalsy: true }).isFloat({ min: 0 }),
  query('maxPrice').optional({ checkFalsy: true }).isFloat({ min: 0 }),
  query('categoryId').optional({ checkFalsy: true }).isInt({ min: 1 }),
];

module.exports = { createRoomRules, updateRoomRules, searchRoomRules };