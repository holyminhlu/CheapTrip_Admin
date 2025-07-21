const Booking = require('../models/Booking');
const User = require('../models/User');
const sendMail = require('../utils/sendMail');
const mongoose = require('mongoose');
require('dotenv').config();
// Sử dụng các biến môi trường sau cho các kết nối:
// MONGO_URI_TOURS=mongodb+srv://username:password@cluster.mongodb.net/ToursCheapTripDB?retryWrites=true&w=majority
// MONGO_URI_BILLS=mongodb+srv://username:password@cluster.mongodb.net/BillsCheapTripDB?retryWrites=true&w=majority

// Import model Tour từ manageToursService
const tourConnection = mongoose.createConnection(process.env.MONGO_URI_TOURS, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const Tour = tourConnection.model('Tour', new mongoose.Schema({
  tour_id: String,
  name: String,
  file_info: String,
  departure_date: Date
}, { collection: 'ToursCollection' }));

// Kết nối tới Bills DB
const billsConnection = mongoose.createConnection(process.env.MONGO_URI_BILLS, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const Bill = billsConnection.model('Bill', new mongoose.Schema({
  bill_id: String,
  created_at: Date,
  status: String,
  tour_id: String,
  adult: String,
  child: String,
  customer_email: String,
  customer_name: String,
  customer_phone: String,
  departure_date: String,
  total_amount: String,
  tour_name: String
}, { collection: 'BillsCollection' }));

// Lấy tất cả booking kèm fullName
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find();
    // Chuẩn hóa email để map chính xác
    const normalizeEmail = (email) => (email || '').toLowerCase().trim();
    const emails = [...new Set(bookings.map(b => normalizeEmail(b.email)))];
    const users = await User.find({ email: { $in: emails } });
    const userMap = {};
    users.forEach(u => { userMap[normalizeEmail(u.email)] = { fullName: u.fullName, phone: u.phone }; });
    const bookingsWithUsername = bookings.map(b => ({
      ...b.toObject(),
      username: userMap[normalizeEmail(b.email)]?.fullName || '',
      phone: userMap[normalizeEmail(b.email)]?.phone || ''
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

    // Trong API xác nhận thanh toán booking (PUT /api/bookings/:id hoặc tương tự)
    if (req.body.status === 'confirmed' && req.body.payment_status === 'đã thanh toán') {
      try {
        console.log('Preparing to send mail and create bill for booking:', booking.booking_id);
        // Gửi mail
        await sendMail({
          to: booking.email,
          subject: 'Xác nhận thanh toán đơn đặt tour - CheapTrip',
          html: `
            <div style="font-family: Arial, sans-serif; background: #f8fcff; padding: 24px;">
              <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 16px #e6f7fb; padding: 32px;">
                <h2 style="color: #1bc6e8;">Xác nhận thanh toán đơn đặt tour</h2>
                <p>Xin chào <b>${booking.username || booking.email}</b>,</p>
                <p>Đơn đặt tour <b>${booking.booking_id}</b> của bạn đã được xác nhận thanh toán thành công.</p>
                <p><b>Mã tour:</b> ${booking.tour_id}</p>
                <p><b>Giá tiền:</b> ${(booking.total_amount || 0).toLocaleString()} VNĐ</p>
                <p>Cảm ơn bạn đã tin tưởng CheapTrip. Nếu cần hỗ trợ, vui lòng liên hệ <a href="mailto:support@cheaptrip.vn">support@cheaptrip.vn</a>.</p>
                <p style="color: #888; font-size: 0.95em;">CheapTrip - Hành trình tiết kiệm, trải nghiệm tuyệt vời!</p>
              </div>
            </div>
          `
        });
        // Lấy thông tin user và tour để điền vào bill
        const user = await User.findOne({ email: booking.email });
        const tour = await Tour.findOne({ tour_id: booking.tour_id });
        // Tạo bill
        const billCount = await Bill.countDocuments();
        const bill_id = 'L' + String(billCount + 1).padStart(3, '0');
        await Bill.create({
          bill_id,
          created_at: new Date(),
          status: 'paid',
          tour_id: booking.tour_id,
          adult: booking.adult,
          child: booking.children,
          customer_email: booking.email,
          customer_name: user?.fullName || booking.username || '',
          customer_phone: user?.phone || booking.phone || '',
          departure_date: booking.time_booking ? new Date(booking.time_booking).toLocaleString() : '',
          total_amount: booking.total_amount ? booking.total_amount.toString() : '',
          tour_name: tour?.name || ''
        });
        console.log('Bill created for booking:', booking.booking_id);
      } catch (err) {
        console.error('Error sending mail or creating bill:', err);
      }
    }
    // Nếu hủy đơn
    if (req.body.status === 'canceled') {
      try {
        await sendMail({
          to: booking.email,
          subject: 'Đơn đặt tour đã bị hủy - CheapTrip',
          html: `
            <div style="font-family: Arial, sans-serif; background: #f8fcff; padding: 24px;">
              <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 16px #e6f7fb; padding: 32px;">
                <h2 style="color: #ff4d4f;">Đơn đặt tour đã bị hủy</h2>
                <p>Xin chào <b>${booking.username || booking.email}</b>,</p>
                <p>Đơn đặt tour <b>${booking.booking_id}</b> của bạn đã bị hủy.</p>
                <p>Nếu có thắc mắc, vui lòng liên hệ <a href="mailto:support@cheaptrip.vn">support@cheaptrip.vn</a> để được hỗ trợ.</p>
                <p style="color: #888; font-size: 0.95em;">CheapTrip - Hành trình tiết kiệm, trải nghiệm tuyệt vời!</p>
              </div>
            </div>
          `
        });
      } catch (err) {
        console.error('Error sending cancel mail:', err);
      }
    }
    res.json(booking);
  } catch (err) {
    res.status(400).json({ error: 'Lỗi khi cập nhật booking', details: err });
  }
};

// Sửa lại: Khi xác nhận thanh toán thì cập nhật cả trạng thái đơn và trạng thái thanh toán
const handleConfirmPayment = async (id) => {
  try {
    const booking = await Booking.findByIdAndUpdate(id, { payment_status: 'đã thanh toán', status: 'confirmed' }, { new: true });
    if (!booking) throw new Error('Không tìm thấy booking');
    // Gửi mail chuyên nghiệp
    await sendMail({
      to: booking.email,
      subject: 'Xác nhận thanh toán đơn đặt tour - CheapTrip',
      html: `
        <div style="font-family: Arial, sans-serif; background: #f8fcff; padding: 24px;">
          <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 16px #e6f7fb; padding: 32px;">
            <h2 style="color: #1bc6e8;">Xác nhận thanh toán đơn đặt tour</h2>
            <p>Xin chào <b>${booking.username || booking.email}</b>,</p>
            <p>Đơn đặt tour <b>${booking.booking_id}</b> của bạn đã được xác nhận thanh toán thành công.</p>
            <p><b>Mã tour:</b> ${booking.tour_id}</p>
            <p><b>Giá tiền:</b> ${(booking.total_amount || 0).toLocaleString()} VNĐ</p>
            <p>Cảm ơn bạn đã tin tưởng CheapTrip. Nếu cần hỗ trợ, vui lòng liên hệ <a href="mailto:support@cheaptrip.vn">support@cheaptrip.vn</a>.</p>
            <p style="color: #888; font-size: 0.95em;">CheapTrip - Hành trình tiết kiệm, trải nghiệm tuyệt vời!</p>
          </div>
        </div>
      `
    });
    // Chỉ tạo bill nếu trạng thái đã xác nhận thanh toán
    if (booking.status === 'confirmed' && booking.payment_status === 'đã thanh toán') {
      try {
        console.log('Creating bill for booking:', booking.booking_id);
        const billCount = await Bill.countDocuments();
        const bill_id = 'L' + String(billCount + 1).padStart(3, '0');
        await Bill.create({
          bill_id,
          created_at: new Date(),
          status: 'paid',
          tour_id: booking.tour_id,
          adult: booking.adult,
          child: booking.children,
          customer_email: booking.email,
          customer_name: booking.username || '',
          customer_phone: booking.phone || '',
          departure_date: booking.time_booking ? new Date(booking.time_booking).toLocaleString() : '',
          total_amount: booking.total_amount ? booking.total_amount.toString() : '',
          tour_name: ''
        });
        console.log('Bill created for booking:', booking.booking_id);
      } catch (billErr) {
        console.error('Error creating bill:', billErr);
      }
    }
    return booking;
  } catch (err) {
    throw err;
  }
};

// Khi hủy đơn thì cập nhật trạng thái đơn và trạng thái thanh toán về chưa thanh toán
const handleCancel = async (id) => {
  try {
    const booking = await Booking.findByIdAndUpdate(id, { status: 'canceled', payment_status: 'chưa thanh toán' }, { new: true });
    if (!booking) throw new Error('Không tìm thấy booking');
    // Gửi mail chuyên nghiệp
    await sendMail({
      to: booking.email,
      subject: 'Đơn đặt tour đã bị hủy - CheapTrip',
      html: `
        <div style="font-family: Arial, sans-serif; background: #f8fcff; padding: 24px;">
          <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 16px #e6f7fb; padding: 32px;">
            <h2 style="color: #ff4d4f;">Đơn đặt tour đã bị hủy</h2>
            <p>Xin chào <b>${booking.username || booking.email}</b>,</p>
            <p>Đơn đặt tour <b>${booking.booking_id}</b> của bạn đã bị hủy.</p>
            <p>Nếu có thắc mắc, vui lòng liên hệ <a href="mailto:support@cheaptrip.vn">support@cheaptrip.vn</a> để được hỗ trợ.</p>
            <p style="color: #888; font-size: 0.95em;">CheapTrip - Hành trình tiết kiệm, trải nghiệm tuyệt vời!</p>
          </div>
        </div>
      `
    });
    return booking;
  } catch (err) {
    throw err;
  }
};

// API hoàn tiền booking
exports.refundBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'refunded', payment_status: 'đã hoàn tiền' },
      { new: true }
    );
    if (!booking) return res.status(404).json({ error: 'Không tìm thấy booking' });

    // Lấy user
    const user = await User.findOne({ email: booking.email });
    // Lấy tour
    const tour = await Tour.findOne({ tour_id: booking.tour_id });
    const fullName = user?.fullName || booking.username || booking.email;
    const phone = user?.phone || booking.phone || '';
    const tourName = tour?.name || booking.tour_id;
    const refundAmount = booking.total_amount ? booking.total_amount.toLocaleString() : '';
    const refundTime = new Date().toLocaleString('vi-VN');
    const email = booking.email;
    const hotline = '1900 636 789';

    // Gửi mail thông báo hoàn tiền
    try {
      await sendMail({
        to: booking.email,
        subject: 'Thông báo hoàn tiền đơn đặt tour - CheapTrip',
        html: `<div style="font-family: Arial, sans-serif; background: #f8fcff; padding: 24px;">
          <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 16px #e6f7fb; padding: 32px;">
            <h2 style="color: #ff9800;">Đơn đặt tour đã được hoàn tiền</h2>
            <p>Xin chào <b>${fullName}</b>,</p>
            <p>Chúng tôi xin thông báo đơn đặt tour có mã đơn: <b>${booking.booking_id}</b> của bạn đã được xử lý hoàn tiền thành công.</p>
            <table style="width:100%; margin: 18px 0; border-collapse: collapse;">
              <tr><td><b>Mã đơn:</b></td><td>${booking.booking_id}</td></tr>
              <tr><td><b>Tên tour:</b></td><td>${tourName}</td></tr>
              <tr><td><b>Số tiền hoàn:</b></td><td>${refundAmount} VNĐ</td></tr>
              <tr><td><b>Thời gian hoàn tiền:</b></td><td>${refundTime}</td></tr>
              <tr><td><b>Email:</b></td><td>${email}</td></tr>
              <tr><td><b>Số điện thoại:</b></td><td>${phone}</td></tr>
            </table>
            <p>Số tiền sẽ được chuyển về tài khoản/thẻ bạn đã sử dụng để thanh toán trong vòng 3-7 ngày làm việc (tùy thuộc vào ngân hàng).</p>
            <p>Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với CheapTrip qua email này hoặc hotline hỗ trợ: <b>${hotline}</b></p>
            <p style="color: #888; font-size: 0.95em;">CheapTrip - Hành trình tiết kiệm, trải nghiệm tuyệt vời!</p>
          </div>
        </div>`
      });
    } catch (err) {
      // Không gửi được mail vẫn hoàn tiền
      console.error('Lỗi gửi mail hoàn tiền:', err);
    }

    // Cập nhật status của Bill liên quan thành 'refunded'
    try {
      await Bill.updateMany(
        {
          customer_email: booking.email,
          tour_id: booking.tour_id,
          total_amount: booking.total_amount ? booking.total_amount.toString() : ''
        },
        { $set: { status: 'refunded' } }
      );
    } catch (err) {
      console.error('Lỗi cập nhật Bill khi hoàn tiền:', err);
    }

    res.json({ success: true, message: 'Đã hoàn tiền cho booking', booking });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi hoàn tiền', details: err });
  }
}; 