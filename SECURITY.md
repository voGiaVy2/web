# Bảo mật — Tổ Ấm

Tài liệu này liệt kê các biện pháp bảo mật đã triển khai, tương ứng tiêu chí "Bảo mật" (1.0đ)
và "Authentication" (1.0đ) trong bảng chấm điểm.

## 1. Mật khẩu
- Hash bằng **bcrypt** (`SALT_ROUNDS = 12`), không bao giờ lưu plaintext.
- Yêu cầu tối thiểu 8 ký tự, có chữ và số (`backend/src/validators/auth.validator.js`).
- Đổi mật khẩu yêu cầu xác minh mật khẩu hiện tại (`changePassword`).

## 2. Xác thực & phân quyền
- **JWT** ký bằng secret riêng cho access token và reset-password token (2 secret khác nhau,
  hết hạn khác nhau: access 7 ngày, reset 15 phút).
- Middleware `protect` kiểm tra token hợp lệ + user còn tồn tại trước khi cho qua.
- Middleware `restrictTo('ADMIN')` chặn các route quản trị theo role — phân quyền User/Admin.
- Route `/api/admin/*` yêu cầu cả đăng nhập lẫn role ADMIN.

## 3. Quên/đặt lại mật khẩu — chống dò email (user enumeration)
- `forgotPassword` luôn trả về cùng một thông báo dù email có tồn tại hay không.
- Token reset được **hash bằng SHA-256** trước khi lưu DB (giống cách lưu session token an toàn),
  so khớp bằng token hash thay vì token gốc.
- Token có thời hạn 15 phút, dùng một lần (xoá sau khi đổi mật khẩu thành công).

## 4. Chống SQL Injection
- Toàn bộ truy vấn qua **Prisma ORM** (parameterized query tự động) — không nối chuỗi SQL thủ công
  ở bất kỳ đâu trong code, kể cả phần tìm kiếm/lọc động trong `room.controller.js`.

## 5. Chống XSS (Cross-Site Scripting)
- Middleware `sanitize.middleware.js` làm sạch đệ quy mọi field string trong `body`, `query`,
  `params` bằng thư viện `xss` trước khi xử lý.
- `helmet()` bật Content-Security-Policy và các header chống XSS mặc định.
- Frontend dùng React (tự động escape nội dung khi render), không dùng `dangerouslySetInnerHTML`.

## 6. Chống CSRF
- API dùng JWT trong header `Authorization: Bearer` (không dùng cookie phiên), nên không có
  bề mặt tấn công CSRF truyền thống dựa trên cookie.
- CORS được whitelist đúng domain frontend qua biến `CLIENT_URL`, chặn request từ origin lạ.

## 7. Rate Limiting — chống brute-force
- `generalLimiter`: 100 request / 15 phút / IP cho toàn bộ API.
- `authLimiter`: 10 request / 15 phút / IP riêng cho `/login`, `/register`, `/forgot-password`,
  `/reset-password` — hạn chế dò mật khẩu hoặc spam đăng ký.

## 8. Các header bảo mật khác
- **Helmet**: set `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`
  (khi chạy HTTPS trên Render/Vercel), CSP mặc định.
- **HPP** (`hpp` middleware): chống HTTP Parameter Pollution.
- **express-mongo-sanitize**: loại bỏ ký tự `$`/`.` khỏi input, phòng operator injection.
- Giới hạn kích thước body JSON còn `10kb` — chống DoS qua payload khổng lồ.

## 9. HTTPS
- Vercel và Render đều tự động cấp SSL/HTTPS miễn phí cho domain `*.vercel.app` / `*.onrender.com`.
  Toàn bộ traffic production đều qua HTTPS mà không cần cấu hình thêm.

## 10. Xác thực email
- Khi đăng ký, hệ thống tạo `emailVerifyToken` ngẫu nhiên (32 byte) và gửi link xác thực.
- Route `GET /api/auth/verify-email?token=...` xác nhận và đánh dấu `isEmailVerified = true`.

## 11. Không lộ thông tin nhạy cảm
- `errorHandler` không trả `stack trace` khi `NODE_ENV=production`.
- Response user luôn loại bỏ field `password`, `resetPasswordToken`, `emailVerifyToken` trước
  khi gửi về client (`toSafeUser`, `select` trong Prisma).
