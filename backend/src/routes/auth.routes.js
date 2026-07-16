const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');
const {
  registerRules, loginRules, forgotPasswordRules,
  resetPasswordRules, changePasswordRules,
} = require('../validators/auth.validator');

router.post('/register', authLimiter, registerRules, validate, authController.register);
router.post('/login', authLimiter, loginRules, validate, authController.login);
router.get('/verify-email', authController.verifyEmail);
router.post('/forgot-password', authLimiter, forgotPasswordRules, validate, authController.forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordRules, validate, authController.resetPassword);
router.post('/change-password', protect, changePasswordRules, validate, authController.changePassword);
router.get('/me', protect, authController.getMe);

module.exports = router;
