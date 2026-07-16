const express = require('express');
const router = express.Router();

const bookingController = require('../controllers/booking.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

router.post('/', protect, bookingController.createBooking);
router.get('/', protect, restrictTo('ADMIN'), bookingController.getAllBookings);
router.get('/me', protect, bookingController.getMyBookings);
router.put('/:id/status', protect, restrictTo('ADMIN'), bookingController.updateBookingStatus);

module.exports = router;
