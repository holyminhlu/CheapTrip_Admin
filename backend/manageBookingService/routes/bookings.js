const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Route mới cho bookings-with-username
router.get('/with-username', bookingController.getAllBookings);

// CRUD
router.get('/', bookingController.getAllBookings);
router.get('/:id', bookingController.getBookingById);
router.post('/', bookingController.createBooking);
router.put('/:id', bookingController.updateBooking);
router.put('/:id/refund', bookingController.refundBooking);

module.exports = router; 