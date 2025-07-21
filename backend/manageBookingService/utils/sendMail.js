const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Lấy từ biến môi trường
    pass: process.env.EMAIL_PASS // Lấy từ biến môi trường
  }
});

async function sendMail({ to, subject, html }) {
  const mailOptions = {
    from: `CheapTrip <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  };
  return transporter.sendMail(mailOptions);
}

module.exports = sendMail; 