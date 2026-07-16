const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');

const sanitizeInput = require('./middleware/sanitize.middleware');
const { generalLimiter } = require('./middleware/rateLimiter.middleware');
const { errorHandler, notFound } = require('./middleware/error.middleware');

const authRoutes = require('./routes/auth.routes');
const roomRoutes = require('./routes/room.routes');
const categoryRoutes = require('./routes/category.routes');
const bookingRoutes = require('./routes/booking.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Cần thiết khi deploy sau reverse proxy (Render) để rate-limit/IP hoạt động đúng
app.set('trust proxy', 1);

// ---------- Security middleware ----------
app.use(helmet()); // Set các security header (CSP, X-Frame-Options, X-Content-Type-Options...)

const allowedOrigins = (process.env.CLIENT_URL || '').split(',').map((s) => s.trim()).filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép request không có origin (VD: Postman) và các origin trong whitelist
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Không được phép truy cập bởi chính sách CORS.'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10kb' })); // Giới hạn payload -> chống DoS qua body khổng lồ
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(mongoSanitize()); // Loại bỏ ký tự $ . trong input -> chống NoSQL/operator injection
app.use(hpp()); // Chống HTTP Parameter Pollution
app.use(sanitizeInput); // Chống XSS - làm sạch input string

app.use(generalLimiter); // Rate limit chung
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ---------- Routes ----------
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API đang hoạt động.', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
