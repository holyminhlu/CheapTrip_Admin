const Booking = require('../models/Booking');
const User = require('../models/User');
const sendMail = require('../utils/sendMail');
const mongoose = require('mongoose');

// Import model Tour từ manageToursService
const tourConnection = mongoose.createConnection('mongodb+srv://nguyenhuuluan19092004zz:DtZp6M56ZYgYqprV@clustercheaptrip.fct1xpg.mongodb.net/ToursCheapTripDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const Tour = tourConnection.model('Tour', new mongoose.Schema({
  tour_id: String,
  name: String,
  file_info: String,
  departure_date: Date
}, { collection: 'ToursCollection' }));

// Lấy tất cả booking kèm fullName
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find();
    const emails = [...new Set(bookings.map(b => b.email))];
    const users = await User.find({ email: { $in: emails } });
    const userMap = {};
    users.forEach(u => { userMap[u.email] = u.fullName; });
    const bookingsWithUsername = bookings.map(b => ({
      ...b.toObject(),
      username: userMap[b.email] || ''
    }));
    res.json(bookingsWithUsername);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Lấy booking theo id
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Không tìm thấy booking' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Tạo booking mới
exports.createBooking = async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ error: 'Lỗi khi thêm booking', details: err });
  }
};

// Cập nhật booking (xác nhận/hủy đơn)
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!booking) return res.status(404).json({ error: 'Không tìm thấy booking' });

    // Lấy user
    const user = await User.findOne({ email: booking.email });
    // Lấy tour
    const tour = await Tour.findOne({ tour_id: booking.tour_id });

    // Nếu xác nhận đơn
    if (req.body.status === 'confirmed') {
      const html = `
      <div style="font-family: Arial, sans-serif; background: #f8fcff; padding: 24px;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 16px #e6f7fb; padding: 32px;">
          <h2 style="color: #1bc6e8;">Xác nhận đặt tour thành công!</h2>
          <p>Xin chào <b>${user ? user.fullName : booking.email}</b>,</p>
          <p>Chúng tôi đã xác nhận đơn đặt tour <b>${booking.booking_id}</b> của bạn.</p>
          <table style="width:100%; margin: 18px 0; border-collapse: collapse;">
            <tr><td><b>Tên tour:</b></td><td>${tour ? tour.name : booking.tour_id}</td></tr>
            <tr><td><b>Ngày khởi hành:</b></td><td>${tour && tour.departure_date ? new Date(tour.departure_date).toLocaleDateString('vi-VN') : ''}</td></tr>
            <tr><td><b>Số người lớn:</b></td><td>${booking.adult}</td></tr>
            <tr><td><b>Số trẻ em:</b></td><td>${booking.children}</td></tr>
            <tr><td><b>Tổng tiền:</b></td><td>${booking.total_amount.toLocaleString()} VNĐ</td></tr>
            <tr><td><b>Thông tin tour (PDF):</b></td><td>${tour && tour.file_info ? `<a href='${tour.file_info}'>Tải về</a>` : 'Không có'}</td></tr>
            <tr><td><b>Trạng thái:</b></td><td style="color: #4caf50;"><b>Đã xác nhận</b></td></tr>
          </table>
          <p>Cảm ơn bạn đã tin tưởng CheapTrip. Nếu cần hỗ trợ, vui lòng liên hệ <a href="mailto:support@cheaptrip.vn">support@cheaptrip.vn</a>.</p>
          <p style="color: #888; font-size: 0.95em;">CheapTrip - Hành trình tiết kiệm, trải nghiệm tuyệt vời!</p>
        </div>
      </div>
      `;
      await sendMail({
        to: booking.email,
        subject: 'Xác nhận đặt tour thành công - CheapTrip',
        html
      });
    }

    // Nếu hủy đơn
    if (req.body.status === 'canceled') {
      const html = `
      <div style="font-family: Arial, sans-serif; background: #f8fcff; padding: 24px;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 16px #e6f7fb; padding: 32px;">
          <h2 style="color: #ff4d4f;">Đơn đặt tour đã bị hủy</h2>
          <p>Xin chào <b>${user ? user.fullName : booking.email}</b>,</p>
          <p>Đơn đặt tour <b>${booking.booking_id}</b> của bạn đã bị hủy.</p>
          <table style="width:100%; margin: 18px 0; border-collapse: collapse;">
            <tr><td><b>Tên tour:</b></td><td>${tour ? tour.name : booking.tour_id}</td></tr>
            <tr><td><b>Ngày khởi hành:</b></td><td>${tour && tour.departure_date ? new Date(tour.departure_date).toLocaleDateString('vi-VN') : ''}</td></tr>
            <tr><td><b>Số người lớn:</b></td><td>${booking.adult}</td></tr>
            <tr><td><b>Số trẻ em:</b></td><td>${booking.children}</td></tr>
            <tr><td><b>Tổng tiền:</b></td><td>${booking.total_amount.toLocaleString()} VNĐ</td></tr>
            <tr><td><b>Thông tin tour (PDF):</b></td><td>${tour && tour.file_info ? `<a href='${tour.file_info}'>Tải về</a>` : 'Không có'}</td></tr>
            <tr><td><b>Trạng thái:</b></td><td style="color: #ff4d4f;"><b>Đã hủy</b></td></tr>
          </table>
          <p>Nếu có thắc mắc, vui lòng liên hệ <a href="mailto:support@cheaptrip.vn">support@cheaptrip.vn</a> để được hỗ trợ.</p>
          <p style="color: #888; font-size: 0.95em;">CheapTrip - Hành trình tiết kiệm, trải nghiệm tuyệt vời!</p>
        </div>
      </div>
      `;
      await sendMail({
        to: booking.email,
        subject: 'Đơn đặt tour đã bị hủy - CheapTrip',
        html
      });
    }

    res.json(booking);
  } catch (err) {
    res.status(400).json({ error: 'Lỗi khi cập nhật booking', details: err });
  }
}; 