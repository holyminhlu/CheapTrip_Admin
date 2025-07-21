const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const discountsRouter = require('./routes/discounts');

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/DiscountsCheapTripDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Kết nối MongoDB thành công'))
  .catch(err => console.error('Lỗi kết nối MongoDB:', err));

// Route
app.use('/api/discounts', discountsRouter);

const PORT = 5004;
app.listen(PORT, () => {
  console.log(`Server chạy ở http://localhost:${PORT}`);
}); 