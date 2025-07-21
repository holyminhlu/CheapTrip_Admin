const User = require('../models/User');
const sendMail = require('../utils/sendMail');

// Lấy tất cả user
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Vô hiệu hóa user
exports.disableUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'disabled' }, { new: true });
    if (!user) return res.status(404).json({ error: 'Không tìm thấy user' });

    console.log('Preparing to send disable mail to:', user.email);
    await sendMail({
      to: user.email,
      subject: 'Thông báo: Tài khoản của bạn đã bị vô hiệu hóa - CheapTrip',
      html: `
        <div style="font-family: Arial, sans-serif; background: #f8fcff; padding: 24px;">
          <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 16px #e6f7fb; padding: 32px;">
            <h2 style="color: #ff4d4f;">Tài khoản của bạn đã bị vô hiệu hóa</h2>
            <p>Xin chào <b>${user.fullName || user.username}</b>,</p>
            <p>Chúng tôi xin thông báo rằng tài khoản của bạn trên hệ thống <b>CheapTrip</b> đã bị <b>vô hiệu hóa</b> do vi phạm chính sách hoặc theo yêu cầu của quản trị viên.</p>
            <p>Nếu bạn cho rằng đây là sự nhầm lẫn hoặc cần hỗ trợ thêm, vui lòng liên hệ <a href="mailto:support@cheaptrip.vn">support@cheaptrip.vn</a> để được giải đáp.</p>
            <p style="color: #888; font-size: 0.95em;">CheapTrip - Hành trình tiết kiệm, trải nghiệm tuyệt vời!</p>
          </div>
        </div>
      `
    });
    console.log('Disable mail sent to:', user.email);

    res.json({ success: true, user });
  } catch (err) {
    console.error('Error in disableUser:', err);
    res.status(400).json({ error: 'Lỗi khi vô hiệu hóa user', details: err });
  }
};

// Gỡ vô hiệu hóa user
exports.enableUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true });
    if (!user) return res.status(404).json({ error: 'Không tìm thấy user' });

    // Gửi mail thông báo chuyên nghiệp
    await sendMail({
      to: user.email,
      subject: 'Thông báo: Tài khoản của bạn đã được kích hoạt lại - CheapTrip',
      html: `
        <div style="font-family: Arial, sans-serif; background: #f8fcff; padding: 24px;">
          <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 16px #e6f7fb; padding: 32px;">
            <h2 style="color: #1bc6e8;">Tài khoản của bạn đã được kích hoạt lại</h2>
            <p>Xin chào <b>${user.fullName || user.username}</b>,</p>
            <p>Tài khoản của bạn trên hệ thống <b>CheapTrip</b> đã được <b>kích hoạt lại</b> và bạn có thể tiếp tục sử dụng các dịch vụ của chúng tôi.</p>
            <p>Nếu bạn cần hỗ trợ thêm, vui lòng liên hệ <a href="mailto:support@cheaptrip.vn">support@cheaptrip.vn</a>.</p>
            <p style="color: #888; font-size: 0.95em;">CheapTrip - Hành trình tiết kiệm, trải nghiệm tuyệt vời!</p>
          </div>
        </div>
      `
    });

    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ error: 'Lỗi khi gỡ vô hiệu hóa user', details: err });
  }
}; 