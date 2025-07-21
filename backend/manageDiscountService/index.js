require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const discountsRouter = require('./routes/discounts');
const setupSwagger = require('./swaggerDocs');

const app = express();
app.use(cors());
app.use(express.json());

setupSwagger(app);

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI_DISCOUNT, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Kết nối MongoDB thành công'))
  .catch(err => console.error('Lỗi kết nối MongoDB:', err));

// Route
app.use('/api/discounts', discountsRouter);

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
  console.log(`Server chạy ở http://localhost:${PORT}`);
}); 