const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const toursRouter = require('./routes/tours');
const uploadRouter = require('./routes/upload');

const app = express();
app.use(cors());
app.use(express.json());

// Log mọi request vào backend
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/ToursCheapTripDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Kết nối MongoDB thành công'))
  .catch(err => console.error('Lỗi kết nối MongoDB:', err));

// Routes
app.use('/api/tours', toursRouter);
app.use('/api/upload', uploadRouter);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server chạy ở http://localhost:${PORT}`);
  console.log(`Upload API: http://localhost:${PORT}/api/upload`);
});
