const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  booking_id: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  username: String,
  tour_id: { type: String, required: true },
  booking_type: { type: String, enum: ['tour_thuong', 'tour_doan'], required: true },
  adult: { type: Number, default: 1 },
  children: { type: Number, default: 0 },
  total_amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'canceled'], default: 'pending' },
  payment_status: { type: String, enum: ['đã thanh toán', 'chưa thanh toán'], default: 'chưa thanh toán' },
  time_booking: { type: Date, default: Date.now },
  note: String
}, { collection: 'bookingtourscollections' });

module.exports = mongoose.model('Booking', bookingSchema); 