const Discount = require('../models/Discount');
const Counter = require('../models/Counter');

// Lấy tất cả discount
exports.getAllDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find();
    res.json(discounts);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Hàm sinh mã discount tự động
async function getNextDiscountId() {
  const counter = await Counter.findByIdAndUpdate(
    { _id: 'discount_id' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return 'GG' + counter.seq.toString().padStart(3, '0');
}

// Tạo mới discount
exports.createDiscount = async (req, res) => {
  try {
    const discount_id = await getNextDiscountId();
    const discount = new Discount({ ...req.body, discount_id });
    await discount.save();
    res.status(201).json(discount);
  } catch (err) {
    res.status(400).json({ error: 'Lỗi khi thêm discount', details: err });
  }
};

// Sửa discount
exports.updateDiscount = async (req, res) => {
  try {
    const discount = await Discount.findOneAndUpdate(
      { discount_id: req.params.discount_id },
      req.body,
      { new: true }
    );
    if (!discount) return res.status(404).json({ error: 'Không tìm thấy discount' });
    res.json(discount);
  } catch (err) {
    res.status(400).json({ error: 'Lỗi khi cập nhật discount', details: err });
  }
};

// Xóa discount
exports.deleteDiscount = async (req, res) => {
  try {
    const discount = await Discount.findOneAndDelete({ discount_id: req.params.discount_id });
    if (!discount) return res.status(404).json({ error: 'Không tìm thấy discount' });
    res.json({ message: 'Đã xóa discount' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi xóa discount', details: err });
  }
}; 