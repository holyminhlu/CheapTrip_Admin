require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bookingsRouter = require('./routes/bookings');
require('dotenv').config({ path: '../.env' });


const app = express();
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI_BOOKING, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Kết nối MongoDB thành công'))
  .catch(err => console.error('Lỗi kết nối MongoDB:', err));

// Route
app.use('/api/bookings-with-username', bookingsRouter);
app.use('/api/bookings', bookingsRouter);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server chạy ở http://localhost:${PORT}`);
});
