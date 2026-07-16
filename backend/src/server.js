require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

// Xử lý lỗi không được catch để tránh crash âm thầm
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Đang tắt server...', err);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Đang tắt server...', err);
  process.exit(1);
});
