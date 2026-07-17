const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// Toàn bộ route trong file này yêu cầu đăng nhập + role ADMIN
router.use(protect, restrictTo('ADMIN'));

router.get('/users', adminController.getUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.get('/stats', adminController.getStats);

module.exports = router;
