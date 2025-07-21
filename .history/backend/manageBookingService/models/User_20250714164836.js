const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  fullName: String // Đổi từ username sang fullName
}, { collection: 'UserCollection' });

// Kết nối tới CheapTripDB
const cheapTripConnection = mongoose.createConnection('mongodb+srv://nguyenhuuluan19092004zz:DtZp6M56ZYgYqprV@clustercheaptrip.fct1xpg.mongodb.net/CheapTripDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

module.exports = cheapTripConnection.model('User', userSchema); 