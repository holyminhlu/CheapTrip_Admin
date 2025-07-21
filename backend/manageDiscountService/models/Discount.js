const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
  discount_id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: String,
  discount_percent: { type: Number, required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  tour_id: [{ type: String, required: true }]
}, { collection: 'DiscountsCollection' });

module.exports = mongoose.model('Discount', discountSchema); 