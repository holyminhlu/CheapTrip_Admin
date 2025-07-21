const Tour = require('../models/Tour');
const Counter = require('../models/Counter');

async function getNextTourId() {
  const counter = await Counter.findByIdAndUpdate(
    { _id: 'tour_id' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return 'T' + counter.seq.toString().padStart(3, '0');
}

// Lấy tất cả tour
exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find();
    res.json(tours);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Lấy tour theo id
exports.getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) return res.status(404).json({ error: 'Không tìm thấy tour' });
    res.json(tour);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Thêm tour mới
exports.createTour = async (req, res) => {
  try {
    // Sinh mã tour tự động
    const tour_id = await getNextTourId();
    const tour = new Tour({ ...req.body, tour_id });
    await tour.save();
    res.status(201).json(tour);
  } catch (err) {
    console.error('Create tour error:', err);
    if (err && err.message) console.error('Error message:', err.message);
    res.status(400).json({ error: 'Lỗi khi thêm tour', details: err });
  }
};

// Sửa tour
exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!tour) return res.status(404).json({ error: 'Không tìm thấy tour' });
    res.json(tour);
  } catch (err) {
    res.status(400).json({ error: 'Lỗi khi cập nhật tour', details: err });
  }
};

// Xóa tour
exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) return res.status(404).json({ error: 'Không tìm thấy tour' });
    res.json({ message: 'Đã xóa tour' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Ẩn nhiều tour
exports.hideManyTours = async (req, res) => {
  try {
    const ids = req.body.ids;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Thiếu danh sách id tour để ẩn' });
    }
    await Tour.updateMany({ _id: { $in: ids } }, { isHidden: true });
    res.json({ success: true, message: 'Đã ẩn các tour thành công!' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi ẩn tour', details: err });
  }
};

// Ẩn/hiện (toggle) một tour
exports.toggleHideTour = async (req, res) => {
  try {
    const { id } = req.params;
    const { isHidden } = req.body;
    if (typeof isHidden !== 'boolean') {
      return res.status(400).json({ error: 'Trường isHidden phải là true hoặc false' });
    }
    const tour = await Tour.findByIdAndUpdate(id, { isHidden }, { new: true });
    if (!tour) return res.status(404).json({ error: 'Không tìm thấy tour' });
    res.json({ success: true, message: `Tour đã được ${(isHidden ? 'ẩn' : 'hiện')} thành công!`, data: tour });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi cập nhật trạng thái ẩn/hiện', details: err });
  }
}; 