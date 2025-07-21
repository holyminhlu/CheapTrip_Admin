const mongoose = require('mongoose');
require('dotenv').config();
// Sử dụng biến môi trường MONGO_URI_USERS để kết nối database người dùng
// Ví dụ trong .env: MONGO_URI_USERS=mongodb+srv://username:password@cluster.mongodb.net/CheapTripDB?retryWrites=true&w=majority

const userSchema = new mongoose.Schema({
  email: String,
  fullName: String, // Đổi từ username sang fullName
  phone: String // Thêm trường số điện thoại
}, { collection: 'UserCollection' });

const cheapTripConnection = mongoose.createConnection(process.env.MONGO_URI_USERS, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

module.exports = cheapTripConnection.model('User', userSchema); 