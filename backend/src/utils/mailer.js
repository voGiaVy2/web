const nodemailer = require('nodemailer');

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendMail({ to, subject, html }) {
  // Nếu chưa cấu hình SMTP (môi trường dev/demo), chỉ log ra console thay vì lỗi
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('--- [DEV MODE] Email không được gửi thật, nội dung: ---');
    console.log({ to, subject, html });
    return { simulated: true };
  }

  const transporter = createTransporter();
  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
}

async function sendVerificationEmail(email, token) {
  const link = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  return sendMail({
    to: email,
    subject: 'Xác thực email - Phòng Trọ App',
    html: `<p>Chào bạn,</p><p>Vui lòng bấm vào liên kết dưới đây để xác thực email của bạn:</p>
           <p><a href="${link}">${link}</a></p><p>Liên kết có hiệu lực trong 24 giờ.</p>`,
  });
}

async function sendResetPasswordEmail(email, token) {
  const link = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  return sendMail({
    to: email,
    subject: 'Đặt lại mật khẩu - Phòng Trọ App',
    html: `<p>Chào bạn,</p><p>Bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu. Bấm vào liên kết dưới đây:</p>
           <p><a href="${link}">${link}</a></p><p>Liên kết có hiệu lực trong 15 phút. Nếu không phải bạn, hãy bỏ qua email này.</p>`,
  });
}

module.exports = { sendMail, sendVerificationEmail, sendResetPasswordEmail };
