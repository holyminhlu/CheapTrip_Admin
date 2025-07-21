const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  tour_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['tour_thuong', 'tour_doan'], required: true },
  image_url: String,
  image: String, // Google Drive image URL
  imageFileId: String, // Google Drive file ID for deletion
  price_per_adult: Number,
  price_per_children: Number,
  review_count: { type: Number, default: 0 },
  average_rating: { type: Number, default: 0 },
  duration: String,
  departure_date: Date,
  hotel: String,
  departure_location: String,
  transportation: String,
  available_slots: Number,
  destination: String,
  file_info: String,
  file_name: String,
  file_view_url: String,
  isHidden: { type: Boolean, default: false }
}, { collection: 'ToursCollection' });

module.exports = mongoose.model('Tour', tourSchema); 