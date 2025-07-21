const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bookingsRouter = require('./routes/bookings');

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
mongoose.connect('mongodb+srv://nguyenhuuluan19092004zz:DtZp6M56ZYgYqprV@clustercheaptrip.fct1xpg.mongodb.net/BookingToursCheapTripDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Kết nối MongoDB thành công'))
  .catch(err => console.error('Lỗi kết nối MongoDB:', err));

// Route
app.use('/api/bookings-with-username', bookingsRouter);
app.use('/api/bookings', bookingsRouter);

const PORT = 5002;
app.listen(PORT, () => {
  console.log(`Server chạy ở http://localhost:${PORT}`);
});
