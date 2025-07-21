const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  fullName: String // Đổi từ username sang fullName
}, { collection: 'UserCollection' });

// Kết nối tới CheapTripDB
const cheapTripConnection = mongoose.createConnection('mongodb://localhost:27017/CheapTripDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

module.exports = cheapTripConnection.model('User', userSchema); 